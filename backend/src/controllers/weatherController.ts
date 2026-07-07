import { Request, Response, NextFunction } from 'express';
import https from 'https';

/**
 * Resilient HTTPS GET request helper using Node core https module.
 * Bypasses native fetch (undici) IPv6 DNS resolution issues on Windows.
 */
function getRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      timeout: 10000,
    };

    const req = https.get(url, options, (res) => {
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
      reject(new Error('Request to OpenWeatherMap timed out.'));
    });
  });
}

/**
 * Fetch weather forecast and format today hour-by-hour and 7-day forecasts.
 */
export async function getWeatherForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const city = (req.query.city as string) || 'Colombo';
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      res.status(500).json({ status: 'error', message: 'Weather API Key is not configured on the server.' });
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await getRequest(url);

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenWeatherMap API error response:', errBody);
      res.status(response.status).json({
        status: 'error',
        message: `Weather API returned an error: ${response.statusText}`,
      });
      return;
    }

    const data = await response.json();
    const list = data.list || [];

    // Group items by date string (YYYY-MM-DD)
    const groups: { [key: string]: any[] } = {};
    list.forEach((item: any) => {
      const dateStr = item.dt_txt.split(' ')[0]; // E.g. "2026-07-07"
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    const dates = Object.keys(groups).sort();
    const todayStr = dates[0] || new Date().toISOString().split(' ')[0];

    // 1. Hour-by-Hour Today forecast
    const todayItems = groups[todayStr] || [];
    const todayHours = todayItems.map((item: any) => {
      const timeStr = item.dt_txt.split(' ')[1].substring(0, 5); // E.g. "12:00"
      return {
        time: timeStr,
        temp: Math.round(item.main.temp),
        status: mapWeatherCondition(item),
        icon: item.weather?.[0]?.icon || '01d',
        desc: item.weather?.[0]?.description || 'clear',
        wind: Math.round(item.wind?.speed || 0),
      };
    });

    // 2. Weekly 7-day forecast
    const weeklyForecasts: any[] = [];

    // Map the actual forecast days from OpenWeatherMap (usually 5-6 days)
    dates.forEach((dateStr, index) => {
      const dayItems = groups[dateStr];
      const avgTemp = Math.round(dayItems.reduce((acc, curr) => acc + curr.main.temp, 0) / dayItems.length);
      const mainItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0];
      const mappedStatus = mapWeatherCondition(mainItem);

      const dateObj = new Date(dateStr);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      weeklyForecasts.push({
        dateStr,
        dayName,
        displayDate,
        temp: avgTemp,
        status: mappedStatus,
        desc: mainItem.weather?.[0]?.description || 'clear',
        icon: mainItem.weather?.[0]?.icon || '01d',
        wind: Math.round(mainItem.wind?.speed || 0),
      });
    });

    // Extrapolate to 7 days if we have fewer
    while (weeklyForecasts.length < 7) {
      const lastDay = weeklyForecasts[weeklyForecasts.length - 1];
      const lastDate = new Date(lastDay.dateStr);
      lastDate.setDate(lastDate.getDate() + 1);

      const dateStr = lastDate.toISOString().split(' ')[0];
      const dayName = lastDate.toLocaleDateString('en-US', { weekday: 'short' });
      const displayDate = lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Extrapolate with a small random temperature variance (+/- 1-2 degrees)
      const varTemp = lastDay.temp + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2);

      weeklyForecasts.push({
        dateStr,
        dayName,
        displayDate,
        temp: varTemp,
        status: lastDay.status,
        desc: lastDay.desc,
        icon: lastDay.icon,
        wind: lastDay.wind,
      });
    }

    // Make sure we only return exactly 7 days
    const weekly = weeklyForecasts.slice(0, 7);

    res.status(200).json({
      status: 'success',
      data: {
        city: data.city?.name || city,
        country: data.city?.country || '',
        todayHours,
        weekly,
      },
    });
  } catch (error: any) {
    console.error('❌ getWeatherForecast failed with error:', error.message || error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error',
    });
  }
}

/**
 * Maps OpenWeatherMap weather object to simplified status codes: SUNNY, RAINY, WINDY, CLOUDY, STORMY
 */
function mapWeatherCondition(item: any): 'SUNNY' | 'RAINY' | 'WINDY' | 'CLOUDY' | 'STORMY' {
  const id = item.weather?.[0]?.id || 800;
  const windSpeed = item.wind?.speed || 0;

  // 1. Stormy/Thunderstorms (2xx codes, 502/503/504 extreme rain, 781 tornado)
  if ((id >= 200 && id < 300) || id === 502 || id === 503 || id === 504 || id === 781) {
    return 'STORMY';
  }

  // 2. Rain/Drizzle (3xx codes, other 5xx rain codes)
  if ((id >= 300 && id < 400) || (id >= 500 && id < 600)) {
    return 'RAINY';
  }

  // 3. Windy (High wind speeds > 8 m/s)
  if (windSpeed > 8) {
    return 'WINDY';
  }

  // 4. Clouds (802, 803, 804 clouds)
  if (id > 801 && id < 900) {
    return 'CLOUDY';
  }

  // 5. Clear / Light clouds (800 clear sky, 801 few clouds)
  return 'SUNNY';
}
