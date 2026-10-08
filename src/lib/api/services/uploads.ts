import type { HttpCaller } from "@/lib/api/types";

export interface UploadResponse {
  url: string;
}

export const uploadsService = {
  uploadFile: async (
    http: HttpCaller,
    file: File,
    folder = "nestly",
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return http<UploadResponse>(`/uploads?folder=${folder}`, {
      method: "POST",
      body: formData,
      onProgress,
    });
  },
};
