// app/api/run-script/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, experimental_generateImage } from 'ai';
import { put } from '@vercel/blob';
import { PageData } from '@/types/story';

// Define a local type for the raw data we expect from the AI
type AIResponsePage = {
  pageContent: string;
  imagePrompt: string;
};

// Initialize the Google provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Helper to get the prompt template
async function getPromptTemplate() {
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

    const { text } = await generateText({
      model: google('models/gemini-1.5-pro-latest'),
      prompt: finalPrompt,
    });

    // Cast the parsed JSON to our new local type
    const storyDataFromAI: AIResponsePage[] = JSON.parse(text);

    const storyTitle = story.substring(0, 20).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    // This array will hold the final data that matches the PageData type
    const finalStoryPages: PageData[] = [];

    for (const pageFromAI of storyDataFromAI) {
      const { image } = await experimental_generateImage({
          model: google.image('models/imagen-2'),
          // Use the imagePrompt from our correctly typed object
          prompt: pageFromAI.imagePrompt,
          size: '1024x1024',
      });

      // Create an object that matches the PageData structure
      const finalPageData: PageData = {
        pageContent: pageFromAI.pageContent,
        imageUrl: String(image)
      };

      // Push it to our final array
      finalStoryPages.push(finalPageData);
    }

    // Now, upload the correctly structured data to Vercel Blob
    for (let i = 0; i < finalStoryPages.length; i++) {
        const pageToUpload = finalStoryPages[i];
        const blobPath = `${storyTitle}/page_${i + 1}.json`;
        await put(blobPath, JSON.stringify(pageToUpload), {
            access: 'public',
            contentType: 'application/json',
        });
    }

    const fullStoryText = finalStoryPages.map((p) => p.pageContent).join('\n\n');
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