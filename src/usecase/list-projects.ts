import type {
  ProjectDetails,
  ProjectListItem,
  ProjectPage,
  ProjectRecord,
} from "../domain/project.ts";
import type { ListProjectsDeps } from "./list-projects.port.ts";

export async function listProjectPage(
  input: { page: number; limit: number },
  deps: ListProjectsDeps,
): Promise<ProjectPage> {
  const projects = await deps.projects.listProjects();
  const sorted = [...projects].sort((left, right) => compareId(left.id, right.id));
  const start = (input.page - 1) * input.limit;
  const pageProjects = sorted.slice(start, start + input.limit);
  const details = deps.details.open();
  const items: ProjectListItem[] = [];

  for (const project of pageProjects) {
    const record = await details.findDetails(project.id);
    items.push(joinProject(project, record));
  }

  return {
    items,
    total: sorted.length,
  };
}

function compareId(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (right < left) {
    return 1;
  }
  return 0;
}

function joinProject(project: ProjectRecord, details: ProjectDetails | null): ProjectListItem {
  return {
    id: project.id,
    name: project.name,
    domain: details?.domain ?? null,
    networth: details?.networth ?? null,
    country: details?.country ?? null,
  };
}
