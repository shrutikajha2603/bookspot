// components/StoryWriter.tsx

'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

function StoryWriter() {
  // 1. We use simple React state for everything.
  const [storyInput, setStoryInput] = useState('');
  const [pages, setPages] = useState('1');
  const [storyOutput, setStoryOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. This is our manual function to call the API.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStoryOutput(''); // Clear previous story

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

      // 3. This loop reads the text stream from the API response.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; // The stream is finished.
        }
        const chunk = decoder.decode(value);
        // Append each piece of the story to our output state
        setStoryOutput((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setStoryOutput('An error occurred while generating the story.');
    } finally {
      setIsLoading(false); // Ensure loading is turned off
    }
  };

  return (
    <div className="flex flex-col container">
      {/* The form now uses our manual state and submit handler */}
      <form onSubmit={handleSubmit}>
        <section className="flex-1 flex flex-col border border-orange-300 rounded-md p-10 space-y-2 mr-3">
          <Textarea
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            placeholder="Write a story about a robot and a human who became friends"
            className="flex-1 text-black"
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

      {/* The output section displays our manually built story string */}
      <section className="flex-1 pb-5 mt-5 mr-3">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div className="whitespace-pre-wrap">
            {storyOutput || (
              <p className="animate-pulse">
                I'm waiting for you to Generate a story above...
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StoryWriter;