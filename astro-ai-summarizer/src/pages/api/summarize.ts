export const prerender = false;

import type { APIRoute } from 'astro';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required '}), { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert summarizer. Provide a concise, highly accurate summary of the following text in a few paragraphs. Format cleanly.' },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant',
    });

    const summary = completion.choices[0]?.message?.content;

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server Error' }), { status: 500 });
  }
};
