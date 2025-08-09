// app/api/run-script/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { put } from '@vercel/blob';

// NOTE: We no longer need 'fs' or 'path'

// Initialize the Google provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// The prompt is now a constant string inside the code
const promptTemplate = `
You are an accomplished children's story writer. Your style is engaging, imaginative, and always appropriate for children.

Based on the user's request below, write a complete story. The story MUST have exactly \${pages} pages.

IMPORTANT FORMATTING RULE: After you finish writing the content for each page, you must insert a page break by writing a single line that contains only the text "---PAGEBREAK---".

User's Request: "\${story}"

Please begin the story now.
`;

export async function POST(req: Request) {
  try {
    const { story, pages } = await req.json();

    const finalPrompt = promptTemplate
      .replace('${story}', story)
      .replace('${pages}', pages || 1);

    // Get the full story text from the AI
    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt: finalPrompt,
    });

    // --- FIX: Add a unique timestamp to the story title ---
    const uniqueId = Date.now();
    const storyTitle = `${story.substring(0, 2000).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${uniqueId}`;
    
    const storyPages = text.split('---PAGEBREAK---').map(p => p.trim()).filter(p => p !== '');

    for (let i = 0; i < storyPages.length; i++) {
      const pageContent = storyPages[i];
      const blobPath = `${storyTitle}/page_${i + 1}.txt`;
      await put(blobPath, pageContent, {
        access: 'public',
        contentType: 'text/plain',
      });
    }

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