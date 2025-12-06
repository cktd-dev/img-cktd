import { GoogleGenAI } from "@google/genai";
import { DEFAULT_GEMINI_API_KEY } from "../constants";

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    if (!DEFAULT_GEMINI_API_KEY) {
      console.error("Gemini API Key is missing in constants.ts");
      throw new Error("Configuration Error: API Key is missing.");
    }
    aiInstance = new GoogleGenAI({ apiKey: DEFAULT_GEMINI_API_KEY });
  }
  return aiInstance;
};

/**
 * Converts a File object to a base64 string suitable for Gemini API
 */
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise as string,
      mimeType: file.type,
    },
  };
};

/**
 * Extracts text from an image using Gemini 2.5 Flash
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const ai = getAiClient();
    const imagePart = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          imagePart,
          { 
            text: "Extract all text present in this image. Return only the raw extracted text. Maintain the original layout logic where possible (e.g. newlines). If no text is found, simply say 'No text detected'." 
          }
        ]
      }
    });

    return response.text || "No text detected.";
  } catch (error: any) {
    console.error("Gemini Text Extraction Error:", error);
    return "Failed to extract text. Please try again.";
  }
};

/**
 * Generates or edits an image using Gemini 2.5 Flash Image (Nano Banana)
 */
export const generateAIImage = async (prompt: string, referenceFile?: File): Promise<string> => {
  try {
    const ai = getAiClient();
    const parts: any[] = [];
    
    // For editing/variations, pass image first
    if (referenceFile) {
        const imagePart = await fileToGenerativePart(referenceFile);
        parts.push(imagePart);
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) throw new Error("No response from AI");

    // Iterate to find image part
    for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
        }
    }
    
    throw new Error("No image data found in response. The model might have refused the request.");
  } catch (error: any) {
      console.error("Gemini Image Generation Error:", error);
      throw error;
  }
};