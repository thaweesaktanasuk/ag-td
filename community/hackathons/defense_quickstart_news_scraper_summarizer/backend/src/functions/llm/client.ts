import OpenAI from "openai/index";
import dotenv from 'dotenv';

dotenv.config();

let openaiInstance: OpenAI | null = null;

export const llmClient = (): OpenAI => {
    if (!process.env.OPENBABYLON_API_URL) {
        throw new Error("OPENBABYLON_API_URL is not set in environment variables.");
    }

    const baseUrl = process.env.OPENBABYLON_API_URL.startsWith('http')
        ? process.env.OPENBABYLON_API_URL
        : `http://${process.env.OPENBABYLON_API_URL}`;

    if (!openaiInstance) {
        openaiInstance = new OpenAI({
            baseURL: baseUrl,
            apiKey: `non-existent`,
        });
    }
    return openaiInstance;
};