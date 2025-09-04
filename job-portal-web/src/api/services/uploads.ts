import { dotnetClient } from "../axios";

export async function uploadResumeToDotnet(file: File, bearer?: string) {
  const fd = new FormData();
  fd.append("file", file, file.name);

  const resp = await dotnetClient.post<{ blobUrl: string; sasUrl: string }>(
    "/uploads/resume",
    fd,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    }
  );
  return resp.data;
}
