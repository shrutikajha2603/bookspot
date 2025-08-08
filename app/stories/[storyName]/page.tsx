// app/stories/[storyName]/page.tsx

import { promises as fs } from 'fs';
import path from 'path';
import { StoryViewer } from '@/components/StoryViewer';
import Image from 'next/image'; // Import the Next.js Image component

// Define a type for our page data
type PageData = {
  content: string;
  imageUrl: string;
};

async function getStoryContent(storyName: string): Promise<PageData[]> {
  const storyPath = path.join(process.cwd(), 'public/stories', storyName);
  const files = await fs.readdir(storyPath);

  const textFiles = files.filter(f => f.endsWith('.txt') && !f.endsWith('.img.txt'));
  
  // Sort files numerically
  textFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  const storyPages: PageData[] = await Promise.all(
    textFiles.map(async (file, index) => {
      const content = await fs.readFile(path.join(storyPath, file), 'utf-8');
      // Try to read the corresponding image URL file
      let imageUrl = '';
      try {
        imageUrl = await fs.readFile(path.join(storyPath, `page_${index + 1}.img.txt`), 'utf-8');
      } catch (e) {
        console.log(`No image for page ${index + 1}`);
      }
      return { content, imageUrl };
    })
  );

  return storyPages;
}

export default async function StoryPage({ params }: { params: { storyName: string } }) {
  const { storyName } = params;
  const pages = await getStoryContent(storyName);

  return (
    <div>
      <StoryViewer pages={pages} title={storyName.replace(/-/g, ' ')} />
    </div>
  );
}