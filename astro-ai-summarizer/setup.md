# Setup Instructions for Astro AI Summarizer

## 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project.
2. In your project dashboard, navigate to **SQL Editor**.
3. Run the following SQL to create the `summaries` table for saving history:

```sql
create table public.summaries (
  id uuid default gen_random_uuid() primary key,
  original_text text not null,
  summary_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 2. Environment Variables

Create a `.env` file in the root of `astro-ai-summarizer` and add the following variables:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

## 3. Groq Setup

1. Get your API key from [Groq Console](https://console.groq.com/keys).
2. Add it to the `.env` file as shown above.

## 4. Running the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:4321`.
