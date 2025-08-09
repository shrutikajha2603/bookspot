// app/api/run-script/route.ts

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { put } from '@vercel/blob';

// Initialize the Google provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// The main prompt for writing the story
const storyPromptTemplate = `
You are an accomplished children's story writer. Your style is engaging, imaginative, and always appropriate for children.

Based on the user's request below, write a complete story. The story MUST have exactly \${pages} pages.

IMPORTANT FORMATTING RULE: After you finish writing the content for each page, you must insert a page break by writing a single line that contains only the text "---PAGEBREAK---".

User's Request: "\${story}"

Please begin the story now.
`;

export async function POST(req: Request) {
  try {
    const { story, pages } = await req.json();

    // --- NEW MODERATION STEP ---
    // 1. Ask Gemini to check the user's prompt first.
    const moderationPrompt = `Is the following prompt appropriate for a children's story? Answer with only the word "yes" or "no". Prompt: "${story}"`;

    const { text: moderationResponse } = await generateText({
      model: google('models/gemini-1.5-flash-latest'), // Use the fast model for this simple check
      prompt: moderationPrompt,
    });

    // 2. Check the response. If it's not "yes", reject the request.
    if (!moderationResponse.toLowerCase().includes('yes')) {
      // Return a 400 Bad Request error with a clear message
      return new Response('The provided prompt is not appropriate for a children\'s story.', {
        status: 400,
      });
    }

    // --- IF MODERATION PASSES, CONTINUE WITH STORY GENERATION ---

    const finalPrompt = storyPromptTemplate
      .replace('${story}', story)
      .replace('${pages}', pages || 1);

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      prompt: finalPrompt,
    });

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
