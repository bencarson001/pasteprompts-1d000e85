import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://iwmljuoplkqyhdygajpi.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSingleImage() {
  console.log("Fetching first prompt needing an image...");
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("id, title, creator_id, image_url")
    .is("image_url", null)
    .limit(1);

  if (error) {
    console.error("Error querying prompts:", error);
    return;
  }

  if (!prompts || prompts.length === 0) {
    console.log("No prompts found without image_url. Fetching any 1 prompt to test...");
    const { data: anyPrompts, error: anyError } = await supabase
      .from("prompts")
      .select("id, title, creator_id, image_url")
      .limit(1);
    if (anyError || !anyPrompts || anyPrompts.length === 0) {
      console.error("Could not fetch any prompts:", anyError);
      return;
    }
    console.log("Found sample prompt:", anyPrompts[0]);
    await processPrompt(anyPrompts[0]);
    return;
  }

  console.log("Found target prompt for test:", prompts[0]);
  await processPrompt(prompts[0]);
}

async function processPrompt(prompt: { id: string; title: string; creator_id: string; image_url: string | null }) {
  console.log(`Generating image for: "${prompt.title}"...`);
  const encodedPrompt = encodeURIComponent(`${prompt.title}, ultra high definition, highly detailed, photorealistic`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=533&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

  console.log("Image URL:", imageUrl);

  // Directly set image_url or upload to storage
  const { data, error: updateError } = await supabase
    .from("prompts")
    .update({ image_url: imageUrl })
    .eq("id", prompt.id)
    .select();

  if (updateError) {
    console.error("Database update error:", updateError);
  } else {
    console.log("SUCCESS! Updated prompt in database:", data);
  }
}

testSingleImage();
