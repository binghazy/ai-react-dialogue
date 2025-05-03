
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
  try {
    // Mock API response for demo purposes
    console.log("Creating chat completion with options:", options);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simple response based on the last user message
    const lastUserMessage = options.messages.findLast(m => m.role === "user")?.content || "";
    
    let response = "";
    if (lastUserMessage.toLowerCase().includes("hello") || lastUserMessage.toLowerCase().includes("hi")) {
      response = "Hello! How can I assist you today?";
    } else if (lastUserMessage.toLowerCase().includes("help")) {
      response = "I'm here to help! What do you need assistance with?";
    } else if (lastUserMessage.toLowerCase().includes("thanks") || lastUserMessage.toLowerCase().includes("thank you")) {
      response = "You're welcome! Is there anything else I can help with?";
    } else {
      response = `Thank you for your message. This is a simulated response for demonstration purposes. In a real implementation, this would connect to the OpenAI API with your key.`;
    }

    return {
      choices: [
        {
          message: {
            content: response,
            role: "assistant"
          }
        }
      ]
    };
  } catch (error) {
    console.error("Error in mock OpenAI API:", error);
    throw error;
  }
}
