import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateExplanation(input) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an environmental risk explanation assistant.

Rules:
- Use ONLY the provided data
- Do NOT speculate or exaggerate
- No panic, no legal language
- Neutral, public-safe tone
- One short paragraph only

Context: ${input.context}
Location: ${input.location || "Unknown"}
AQI: ${input.aqi ?? "N/A"}
Category: ${input.category || "N/A"}
Trend: ${input.trend || "Unknown"}
Wind: ${input.wind ? `${input.wind.direction}, ${input.wind.speed} m/s` : "N/A"}
Sources: ${input.sources?.join(", ") || "Unknown"}
Confidence: ${input.confidence || "Medium"}
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini LLM error:", error.message);

    return "Air quality conditions were evaluated based on available environmental data. Elevated pollution levels may affect sensitive individuals.";
  }
}

/**
 * Generate AQI alert message using Gemini
 */
export const generateAqiAlert = async ({ aqi, predictionTime }) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are an air quality alert system.

      Generate a short WhatsApp-friendly alert message.

      Context:
      - Location: Mumbai (assume urban area)
      - Predicted AQI: ${aqi}
      - Prediction time: ${new Date(predictionTime).toLocaleString()}

      Rules:
      - Keep message concise (max 6–7 lines)
      - Use warning emojis
      - Mention health advisory
      - Do NOT include markdown
      - Do NOT include disclaimers
      - Tone: authoritative but calm

      Output ONLY the alert message text.
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text().trim();

    return response;
  } catch (error) {
    console.error("❌ Gemini AQI Alert Error:", error.message);

    // 🔁 Fallback (never block cron)
    return `🚨 Air Quality Alert 🚨
Predicted AQI: ${aqi}
Time: ${new Date(predictionTime).toLocaleString()}

Air quality is hazardous.
Avoid outdoor activities and wear masks.

— Air Pollution Monitoring System`;
  }
};
