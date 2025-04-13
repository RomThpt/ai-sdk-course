import { streamText, tool } from "ai";
import { z } from "zod";
import { mistral_model } from "../../models/mistral_model";

// Define weather code interpretation for user-friendly responses
const weatherCodes: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

// Simple city to coordinates mapping
const cityCoordinates: Record<string, Coordinates> = {
  london: { latitude: 51.5074, longitude: -0.1278 },
  "new york": {
    latitude: 40.7128,
    longitude: -74.006,
  },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
  berlin: { latitude: 52.52, longitude: 13.405 },
  sydney: { latitude: -33.8688, longitude: 151.2093 },
  rome: { latitude: 41.9028, longitude: 12.4964 },
  beijing: { latitude: 39.9042, longitude: 116.4074 },
  moscow: { latitude: 55.7558, longitude: 37.6173 },
  cairo: { latitude: 30.0444, longitude: 31.2357 },
  // Add translated city names
  londres: { latitude: 51.5074, longitude: -0.1278 }, // London in French
  "nueva york": {
    latitude: 40.7128,
    longitude: -74.006,
  }, // New York in Spanish
  tokio: { latitude: 35.6762, longitude: 139.6503 }, // Tokyo in Spanish/Italian
  rom: { latitude: 41.9028, longitude: 12.4964 }, // Rome in German
  roma: { latitude: 41.9028, longitude: 12.4964 }, // Rome in Italian/Spanish
  pekin: { latitude: 39.9042, longitude: 116.4074 }, // Beijing in French
  moscu: { latitude: 55.7558, longitude: 37.6173 }, // Moscow in Spanish
  moscou: { latitude: 55.7558, longitude: 37.6173 }, // Moscow in French
  "el cairo": {
    latitude: 30.0444,
    longitude: 31.2357,
  }, // Cairo in Spanish
  "le caire": {
    latitude: 30.0444,
    longitude: 31.2357,
  }, // Cairo in French
};

const getWeatherTool = tool({
  description:
    "Get the current weather in the specified city",
  parameters: z.object({
    city: z
      .string()
      .describe("The city to get the weather for"),
    units: z
      .string()
      .default("metric")
      .describe(
        "Units to use for temperature (metric or imperial)"
      ),
  }),
  execute: async ({ city, units = "metric" }) => {
    const lowercaseCity = city.toLowerCase();
    const coordinates = cityCoordinates[lowercaseCity];

    if (!coordinates) {
      return `Sorry, I don't have coordinates for ${city}.`;
    }

    try {
      const { latitude, longitude } = coordinates;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.current) {
        return `Error fetching weather data for ${city}.`;
      }

      const {
        temperature_2m,
        relative_humidity_2m,
        rain,
        weather_code,
      } = data.current;
      const weatherDescription =
        weatherCodes[weather_code] ||
        "Unknown weather condition";
      const tempUnit =
        units === "imperial" ? "°F" : "°C";

      return `The weather in ${city} is ${temperature_2m}${tempUnit} with ${weatherDescription}. 
Humidity: ${relative_humidity_2m}%, Rain: ${rain}mm.`;
    } catch (error) {
      console.error("Weather API error:", error);
      return `Sorry, I couldn't fetch the weather for ${city} due to an error.`;
    }
  },
});

