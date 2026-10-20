import { readFile } from "node:fs/promises";
import path from "node:path";

import type { UserRecord } from "../../domain/user.ts";
import type { UsersSource } from "../../usecase/list-users.port.ts";

export function createUsersJson(filePath: string): UsersSource {
  return {
    async listUsers() {
      const absolutePath = path.resolve(process.cwd(), filePath);
      const text = await readFile(absolutePath, "utf8");
      return parseUsers(text);
    },
  };
}

function parseUsers(text: string): UserRecord[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("users file must be a JSON array");
  }

  return parsed.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error("users file row must be an object");
    }
    const { id, username } = entry;
    if (typeof id !== "number" || typeof username !== "string") {
      throw new Error("users file row must have a numeric id and a string username");
    }
    return { id, username };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
