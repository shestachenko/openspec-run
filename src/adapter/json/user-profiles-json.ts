import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Address, Team, UserProfile } from "../../domain/user.ts";
import type {
  UserProfilesLookup,
  UserProfilesSource,
} from "../../usecase/list-users.port.ts";

export function createUserProfilesJson(filePath: string): UserProfilesSource {
  return {
    open() {
      let profiles: Promise<ReadonlyMap<number, UserProfile>> | undefined;

      const lookup: UserProfilesLookup = {
        async findProfile(id) {
          profiles ??= readProfiles(filePath);
          const map = await profiles;
          return map.get(id) ?? null;
        },
      };

      return lookup;
    },
  };
}

async function readProfiles(filePath: string): Promise<ReadonlyMap<number, UserProfile>> {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const text = await readFile(absolutePath, "utf8");
  return parseProfiles(text);
}

function parseProfiles(text: string): ReadonlyMap<number, UserProfile> {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("user profiles file must be a JSON array");
  }

  const profiles = new Map<number, UserProfile>();
  for (const entry of parsed) {
    if (!isRecord(entry) || typeof entry.id !== "number") {
      throw new Error("user profile row must have a numeric id");
    }
    profiles.set(entry.id, {
      addresses: readAddresses(entry.addresses),
      teams: readTeams(entry.teams),
      manager: readNullableString(entry.manager, "manager"),
      salary: readNullableNumber(entry.salary, "salary"),
    });
  }
  return profiles;
}

function readAddresses(value: unknown): Address[] | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    throw new Error("addresses must be an array");
  }
  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.country !== "string" ||
      typeof entry.city !== "string" ||
      typeof entry.street !== "string"
    ) {
      throw new Error("address must have country, city, and street");
    }
    return {
      country: entry.country,
      city: entry.city,
      street: entry.street,
    };
  });
}

function readTeams(value: unknown): Team[] | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    throw new Error("teams must be an array");
  }
  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.name !== "string" ||
      typeof entry.department !== "string"
    ) {
      throw new Error("team must have name and department");
    }
    return {
      name: entry.name,
      department: entry.department,
    };
  });
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
