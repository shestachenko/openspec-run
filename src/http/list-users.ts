import type { FastifyInstance } from "fastify";

import type { ListUsersDeps } from "../usecase/list-users.port.ts";
import { listUserPage } from "../usecase/list-users.ts";

export function registerListUsers(app: FastifyInstance, deps: ListUsersDeps): void {
  app.get("/users", async (request) => {
    const page = parseQueryNumber(readQueryField(request.query, "page"), 1);
    const limit = parseQueryNumber(readQueryField(request.query, "limit"), 10);
    return listUserPage({ page, limit }, deps);
  });
}

function readQueryField(query: unknown, key: string): unknown {
  if (!isRecord(query) || !Object.hasOwn(query, key)) {
    return undefined;
  }
  return query[key];
}

function parseQueryNumber(value: unknown, fallback: number): number {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
