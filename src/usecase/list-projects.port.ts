import type { ProjectDetails, ProjectRecord } from "../domain/project.ts";

export type ProjectsSource = {
  listProjects(): Promise<readonly ProjectRecord[]>;
};

export type ProjectDetailsLookup = {
  findDetails(id: string): Promise<ProjectDetails | null>;
};

export type ProjectDetailsSource = {
  open(): ProjectDetailsLookup;
};

export type ListProjectsDeps = {
  projects: ProjectsSource;
  details: ProjectDetailsSource;
};
