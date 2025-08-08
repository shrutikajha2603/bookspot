'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';

// Update the type for the 'pages' prop
type PageData = {
  content: string;
  imageUrl: string;
};

export function StoryViewer({ pages, title }: { pages: PageData[]; title: string }) {
  const [currentPage, setCurrentPage] = useState(0);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, pages.length - 1));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  const page = pages[currentPage];

  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 capitalize">{title}</h1>
      {/* --- The styling changes are on this div --- */}
      <div className="border rounded-lg p-8 w-full max-w-4xl min-h-[50vh] bg-white shadow-lg flex flex-col md:flex-row gap-8 dark:bg-slate-900">
        {/* Image Display */}
        {page.imageUrl && (
            <div className="w-full md:w-1/2 relative aspect-square">
                <Image src={page.imageUrl} alt={`Illustration for ${title} page ${currentPage + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
            </div>
        )}
        {/* Text Display */}
        <div className="w-full md:w-1/2">
            {/* --- And on this p tag --- */}
            <p className="text-xl leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {page.content}
            </p>
        </div>
      </div>
      <div className="flex justify-between w-full max-w-4xl mt-6">
        <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous Page
        </Button>
        <div className="flex items-center font-semibold">
          Page {currentPage + 1} of {pages.length}
        </div>
        <Button onClick={goToNextPage} disabled={currentPage === pages.length - 1}>
          Next Page
        </Button>
      </div>
    </div>
  );
}