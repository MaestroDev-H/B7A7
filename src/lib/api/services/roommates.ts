import type { RoommatePreference, RoommateMatch, Room, HttpCaller } from "@/lib/api/types";

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
  getMyPreference: (http: HttpCaller): Promise<RoommatePreference | null> =>
    http<RoommatePreference | null>("/roommates/preference/me"),

  updatePreference: (http: HttpCaller, dto: UpdateRoommatePreferenceDto): Promise<RoommatePreference> =>
    http<RoommatePreference>("/roommates/preference", { method: "PUT", body: JSON.stringify(dto) }),

  getMatches: (http: HttpCaller): Promise<RoommateMatch[]> =>
    http<RoommateMatch[]>("/roommates/matches"),

  getMatchingRooms: (http: HttpCaller): Promise<Room[]> =>
    http<Room[]>("/roommates/matching-rooms"),
};
