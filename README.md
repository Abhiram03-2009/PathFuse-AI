# PathFuse AI

An AI career navigator for students and job seekers — resume analysis, job/college matching, LinkedIn insights, and multilingual support.

## Getting started

Requires Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
# Clone the repository
git clone https://github.com/Abhiram03-2009/resumate-ai-app.git
cd resumate-ai-app

# Install dependencies
npm i

# Copy env template and fill in your Supabase project values
cp .env.example .env

# Start the dev server
npm run dev
```

## What technologies are used for this project?

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (auth, DB, edge functions)

## iOS app (Capacitor + TestFlight)

See [`ios/README.md`](ios/README.md) for building the iOS app and shipping it to TestFlight via GitHub Actions.

## Project history

PathFuse AI began as Resumate AI, a React app I wrote in spring 2025 in JavaScript, with a career chatbot, cover letter builder, job matcher, keyword matcher, multilingual support and resume builder. In June 2025 I uploaded that code to Lovable and asked it to implement the app from it. Lovable rewrote the app in TypeScript with the same features, and its edits appear in this repository's history under the author `gpt-engineer-app[bot]`. Development then continued here, with my own commits alongside Lovable's.

My original JavaScript source is preserved on the [`original-resumate-app`](../../tree/original-resumate-app) branch.
