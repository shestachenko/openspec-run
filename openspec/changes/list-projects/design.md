# Design

## Context

`src/app.ts` builds Fastify and registers only `GET /health`. `src/server.ts` only listens. `src/` has no handler, usecase, or adapter. Dependencies point inward: handler → usecase → port, an adapter implements the port, and `app.ts` wires them. See proposal.md, Why.

`tsconfig` includes only `src/` and does not copy JSON into `dist/`. There are no new npm packages. Requirements are in `specs/projects/spec.md`.

## Goals / Non-Goals

**Goals:**

- One usecase builds the page: it reads every project, sorts, slices the page, and loads the second record for each id on that page.
- The handler turns `page` and `limit` into numbers before the usecase.
- Both fake databases are JSON on disk. Only the adapter knows the file shape.

**Non-Goals:**

- A second HTTP server.
- A shared `shared/` folder: the port belongs to one usecase.
- A cache across requests, and separate formatting of `networth`.
- Deduplicating `id`. Each row of the first file is a project.
- Wiring in the `GET /users` code from `feature/list-users`.

## Decisions

### The same Fastify app in `src/app.ts`

`buildApp` creates the adapters, passes them into the usecase, and registers the handler. `GET /health` stays in `app.ts`. `server.ts` does not change.

Alternative: a separate `listen` for projects. That splits one process into two servers. The project rule is to extend the app in `src/app.ts`.

### Four layers of one action

```
src/http/list-projects.ts              query -> { page, limit }, response 200
src/usecase/list-projects.ts           sort, slice, join
src/usecase/list-projects.port.ts      listProjects, findDetails
src/domain/project.ts                  list element, no HTTP and no files
src/adapter/json/projects-json.ts      data/projects.json
src/adapter/json/project-details-json.ts
```

Two methods live in one port file because only this usecase needs both. Two adapters exist because the files have different shapes.

Alternative: one adapter returns the page directly. Then the join and the slice move into code that knows the files.

### Slice before the second database

The usecase reads the whole first file, sorts by string `id` with `<`, and takes the slice at `(page - 1) * limit` with length `limit`. For BMP ids this is code-point order. `total` is the length of the full list. It then calls `findDetails` for each id in the slice.

The second-file adapter reads the file once per request and answers `findDetails(id)` from that map. The per-id call stays in the usecase. The disk is not opened for every id.

Alternative: read the second database for every project, then sort and slice. The result is the same, but the second read no longer depends on the page.

No record means the usecase sets `domain`, `networth`, and `country` to `null`. A record that lacks one field sets that field to `null` and keeps the other fields from the file.

### Files and cwd

`app.ts` sets the paths: `data/projects.json` and `data/project-details.json` from `process.cwd()`. `npm run dev` and `npm start` run from the repository root.

Alternative: a path from `import.meta.url`. After `tsc` the file sits under `dist/`, and JSON is not copied there.

Shape:

```
projects.json: [{ "id": "a", "name": "Atlas" }]

project-details.json: [{
  "id": "a",
  "domain": "atlas.example",
  "networth": 100,
  "country": "FI"
}]
```

The set has three rows in file order `c`, `a`, `b`: `a` Atlas and `c` Cedar have a second record, `b` Borealis does not. `a` has networth 100. After sorting the order is `a`, `b`, `c`, so a request to the running server shows the join, `null`, and the sort.

### Query in the handler

The handler inspects each value on its own. The whole string is decimal digits and the number is at least 1, so that number is used. Otherwise `page` becomes 1 and `limit` becomes 10. A repeated query (`page=1&page=2`) is not such digits and also falls back to the default. The usecase receives numbers.

## Risks / Trade-offs

- [Every request reads both files in full] → Fine for fixtures. The port stays `findDetails(id)`, so the file can later become another source without changing the handler.
- [A large `limit` builds a long `items`] → There is no upper bound: that is the specified behavior. Memory is bounded by the JSON size.
- [A JSON edit is invisible until the next request reads the file] → Read on every request, with no process cache. A restart is not required.
- [A repeated `id` in the first file yields two rows] → The spec counts rows as projects. There is no separate uniqueness rule.
- [String `<` for ids outside the BMP follows UTF-16 code units] → Fixtures and the spec use BMP ids, where that order matches code points.

## Migration Plan

The route is new. Existing requests do not change. Rollback removes the `GET /projects` registration and the files of this action.
