import type { RoommatePreference, RoommateMatch, Room } from "@/lib/api/types";

export interface UpdateRoommatePreferenceDto {
  budgetMin: number;
  budgetMax: number;
  preferredCity?: string;
  preferredArea?: string;
  genderPreference?: string;
  lifestyleTags: string[];
  moveInFrom?: string;
  bio?: string;
}

export const roommatesService = {
  getMyPreference: <T = RoommatePreference | null>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/roommates/preference/me"),

  updatePreference: <T = RoommatePreference>(
    http: (url: string, opts?: unknown) => Promise<T>,
    dto: UpdateRoommatePreferenceDto
  ): Promise<T> =>
    http("/roommates/preference", { method: "PUT", body: JSON.stringify(dto) }),

  getMatches: <T = RoommateMatch[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/roommates/matches"),

  getMatchingRooms: <T = Room[]>(
    http: (url: string, opts?: unknown) => Promise<T>
  ): Promise<T> =>
    http("/roommates/matching-rooms"),
};
