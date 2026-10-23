export type ProjectRecord = {
  id: string;
  name: string;
};

export type ProjectDetails = {
  domain: string | null;
  networth: number | null;
  country: string | null;
};

export type ProjectListItem = ProjectRecord & ProjectDetails;

export type ProjectPage = {
  items: ProjectListItem[];
  total: number;
};
