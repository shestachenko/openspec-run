import type { UserProfile, UserRecord } from "../domain/user.ts";

export type UsersSource = {
  listUsers(): Promise<readonly UserRecord[]>;
};

export type UserProfilesLookup = {
  findProfile(id: number): Promise<UserProfile | null>;
};

export type UserProfilesSource = {
  open(): UserProfilesLookup;
};

export type ListUsersDeps = {
  users: UsersSource;
  profiles: UserProfilesSource;
};
