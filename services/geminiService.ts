import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// process.env.API_KEY is guaranteed to be available per system instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  } catch (error) {
    console.error("Gemini Text Extraction Error:", error);
    throw new Error("Failed to extract text from the image.");
  }
};