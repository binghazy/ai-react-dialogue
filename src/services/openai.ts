
import { toast } from "@/hooks/use-toast";

// Define the type for chat messages
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatCompletionOptions = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
};

export const defaultModel = "gpt-4o";

export async function createChatCompletion(options: ChatCompletionOptions) {
  // Get API key from localStorage instead of environment variable
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    toast({
      title: "API Key Missing",
      description: "Please set your OpenAI API key to use the chat",
      variant: "destructive",
    });
    throw new Error("OpenAI API key is not set");
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || defaultModel,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error?.message || "Failed to get response from OpenAI");
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to get response from OpenAI",
      variant: "destructive",
    });
    throw error;
  }
}
