import Fastify, { type FastifyInstance } from "fastify";

import { createUserProfilesJson } from "./adapter/json/user-profiles-json.ts";
import { createUsersJson } from "./adapter/json/users-json.ts";
import { registerListUsers } from "./http/list-users.ts";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  registerListUsers(app, {
    users: createUsersJson("data/users.json"),
    profiles: createUserProfilesJson("data/user-profiles.json"),
  });

  return app;
}
