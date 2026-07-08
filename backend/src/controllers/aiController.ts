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

/**
 * Analyze if a task is disrupted by weather using OpenAI GPT model.
 */
export async function analyzeTaskWeatherAI(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, weatherStatus, temp } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ status: 'error', message: 'Task title is required for weather analysis.' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ status: 'error', message: 'OpenAI API Key is not configured on the server.' });
      return;
    }

    const weather = weatherStatus || 'SUNNY';
    const temperature = temp !== undefined ? temp : 25;

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
            content: `You are an expert weather integration assistant. Analyze whether the user's task is affected, disrupted, or made difficult by the given weather condition: ${weather} at ${temperature}°C.
            For example:
            - If it is RAINY or STORMY, outdoor activities like "exercise at ground", "jogging", "walking outside", "painting fence", "wash car", "cricket" ARE affected.
            - Indoor activities like "study", "code", "cook", "watch movie", "office meeting", "indoor gym" are NOT affected.
            - If it is WINDY, outdoor activities like "badminton", "drone flying" ARE affected.
            - If it is extremely hot (>35°C), heavy outdoor workouts ARE affected.
            You must return ONLY a JSON object containing three keys:
            1. "isAffected": boolean (true if the task is disrupted, false otherwise)
            2. "reason": string (a short reason like "Rain", "Thunderstorm", "High Winds", "Extreme Heat", or empty if not affected)
            3. "suggestion": string (a short, encouraging tip like "Move your exercise session indoors or reschedule for a dry day" or empty if not affected)
            Do not include markdown blocks (e.g. \`\`\`json ... \`\`\`), commentary, or extra text. Example response: {"isAffected": true, "reason": "Rain", "suggestion": "Move your exercise session indoors or reschedule for a dry day"}`
          },
          {
            role: 'user',
            content: `Analyze task: "${title.trim()}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI API weather analysis error response:', errBody);
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

    const parsed = JSON.parse(content);
    res.status(200).json({
      status: 'success',
      data: {
        isAffected: !!parsed.isAffected,
        reason: parsed.reason || '',
        suggestion: parsed.suggestion || ''
      }
    });
  } catch (error: any) {
    console.error('❌ analyzeTaskWeatherAI failed:', error.message || error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error',
    });
  }
}


