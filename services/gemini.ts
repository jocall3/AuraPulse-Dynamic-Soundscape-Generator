
import { GoogleGenAI, Type } from "@google/genai";
import { EnvironmentalData, OfficeSensorData, SoundscapePreset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendation = async (
  env: EnvironmentalData,
  office: OfficeSensorData,
  availablePresets: SoundscapePreset[]
) => {
  const model = "gemini-3-flash-preview";
  
  // Fix: Corrected Occupancy field to use office.occupancyCount instead of env.weatherCondition
  const prompt = `
    Analyze the following environmental and office data to recommend the best soundscape.
    
    ENVIRONMENTAL DATA:
    Weather: ${env.weatherCondition}
    Temperature: ${env.temperatureCelsius}°C
    Time: ${env.timeOfDay}
    Location: ${env.locationName}
    Noise Level: ${env.ambientNoiseLevelDB}dB
    
    OFFICE DATA:
    Occupancy: ${office.occupancyCount}
    Activity: ${office.averageActivityLevel}
    Events: ${office.calendarEvents.map(e => e.eventName).join(', ')}
    
    AVAILABLE PRESETS:
    ${availablePresets.map(p => `${p.id}: ${p.name} (${p.description})`).join('\n')}
    
    Recommend one preset ID and provide a short, professional reason for this choice.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedPresetId: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["recommendedPresetId", "reason"]
        }
      }
    });

    // Fix: Access .text as a property and handle potential undefined value
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return null;
  }
};

export const generatePresetDescription = async (presetName: string, tags: string[]) => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a professional 1-sentence description for a soundscape preset named "${presetName}" with these tags: ${tags.join(', ')}.`
    });
    // Fix: Use optional chaining or nullish coalescing when accessing response.text
    return response.text?.trim() || "";
};
