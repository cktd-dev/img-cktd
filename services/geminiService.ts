import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    // Priority: 
    // 1. VITE_API_KEY (Standard Vite way, highly recommended)
    // 2. API_KEY (Fallback if injected via define in vite.config.ts)
    const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      console.error("API Key not found. Checked import.meta.env.VITE_API_KEY and process.env.API_KEY");
      throw new Error("Gemini API Key is missing. Please add VITE_API_KEY to your Vercel Environment Variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
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
    // Return a user-friendly error string instead of crashing
    if (error.message.includes("API Key is missing")) {
        return "Configuration Error: API Key missing. Please set VITE_API_KEY in Vercel.";
    }
    return "Failed to extract text. Please try again.";
  }
};