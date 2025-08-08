// app/api/run-script/route.ts

// CORRECT IMPORTS: create... from the provider, experimental... from the core.
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, experimental_generateImage } from 'ai';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize the Google provider
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Helper to get the prompt template
async function getPromptTemplate() {
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

    // Prepare to save the story
    const storyTitle = story.substring(0, 20).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const storyPath = path.join(process.cwd(), 'public/stories', storyTitle);
    await fs.mkdir(storyPath, { recursive: true });

    // Loop through each page, generate image, and save files
    for (let i = 0; i < storyData.length; i++) {
      const page = storyData[i];
      
      // Call the correct experimental function for image generation
      const { image } = await experimental_generateImage({
          model: google.image('models/imagen-2'), // Specify the model with .image()
          prompt: page.imagePrompt,
          size: '1024x1024', // Specify a size for the image
      });

      // Save page text and the resulting image URL
      await fs.writeFile(path.join(storyPath, `page_${i + 1}.txt`), page.pageContent);
      await fs.writeFile(path.join(storyPath, `page_${i + 1}.img.txt`), String(image));
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