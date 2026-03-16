# Setup Instructions for Next.js AI Chatbot

## 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project.
2. In your project dashboard, navigate to **SQL Editor**.
3. Run the following SQL to create the `chats` table for saving history:

```sql
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.chats enable row level security;

-- Create policy to insert their own chats
create policy "Users can insert their own chats" on public.chats
  for insert with check (auth.uid() = user_id);

-- Create policy to read their own chats
create policy "Users can view their own chats" on public.chats
  for select using (auth.uid() = user_id);
```

4. Go to **Authentication** -> **Providers** -> Enable **Email** (you can disable confirm email to make testing easier).

## 2. Environment Variables

Create a `.env.local` file in the root of `nextjs-groq-chatbot` and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

## 3. Groq Setup

1. Get your API key from [Groq Console](https://console.groq.com/keys).
2. Add it to the `.env.local` file as shown above.

## 4. Running the App

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.
