import { GoogleGenAI } from "@google/genai";

// Declare the global constant injected by Vite
declare const __GEMINI_API_KEY__: string | undefined;

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    // 1. Try standard Vite env object (Best for Vercel VITE_ prefix)
    let key = import.meta.env.VITE_API_KEY;
    
    // 2. Fallback to the global constant injected by vite.config.ts
    // This catches cases where VITE_ prefix wasn't used but API_KEY was set in system
    if (!key && typeof __GEMINI_API_KEY__ !== 'undefined') {
      key = __GEMINI_API_KEY__;
    }

    if (!key) {
      console.error("Gemini API Key could not be found in environment variables.");
      throw new Error("Configuration Error: API Key missing. Please set VITE_API_KEY in Vercel Settings.");
    }
    
    aiInstance = new GoogleGenAI({ apiKey: key });
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
    
    if (error.message.includes("API Key missing")) {
        return "Setup Error: VITE_API_KEY is missing in Vercel Environment Variables. Please add it and redeploy.";
    }
    return "Failed to extract text. Please try again.";
  }
};