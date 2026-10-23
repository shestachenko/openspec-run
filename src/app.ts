import Fastify, { type FastifyInstance } from "fastify";

import { createProjectDetailsJson } from "./adapter/json/project-details-json.ts";
import { createProjectsJson } from "./adapter/json/projects-json.ts";
import { registerListProjects } from "./http/list-projects.ts";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  registerListProjects(app, {
    projects: createProjectsJson("data/projects.json"),
    details: createProjectDetailsJson("data/project-details.json"),
  });

  return app;
}
