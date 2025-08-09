// app/stories/page.tsx

import { list } from '@vercel/blob';
import Link from 'next/link';

// This line tells Next.js to always render this page dynamically
// and fetch fresh data on every request.
export const dynamic = 'force-dynamic';

export default async function StoryLibraryPage() {
  const { blobs } = await list();

  const storyFolders = Array.from(
    new Set(blobs.map((blob) => blob.pathname.split('/')[0]))
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Story Library</h1>
      {storyFolders.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storyFolders.map((storyFolder) => {
            // Remove the unique ID from the title for display purposes
            const displayTitle = storyFolder.split('-').slice(0, -1).join(' ');

            return (
              <li
                key={storyFolder}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow dark:border-gray-700"
              >
                <Link
                  href={`/stories/${storyFolder}`}
                  className="text-xl font-semibold text-orange-600 hover:underline capitalize"
                >
                  {displayTitle || storyFolder.replace(/-/g, ' ')}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          You haven&apos;t generated any stories yet. Go back to create one!
        </p>
      )}
    </div>
  );
}