# Spec Delta

## Purpose

Returns a paginated project list assembled from two databases and sorted by string id.

## ADDED Requirements

### Requirement: GET /projects page
`GET /projects` SHALL accept query `page` and `limit` and return HTTP 200 and a JSON object with `items` and `total`. `items` SHALL be the requested page. `total` SHALL be the number of projects in the first database. Query values have no separate error status.

#### Scenario: First page
- **GIVEN** the first database has projects with id `a`, `b`, and `c`
- **WHEN** the client sends `GET /projects?page=1&limit=2`
- **THEN** the status is 200, `items` contains projects `a` and `b` in that order, and `total` is 3

#### Scenario: Empty source
- **GIVEN** the first database has no projects
- **WHEN** the client sends `GET /projects`
- **THEN** the status is 200, `items` is an empty array, and `total` is 0

### Requirement: Accepted page and limit
A `page` or `limit` value SHALL be used when the whole query string is decimal digits and the integer is at least 1. `limit` SHALL have no upper bound.

#### Scenario: Explicit page and limit
- **GIVEN** 15 projects with ids `p01` through `p15` in that lexicographic order
- **WHEN** the client sends `GET /projects?page=2&limit=2`
- **THEN** `items` contains projects `p03` and `p04`, and `total` is 15

#### Scenario: Large limit
- **GIVEN** 3 projects
- **WHEN** the client sends `GET /projects?limit=100`
- **THEN** `items` contains all 3 projects

### Requirement: Default page and limit
A missing `page`, a `page` that is not only decimal digits, or a `page` below 1 SHALL become 1. A missing `limit`, a `limit` that is not only decimal digits, or a `limit` below 1 SHALL become 10. The other parameter SHALL keep its accepted value. The status SHALL be 200.

#### Scenario: No query
- **GIVEN** 12 projects with ids `p01` through `p12`
- **WHEN** the client sends `GET /projects`
- **THEN** the status is 200 and `items` contains projects `p01` through `p10`

#### Scenario: Invalid page keeps limit
- **GIVEN** 5 projects
- **WHEN** the client sends `GET /projects?page=abc&limit=2`
- **THEN** the status is 200, `items` contains the first 2 projects by `id`, and `total` is 5

#### Scenario: Fractional limit
- **GIVEN** 12 projects
- **WHEN** the client sends `GET /projects?limit=10.5`
- **THEN** `items` contains 10 projects

### Requirement: Sort by id
The system SHALL order projects by string `id` in ascending code-point order before slicing the page.

#### Scenario: Source order differs
- **GIVEN** projects with ids `b`, `10`, and `a`
- **WHEN** the client sends `GET /projects?limit=10`
- **THEN** the order in `items` is `10`, `a`, `b`

### Requirement: Page past the end
When `page` starts after the last project, `GET /projects` SHALL return HTTP 200, an empty `items` array, and the full `total`.

#### Scenario: Page beyond data
- **GIVEN** 3 projects
- **WHEN** the client sends `GET /projects?page=5&limit=2`
- **THEN** the status is 200, `items` is an empty array, and `total` is 3

### Requirement: Joined project fields
Each element SHALL contain string `id` and `name` from the first database. When the second database has that `id`, `domain` SHALL be a string, `networth` SHALL be a JSON number, and `country` SHALL be a string.

#### Scenario: Second record present
- **GIVEN** project `a` with name `Atlas` and a second record: domain `atlas.example`, networth 100, country `FI`
- **WHEN** the client sends `GET /projects?page=1&limit=10`
- **THEN** that element has the same field values, and `networth` is the number 100

### Requirement: Missing second record
When the second database has no record for an `id`, that project SHALL stay in `items` and in `total`. `domain`, `networth`, and `country` SHALL be null.

#### Scenario: No matching second record
- **GIVEN** project `b` has no record in the second database
- **WHEN** the client sends `GET /projects`
- **THEN** the element with id `b` has `domain`, `networth`, and `country` equal to null, and `total` includes project `b`
