// components/StoryViewer.tsx

'use client';

import { useState } from 'react';
import { Button } from './ui/button';

// The 'pages' prop is now a simple array of strings
export function StoryViewer({
  pages,
  title,
}: {
  pages: string[];
  title: string;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 0));

  const pageContent = pages[currentPage];

  // Handle case where pages might be empty
  if (!pageContent) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Story not found or is empty.</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 capitalize">{title}</h1>
      {/* The main container no longer needs flex layout for an image */}
      <div className="border rounded-lg p-8 w-full max-w-4xl min-h-[50vh] bg-white shadow-lg dark:bg-slate-900">
        <p className="text-xl leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {pageContent}
        </p>
      </div>
      <div className="flex justify-between w-full max-w-4xl mt-6">
        <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
          Previous Page
        </Button>
        <div className="flex items-center font-semibold">
          Page {currentPage + 1} of {pages.length}
        </div>
        <Button
          onClick={goToNextPage}
          disabled={currentPage === pages.length - 1}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
}
