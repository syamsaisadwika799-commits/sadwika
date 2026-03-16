import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
    });

    const responseMessage = completion.choices[0]?.message?.content;

    return NextResponse.json({ message: responseMessage });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    return NextResponse.json({ error: error.message || 'Error communicating with AI' }, { status: 500 });
  }
}
