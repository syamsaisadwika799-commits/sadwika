import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the API outside the handler so it can be reused
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, prompt } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Determine the mime type from the base64 prefix if needed, though gemini can often infer
    // The format from the client might be: data:image/jpeg;base64,...
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || 'Describe this image in detail and write a creative, engaging caption for it.' },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              }
            }
          ]
        }
      ]
    });

    const caption = response.text;

    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error.message || 'Error processing image with Gemini' }, { status: 500 });
  }
}