const getHourlyForecastTool = tool({
  description:
    "Get an hourly weather forecast for the specified city",
  parameters: z.object({
    city: z
      .string()
      .describe("The city to get the forecast for"),
    hours: z
      .number()
      .optional()
      .describe(
        "Number of hours to forecast (max 24)"
      ),
    units: z
      .string()
      .default("metric")
      .describe(
        "Units to use for temperature (metric or imperial)"
      ),
  }),
  execute: async ({
    city,
    hours = 6,
    units = "metric",
  }) => {
    const lowercaseCity = city.toLowerCase();
    const coordinates = cityCoordinates[lowercaseCity];

    if (!coordinates) {
      return `Sorry, I don't have coordinates for ${city}.`;
    }

    try {
      const { latitude, longitude } = coordinates;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation_probability,weather_code`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.hourly) {
        return `Error fetching forecast data for ${city}.`;
      }

      const limitedHours = Math.min(hours, 24);
      const tempUnit =
        units === "imperial" ? "°F" : "°C";
      let forecastText = `Hourly forecast for ${city} (next ${limitedHours} hours):\n`;

      for (let i = 0; i < limitedHours; i++) {
        const time = new Date(
          data.hourly.time[i]
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const temp = data.hourly.temperature_2m[i];
        const precipProb =
          data.hourly.precipitation_probability[i];
        const weatherDesc =
          weatherCodes[data.hourly.weather_code[i]] ||
          "Unknown";

        forecastText += `${time}: ${temp}${tempUnit}, ${weatherDesc}, ${precipProb}% chance of precipitation\n`;
      }

      return forecastText;
    } catch (error) {
      console.error("Weather API error:", error);
      return `Sorry, I couldn't fetch the forecast for ${city} due to an error.`;
    }
  },
});

export const askWeather = async (prompt: string) => {
  try {
    console.log(
      "Starting askWeather with prompt:",
      prompt
    );

    // Extract city name with a simple regex - looking for city names after common patterns
    const cityMatches = prompt.match(
      /(?:à|in|for|weather in|temps à|temps a)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?:\?|$|\s)/i
    );
    const city =
      cityMatches && cityMatches[1]
        ? cityMatches[1].trim()
        : "London"; // Default to London if no city found

    console.log(`Detected city: ${city}`);

    // Try the AI streaming approach first
    const { textStream } = await streamText({
      model: mistral_model,
      prompt,
      tools: {
        getWeather: getWeatherTool,
        getHourlyForecast: getHourlyForecastTool,
      },
      maxSteps: 2,
    });

    console.log("Stream created successfully");

    let fullResponse = "";
    for await (const text of textStream) {
      process.stdout.write(text);
      fullResponse += text;
    }

    console.log(
      "\nFull response collected:",
      fullResponse ? "Non-empty" : "Empty"
    );

    // If no response from LLM, fallback to direct tool call
    if (!fullResponse) {
      console.log(
        "No streaming response, falling back to direct API call"
      );
      // Call weather API directly rather than tool
      try {
        const lowercaseCity = city.toLowerCase();
        const coordinates =
          cityCoordinates[lowercaseCity];

        if (!coordinates) {
          return `Sorry, I don't have coordinates for ${city}.`;
        }

        const { latitude, longitude } = coordinates;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.current) {
          return `Error fetching weather data for ${city}.`;
        }

        const {
          temperature_2m,
          relative_humidity_2m,
          rain,
          weather_code,
        } = data.current;
        const weatherDescription =
          weatherCodes[weather_code] ||
          "Unknown weather condition";

        const result = `The weather in ${city} is ${temperature_2m}°C with ${weatherDescription}. Humidity: ${relative_humidity_2m}%, Rain: ${rain}mm.`;
        console.log("Direct API result:", result);
        return result;
      } catch (error) {
        console.error("Weather API error:", error);
        return `Sorry, I couldn't fetch the weather for ${city} due to an error.`;
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error in askWeather:", error);
    // Final fallback - direct API call
    try {
      console.log(
        "Attempting direct API call as final fallback"
      );
      const city = "London"; // Default fallback
      const coords = cityCoordinates[
        city.toLowerCase()
      ] || { latitude: 51.5074, longitude: -0.1278 };

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code`
      );
      const data = await response.json();

      if (data.current) {
        const {
          temperature_2m,
          relative_humidity_2m,
          rain,
          weather_code,
        } = data.current;
        const weatherDescription =
          weatherCodes[weather_code] ||
          "Unknown weather condition";

        return `The weather in ${city} is ${temperature_2m}°C with ${weatherDescription}. Humidity: ${relative_humidity_2m}%, Rain: ${rain}mm.`;
      }
    } catch (fallbackError) {
      console.error(
        "Even fallback API call failed:",
        fallbackError
      );
    }

    return `Error processing weather request: ${error.message}`;
  }
};
