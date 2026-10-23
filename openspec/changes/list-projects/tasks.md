# Tasks

## 1. Fixtures

- [x] 1.1 Add `data/projects.json` and `data/project-details.json` in the shape from design.md. First-file order: `c` Cedar, `a` Atlas, `b` Borealis. A second record exists for `a` (domain `atlas.example`, networth 100, country `FI`) and for `c` (domain `cedar.example`, networth 40, country `SE`). `b` has none. Check: both files parse as JSON, ids `a` and `c` are in both, id `b` is only in the first.

## 2. Domain and port

- [x] 2.1 Add `src/domain/project.ts` with the list element (`id`, `name`, `domain`, `networth`, `country`) and no Fastify or file imports. Check: `npm run typecheck` passes.
- [x] 2.2 Add `src/usecase/list-projects.port.ts` with `listProjects` and `findDetails(id)`. Check: `npm run typecheck` passes.

## 3. Adapters

- [x] 3.1 Add `src/adapter/json/projects-json.ts`: it reads `data/projects.json` from `process.cwd()` and returns the rows of the first file. Check: `npm run typecheck` passes.
- [x] 3.2 Add `src/adapter/json/project-details-json.ts`: one file read builds a map, and `findDetails(id)` takes the record from that map instead of opening the disk again. Check: `npm run typecheck` passes.

## 4. Usecase

- [x] 4.1 Add `src/usecase/list-projects.ts`: sort by string `id` with `<`, slice at `(page - 1) * limit`, `total` is the full list length, `findDetails` runs for each id in the slice, and a missing record sets the three fields to `null`. Check: `npm run typecheck` passes.

## 5. HTTP

- [x] 5.1 Add `src/http/list-projects.ts`: it normalizes `page` and `limit` separately (the whole string is decimal digits and the value is at least 1, otherwise 1 and 10), calls one usecase, and returns 200 with `{ items, total }`. Check: `npm run typecheck` passes.
- [x] 5.2 In `src/app.ts`, create the adapters, pass them into the usecase, and register the handler. Do not change `GET /health` or `src/server.ts`. Check: `npm run typecheck` passes.

## 6. Check

- [x] 6.1 `npm run typecheck` passes. Then start the server from the repository root (`npm run dev`) and request it. `GET /projects?page=1&limit=2` returns 200, `items` is id `a` then `b`, `total` is 3, id `a` has the second-record fields filled and `networth` is a number, and id `b` has the three fields `null`. `GET /projects?page=5&limit=2` returns empty `items` and `total` 3. `GET /projects?page=abc&limit=2` matches the first page of two elements. `GET /health` is still `{ "status": "ok" }`.
