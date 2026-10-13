import type { Profile } from "../types/auth";
import { requestJson } from "./http";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile: Profile;
}

export const userService = {
  getProfile(): Promise<UserProfile> {
    return requestJson<UserProfile>("/users/me");
  },
  getById(id: string): Promise<UserProfile> {
    return requestJson<UserProfile>(`/users/${encodeURIComponent(id)}`);
  },
};
