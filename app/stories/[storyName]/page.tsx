// app/stories/[storyName]/page.tsx

import { list } from '@vercel/blob';
import { StoryViewer } from '@/components/StoryViewer';
import { PageData } from '@/types/story'; // 1. Import the shared type

// This function now fetches data from Vercel Blob
async function getStoryContent(storyName: string): Promise<PageData[]> {
  // 1. List all files that are inside the specific story's "folder" (prefix)
  const { blobs } = await list({
    prefix: `${storyName}/`,
  });

  // 2. Sort the blobs numerically based on their pathname
  blobs.sort((a, b) => {
    const numA = parseInt(a.pathname.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.pathname.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  // 3. Fetch the JSON content for each blob
  const pageContents = await Promise.all(
    blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      // Cast the response to our single, shared PageData type
      const data = (await response.json()) as PageData;
      return data;
    })
  );

  return pageContents;
}

// This is the main page component
export default async function StoryPage({
  params,
}: {
  params: { storyName: string };
}) {
  const { storyName } = params;
  const pages = await getStoryContent(storyName);

  // --- FIX APPLIED HERE ---
  // Transform the data to match the structure the StoryViewer component expects.
  // This renames 'pageContent' to 'content' for compatibility.
  const pagesForViewer = pages.map(page => ({
    content: page.pageContent,
    imageUrl: page.imageUrl,
  }));

  return (
    <div>
      {/* We pass the transformed data to the Client Component */}
      <StoryViewer pages={pagesForViewer} title={storyName.replace(/-/g, ' ')} />
    </div>
  );
}