// app/stories/page.tsx

import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

// This is a Server Component, so we can use Node.js APIs directly
export default async function StoryLibraryPage() {
  const storiesPath = path.join(process.cwd(), 'public/stories');
  let storyFolders: string[] = [];

  try {
    // Read all the story directories
    storyFolders = await fs.readdir(storiesPath);
  } catch (error) {
    console.log("No stories directory found. It will be created when you generate your first story.");
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Story Library</h1>
      {storyFolders.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storyFolders.map(story => (
            <li key={story} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <Link href={`/stories/${story}`} className="text-xl font-semibold text-orange-600 hover:underline">
                {/* Replace dashes with spaces for a nice title */}
                {story.replace(/-/g, ' ')}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">You haven't generated any stories yet. Go back to create one!</p>
      )}
    </div>
  );
}