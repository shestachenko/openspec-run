import type { UserListItem, UserPage, UserProfile, UserRecord } from "../domain/user.ts";
import type { ListUsersDeps } from "./list-users.port.ts";

export async function listUserPage(
  input: { page: number; limit: number },
  deps: ListUsersDeps,
): Promise<UserPage> {
  const users = await deps.users.listUsers();
  const sorted = [...users].sort((left, right) => left.id - right.id);
  const start = (input.page - 1) * input.limit;
  const pageUsers = sorted.slice(start, start + input.limit);
  const profiles = deps.profiles.open();
  const items: UserListItem[] = [];

  for (const user of pageUsers) {
    const profile = await profiles.findProfile(user.id);
    items.push(joinUser(user, profile));
  }

  return {
    items,
    total: sorted.length,
  };
}

function joinUser(user: UserRecord, profile: UserProfile | null): UserListItem {
  return {
    id: user.id,
    username: user.username,
    addresses: profile?.addresses ?? null,
    teams: profile?.teams ?? null,
    manager: profile?.manager ?? null,
    salary: profile?.salary ?? null,
  };
}
