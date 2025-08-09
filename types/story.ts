// types/story.ts

// Define a single, shared type for a story page
// We will import this into any file that needs it.
export type PageData = {
  pageContent: string;
  imageUrl: string;
};
