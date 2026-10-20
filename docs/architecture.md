# Architecture

Dependencies point inward. A handler calls a usecase. A usecase calls a port. An adapter implements that port. Domain code has no HTTP and no database.

```
+------------------+     +------------------+     +------------------+
| http / handler   | --> | usecase          | --> | port             |
| shape, JSON      |     | one action       |     | interface        |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                         ^
         | status, JSON           v                         |
         |                 +------------------+             |
         |                 | domain           |             |
         |                 | rules, entities  |             |
         |                 +------------------+             |
         |                                                  |
         |                        +------------------+      |
         +----------------------->| adapter          | -----+
                                  | SQL, remote API  |
                                  +--------+---------+
                                           ^
                                  +--------+---------+
                                  | app.ts           |
                                  | composition      |
                                  +------------------+
```

## Handler

A handler accepts the HTTP request, checks its shape, normalizes the data, and passes a plain object to one usecase. One handler calls one usecase.

The handler maps the usecase result back to a status and JSON, including errors. A missing order comes back from the usecase as its own error. The handler turns that error into `404`.

## Usecase

A usecase performs one application action. It calls ports, assembles the result, and returns it.

`findOrder` calls the `findOrder` port and returns the order. The handler turns that return value into `200` and a body.

## Port and adapter

The port is the interface the usecase owns. The adapter is the only code that knows SQL, an HTTP client, or the shape of a remote API.

Several usecases may call the same port. They then share one adapter.

## Domain

Domain is the core: entities and rules. It does not import Fastify, a database client, or an HTTP client.

## Composition

`src/app.ts` is the composition root. It creates config, the logger, connections, and adapters, passes them inward, and registers handlers. That wiring stays at the edge, next to Fastify. `src/server.ts` only listens.

## Shared code

Shared code is a port or a domain service that more than one usecase uses. A `shared` folder appears when that code exists.

The test is the dependency direction. Shared code still points inward.

## Layout

`find-order` is one action. The next action adds the same four files: handler, usecase, port, adapter. `shared/` appears when two usecases share one port or one domain service. `GET /health` stays in `app.ts` until it needs a database or a remote API.

```
src/
  server.ts                      listens
  app.ts                         composition
  http/
    find-order.ts                handler
  usecase/
    find-order.ts                usecase
    find-order.port.ts           port owned by that usecase
  domain/
    order.ts                     entity and rules
  adapter/
    db/
      order-sql.ts               port implementation
```
