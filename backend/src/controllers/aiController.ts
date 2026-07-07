import { Response, NextFunction } from 'express';
import https from 'https';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * Resilient HTTPS POST request helper using Node core https module.
 * Bypasses native fetch (undici) IPv6 DNS resolution issues on Windows.
 */
function postRequest(url: string, headers: any, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(postData),
      },
      // Fallback timeout
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve({
          ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          text: async () => responseBody,
          json: async () => {
            try {
              return JSON.parse(responseBody);
            } catch (err) {
              throw new Error(`Invalid JSON response: ${responseBody}`);
            }
          },
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request to OpenAI timed out (15s).'));
    });

    req.write(postData);
    req.end();
  });
}

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

    // Call OpenAI Chat Completions API using our resilient postRequest
    const response = await postRequest(
      'https://api.openai.com/v1/chat/completions',
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      {
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
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI API error response:', errBody);
      res.status(response.status).json({
        status: 'error',
        message: `OpenAI API returned an error: ${response.statusText}`,
      });
      return;
    }

    const result = await response.json();
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

