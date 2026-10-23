# Proposal

## Why

The working tree only has `GET /health`. One request should assemble a project from two fake databases and return a page to the UI.

## What Changes

- New route `GET /projects`.
- Query: `page` and `limit`. A missing value, a value that is not an integer, or a value below 1 falls back to its own default: `page=1`, `limit=10`. A valid neighboring parameter stays as given.
- Response `200`: `{ items, total }`. `total` is the number of projects in the first database.
- An `items` element has `id` and `name` from the first database, and `domain`, `networth`, and `country` from the second database, matched by `id`.
- `id` is a string. The list is sorted by `id` in ascending code-point order, then sliced into a page.
- When `page` starts past the last project, `items` is empty and `total` stays complete.
- When the second database has no row for an `id`, the project stays in the list and in `total`, and `domain`, `networth`, and `country` are `null`.

Out of scope:

- Creating, updating, and deleting projects.
- Filters, search, and any sort other than by `id`.
- An upper bound on `limit`.
- Authorization.
- A separate error status for invalid `page` and `limit`.
- Changes to `GET /users` and `GET /health`.

## Capabilities

### New Capabilities

- `projects`: a paginated list of projects assembled from two fake databases.

### Modified Capabilities

- None.

## Impact

- New route `GET /projects` on the same Fastify app as `GET /health`.
- Two fake databases with test rows: projects (`id`, `name`) and details by `id` (`domain`, `networth`, `country`).
- No new npm dependencies. `GET /health` stays as it is.
- `GET /users` is not in this tree: it lives on `feature/list-users`. This change does not wire that code in and does not modify it.
