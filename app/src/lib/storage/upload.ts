import { createClient } from "@/lib/supabase/client";

export async function uploadMedia(file: File, folder: string = "content"): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadMultipleMedia(files: File[], folder: string = "content"): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadMedia(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}
