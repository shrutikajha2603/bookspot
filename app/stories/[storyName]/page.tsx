// app/stories/[storyName]/page.tsx

import { list } from '@vercel/blob';
import { StoryViewer } from '@/components/StoryViewer';

// This function now fetches plain text files from Vercel Blob
async function getStoryContent(storyName: string): Promise<string[]> {
  const { blobs } = await list({
    prefix: `${storyName}/`,
  });

  // Sort the blobs numerically based on their pathname
  blobs.sort((a, b) => {
    const numA = parseInt(a.pathname.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.pathname.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  // Fetch the text content for each blob
  const pageContents = await Promise.all(
    blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      const text = await response.text();
      return text;
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

  return (
    <div>
      <StoryViewer pages={pages} title={storyName.replace(/-/g, ' ')} />
    </div>
  );
}
