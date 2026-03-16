const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sadwika@123@db.gcvcazwcyxfzhqgrhflw.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runDeploy() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    const sql = `
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
    `;

    await client.query(sql);
    console.log("Successfully created chats and summaries tables!");

  } catch (error) {
    console.error("Error connecting or executing SQL:", error.message);
  } finally {
    await client.end();
  }
}

runDeploy();
