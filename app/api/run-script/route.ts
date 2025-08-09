// app/api/run-script/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { put } from '@vercel/blob';

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

    // Get the full story text from the AI
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'), // Using the faster model is fine for text
      prompt: finalPrompt,
    });

    // Prepare a unique title for the story folder in the cloud
    const storyTitle = story.substring(0, 200).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    // Split the story into pages using our page break marker
    const storyPages = text.split('---PAGEBREAK---').map(p => p.trim()).filter(p => p !== '');

    // Loop through each page and upload it as a simple text file
    for (let i = 0; i < storyPages.length; i++) {
      const pageContent = storyPages[i];
      const blobPath = `${storyTitle}/page_${i + 1}.txt`;

      // Upload the plain text file to Vercel Blob
      await put(blobPath, pageContent, {
        access: 'public',
        contentType: 'text/plain',
      });
    }

    // Stream the full story text back for the live preview
    const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text.replace(/---PAGEBREAK---/g, '\n\n')));
          controller.close();
        },
    });

    return new Response(readableStream);

  } catch (error) {
    console.error('Error in API route:', error);
    return new Response('An error occurred.', { status: 500 });
  }
}