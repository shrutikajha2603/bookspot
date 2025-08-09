# 📖 BlogSpot StoryTeller AI

Welcome to BlogSpot StoryTeller AI! This is a web application that uses the power of Google's Gemini AI to generate unique, multi-page children's stories from a simple prompt. Generated stories are saved to a personal library where they can be read and enjoyed anytime.

![BlogSpot StoryTeller AI Screenshot](![alt text](image.png))

## ✨ Features

-   **AI-Powered Story Generation**: Leverages the Google Gemini API to create original stories based on user prompts.
-   **Persistent Story Library**: Automatically saves every generated story to a cloud-based library using Vercel Blob storage.
-   **Dynamic Page Viewer**: Read your generated stories page-by-page with a clean, paginated interface.
-   **Dark/Light Mode**: A beautiful, theme-able UI that respects user preferences for light or dark mode, built with Tailwind CSS.
-   **Serverless Deployment**: Fully configured to run on Vercel's powerful and scalable serverless infrastructure.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **AI Model**: [Google Gemini API](https://ai.google.dev/)
-   **Storage**: [Vercel Blob](httpss://vercel.com/storage/blob)
-   **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Google AI Studio API Key](https://makersuite.google.com/)
-   A [Vercel](https://vercel.com) account (for Vercel Blob storage)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shrutikajha2603/bookspot.git](https://github.com/shrutikajha2603/bookspot.git)
    cd bookspot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a new file in the root of your project named `.env.local`.
    -   Add your secret keys to this file. This file is ignored by Git and should not be committed.

    ```ini
    # .env.local

    # Your API key from Google AI Studio
    GOOGLE_GENERATIVE_AI_API_KEY="AI...your-google-key-here"

    # Your Read-Write token from your Vercel Blob store
    BLOB_READ_WRITE_TOKEN="vercel_blob_rw_...your-blob-token-here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your code** to your GitHub repository.

2.  **Import the project** into Vercel from your GitHub repository.

3.  **Configure Environment Variables:**
    -   In your Vercel project settings, navigate to the "Environment Variables" section.
    -   Add the same two variables from your `.env.local` file: `GOOGLE_GENERATIVE_AI_API_KEY` and `BLOB_READ_WRITE_TOKEN`.

4.  **Connect Vercel Blob Storage:**
    -   In your Vercel project settings, navigate to the "Storage" tab.
    -   If you haven't already, create a new Blob store and **connect it** to this project. This ensures the `BLOB_READ_WRITE_TOKEN` is correctly configured for the deployment.

5.  **Deploy!** Vercel will automatically build and deploy your project. Any subsequent pushes to your main branch will trigger a new deployment.

Made with ❤️ by **Shrutika Jha** ([@shrutikajha2603](https://github.com/shrutikajha2603)).