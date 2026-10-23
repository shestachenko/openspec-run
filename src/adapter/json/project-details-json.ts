import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ProjectDetails } from "../../domain/project.ts";
import type {
  ProjectDetailsLookup,
  ProjectDetailsSource,
} from "../../usecase/list-projects.port.ts";

export function createProjectDetailsJson(filePath: string): ProjectDetailsSource {
  return {
    open() {
      let details: Promise<ReadonlyMap<string, ProjectDetails>> | undefined;

      const lookup: ProjectDetailsLookup = {
        async findDetails(id) {
          details ??= readDetails(filePath);
          const map = await details;
          return map.get(id) ?? null;
        },
      };

      return lookup;
    },
  };
}

async function readDetails(filePath: string): Promise<ReadonlyMap<string, ProjectDetails>> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const text = await readFile(absolutePath, "utf8");
  return parseDetails(text);
}

function parseDetails(text: string): ReadonlyMap<string, ProjectDetails> {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("project details file must be a JSON array");
  }

  const details = new Map<string, ProjectDetails>();
  for (const entry of parsed) {
    if (!isRecord(entry) || typeof entry.id !== "string") {
      throw new Error("project details row must have a string id");
    }
    details.set(entry.id, {
      domain: readNullableString(entry.domain, "domain"),
      networth: readNullableNumber(entry.networth, "networth"),
      country: readNullableString(entry.country, "country"),
    });
  }
  return details;
}

function readNullableString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
  return value;
}

function readNullableNumber(value: unknown, field: string): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "number") {
    throw new Error(`${field} must be a number`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
