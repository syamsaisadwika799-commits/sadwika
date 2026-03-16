create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.summaries (
  id uuid default gen_random_uuid() primary key,
  original_text text not null,
  summary_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
