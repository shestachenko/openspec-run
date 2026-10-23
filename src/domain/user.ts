export type Address = {
  country: string;
  city: string;
  street: string;
};

export type Team = {
  name: string;
  department: string;
};

export type UserRecord = {
  id: number;
  username: string;
};

export type UserProfile = {
  addresses: Address[] | null;
  teams: Team[] | null;
  manager: string | null;
  salary: number | null;
};

export type UserListItem = UserRecord & UserProfile;

export type UserPage = {
  items: UserListItem[];
  total: number;
};
