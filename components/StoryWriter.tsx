'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

function StoryWriter() {
  const [storyInput, setStoryInput] = useState('');
  const [pages, setPages] = useState('1');
  const [storyOutput, setStoryOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStoryOutput('');

    try {
      const response = await fetch('/api/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: storyInput,
          pages: parseInt(pages),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get a response from the server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        setStoryOutput((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setStoryOutput('An error occurred while generating the story.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col container">
      <form onSubmit={handleSubmit}>
        <section className="flex-1 flex flex-col border border-orange-300 rounded-md p-10 space-y-2 mr-3">
          <Textarea
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            placeholder="Write a story about a robot and a human who became friends"
            // FIX: Removed 'text-black' and added adaptive text and background colors
            className="flex-1 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
            required
          />

          <Select value={pages} onValueChange={setPages}>
            <SelectTrigger>
              <SelectValue placeholder="How many pages should the story be?" />
            </SelectTrigger>

            <SelectContent className="w-full">
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            disabled={isLoading || !storyInput}
            className="w-full"
            size="lg"
            type="submit"
          >
            {isLoading ? 'Generating Story...' : 'Generate Story'}
          </Button>
        </section>
      </form>

      <section className="flex-1 pb-5 mt-5 mr-3">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div className="whitespace-pre-wrap">
            {storyOutput || (
              <p className="animate-pulse">
                I&apos;m waiting for you to Generate a story above...
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoryWriter;