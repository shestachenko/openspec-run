import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ProjectRecord } from "../../domain/project.ts";
import type { ProjectsSource } from "../../usecase/list-projects.port.ts";

export function createProjectsJson(filePath: string): ProjectsSource {
  return {
    async listProjects() {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const text = await readFile(absolutePath, "utf8");
      return parseProjects(text);
    },
  };
}

function parseProjects(text: string): ProjectRecord[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("projects file must be a JSON array");
  }

  return parsed.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error("projects file row must be an object");
    }
    const { id, name } = entry;
    if (typeof id !== "string" || typeof name !== "string") {
      throw new Error("projects file row must have a string id and a string name");
    }
    return { id, name };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
