# Setup Instructions for Gemini Image Caption Generator

## 1. Environment Variables

Create a `.env.local` file in the root of `nextjs-gemini-captioner` and add the following variable:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

## 2. Gemini API Setup

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it to the `.env.local` file as shown above.

## 3. Running the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000` (or `3001` if port 3000 is taken).
