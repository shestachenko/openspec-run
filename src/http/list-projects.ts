import type { FastifyInstance } from "fastify";

import type { ListProjectsDeps } from "../usecase/list-projects.port.ts";
import { listProjectPage } from "../usecase/list-projects.ts";

export function registerListProjects(app: FastifyInstance, deps: ListProjectsDeps): void {
  app.get("/projects", async (request) => {
    const page = parseQueryNumber(readQueryField(request.query, "page"), 1);
    const limit = parseQueryNumber(readQueryField(request.query, "limit"), 10);
    return listProjectPage({ page, limit }, deps);
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
