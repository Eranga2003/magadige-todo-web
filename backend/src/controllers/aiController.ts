import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * Break down a task into smaller actionable subtasks using OpenAI GPT model.
 */
export async function breakDownTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ status: 'error', message: 'Task description text is required for breakdown.' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ status: 'error', message: 'OpenAI API Key is not configured on the server.' });
      return;
    }

    // Call OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project manager and productivity assistant. Analyze the user\'s task/goal and break it down into a list of 3-6 concise, actionable subtasks/steps in a logical, chronological sequential order (e.g. prioritize dependencies like doing school homework before reading a book or leisure activities). You must return ONLY a JSON object containing a single key "subtasks" which is an array of strings. Do not include markdown block ticks, commentary, or extra text. Example response: {"subtasks": ["Complete school homework first", "Read a book afterwards"]}'
          },
          {
            role: 'user',
            content: text.trim()
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI API error response:', errBody);
      res.status(response.status).json({
        status: 'error',
        message: `OpenAI API returned an error: ${response.statusText}`,
      });
      return;
    }

    const result: any = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI API.');
    }

    // Parse the JSON content
    const parsed = JSON.parse(content);
    const subtasks = parsed.subtasks || [];

    res.status(200).json({
      status: 'success',
      data: {
        subtasks,
      },
    });
  } catch (error: any) {
    console.error('❌ breakDownTask failed with error:', error.message || error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
