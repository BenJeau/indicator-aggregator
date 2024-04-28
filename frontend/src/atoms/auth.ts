import { atomWithLocalStorage } from "@/atoms";

interface User {
  id: number;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  roles: string[];
  token: string;
}

export const userAtom = atomWithLocalStorage<User | undefined>(
  "user",
  undefined,
);
