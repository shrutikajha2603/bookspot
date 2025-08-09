// app/api/run-script/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, experimental_generateImage } from 'ai';
import { put } from '@vercel/blob'; // 1. Import 'put' from Vercel Blob

// NOTE: We no longer need 'fs' or 'path' because we are saving to the cloud.

// Initialize the Google provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Helper to get the prompt template (this remains the same for now, but could be simplified)
async function getPromptTemplate() {
  // In a real deployment, you might move this template string directly into the code
  // to avoid file system reads, but this will still work.
  const { promises: fs } = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'app/api/run-script/story-book.gpt');
  return fs.readFile(filePath, 'utf-8');
}

export async function POST(req: Request) {
  try {
    const { story, pages } = await req.json();
    const promptTemplate = await getPromptTemplate();
    const finalPrompt = promptTemplate
      .replace('${story}', story)
      .replace('${pages}', pages || 1);

    // Get the structured JSON from the AI
    const { text } = await generateText({
      model: google('models/gemini-1.5-pro-latest'),
      prompt: finalPrompt,
    });

    const storyData = JSON.parse(text);

    // Prepare a unique title for the story folder in the cloud
    const storyTitle = story.substring(0, 20).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    // --- VERCEL BLOB LOGIC STARTS HERE ---

    // Loop through each page, generate image, and UPLOAD files to Vercel Blob
    for (let i = 0; i < storyData.length; i++) {
      const page = storyData[i];
      
      // Generate the image
      const { image } = await experimental_generateImage({
          model: google.image('models/imagen-2'),
          prompt: page.imagePrompt,
          size: '1024x1024',
      });

      // Define the path for the JSON file in the cloud
      const blobPath = `${storyTitle}/page_${i + 1}.json`;

      // Create the JSON object to upload
      const pageData = {
        pageContent: page.pageContent,
        imageUrl: String(image) // The URL of the generated image
      };

      // Upload the JSON file to Vercel Blob
      await put(blobPath, JSON.stringify(pageData), {
        access: 'public', // Make it publicly accessible to be read later
        contentType: 'application/json',
      });
    }

    // Stream the full story text back for the live preview
    const fullStoryText = storyData.map((p: any) => p.pageContent).join('\n\n');
    const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fullStoryText));
          controller.close();
        },
    });

    return new Response(readableStream);

  } catch (error) {
    console.error('Error in API route:', error);
    return new Response('An error occurred.', { status: 500 });
  }
}