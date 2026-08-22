
import { createClient } from '@supabase/supabase-js';

// Use environment variables for production/secure access
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://iwmljuoplkqyhdygajpi.supabase.co";
// NOTE: For a real production app, use SUPABASE_SERVICE_ROLE_KEY to bypass RLS in background tasks
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateAndUploadImage(promptTitle: string, promptId: string, userId: string) {
  try {
    const encodedTitle = encodeURIComponent(promptTitle);
    const imageUrl = `https://pollinations.ai/p/${encodedTitle}?width=800&height=533&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const filePath = `${userId}/${promptId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("prompts")
      .upload(filePath, blob, { contentType: 'image/jpeg' });
    
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("prompts")
      .getPublicUrl(filePath);

    await supabase
      .from("prompts")
      .update({ image_url: publicUrl })
      .eq("id", promptId);

    console.log(`Successfully generated and updated image for prompt: ${promptTitle}`);
  } catch (error) {
    console.error(`Failed to generate image for prompt: ${promptTitle}`, error);
  }
}

async function bulkGenerateImages() {
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id, title, creator_id, image_url")
    .is("image_url", null);

  if (error) {
    console.error("Error fetching prompts", error);
    return;
  }

  console.log(`Found ${prompts.length} prompts without images. Starting generation...`);
  
  for (const prompt of prompts) {
    await generateAndUploadImage(prompt.title, prompt.id, prompt.creator_id);
    // Add small delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("Bulk generation complete.");
}

bulkGenerateImages();
