import { atomWithLocalStorage } from "@/atoms";

export interface User {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  roles: string[];
  token: string;
  initials: string;
}

export const userAtom = atomWithLocalStorage<User | undefined>(
  "user",
  undefined,
);
