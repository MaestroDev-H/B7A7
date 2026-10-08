export interface UploadResponse {
  url: string;
}

export const uploadsService = {
  uploadFile: async <T = UploadResponse>(
    http: (url: string, opts?: { method?: string; body?: FormData; onProgress?: (p: number) => void }) => Promise<T>,
    file: File,
    folder = "nestly",
    onProgress?: (percent: number) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);
    return http(`/uploads?folder=${folder}`, {
      method: "POST",
      body: formData,
      onProgress,
    });
  },
};
