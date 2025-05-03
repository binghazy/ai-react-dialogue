
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createChatCompletion, ChatMessage as OpenAIMessage, defaultModel } from '@/services/openai';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  date: string;
  messages: Message[];
};

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Initial welcome message from the assistant
const welcomeMessage = "Hello! I'm a ChatGPT assistant powered by OpenAI's GPT-4o. How can I help you today?";

// Mock initial conversations
const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Getting started with AI",
    date: "Today",
    messages: [
      {
        id: "msg-1",
        content: welcomeMessage,
        isUser: false,
        timestamp: formatTimestamp()
      }
    ]
  }
];

const ChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversations[0].id);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleSendMessage = async (content: string) => {
    const timestamp = formatTimestamp();
    
    // Add user message
    setConversations(prevConversations => {
      return prevConversations.map(conversation => {
        if (conversation.id === activeConversationId) {
          const updatedMessages = [
            ...conversation.messages,
            {
              id: generateId(),
              content,
              isUser: true,
              timestamp
            }
          ];
          
          return {
            ...conversation,
            messages: updatedMessages,
            // Update title if it's the first user message
            title: conversation.messages.length <= 1 ? content.substring(0, 30) + (content.length > 30 ? "..." : "") : conversation.title
          };
        }
        return conversation;
      });
    });

    // Generate API message format
    try {
      setIsTyping(true);
      
      // Create the messages array for the API
      const apiMessages: OpenAIMessage[] = [];
      
      // Add system message
      apiMessages.push({
        role: "system",
        content: "You are a helpful assistant. Respond in a concise and friendly manner."
      });
      
      // Add conversation history (limited to last 10 messages to save tokens)
      const historyMessages = activeConversation?.messages.slice(-10) || [];
      historyMessages.forEach(msg => {
        apiMessages.push({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        });
      });
      
      // Add current message
      apiMessages.push({
        role: "user",
        content: content
      });
      
      // Call OpenAI API
      const response = await createChatCompletion({
        model: defaultModel,
        messages: apiMessages
      });
      
      // Extract the assistant's reply
      const assistantReply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      // Add assistant message to the conversation
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.id === activeConversationId) {
            return {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: generateId(),
                  content: assistantReply,
                  isUser: false,
                  timestamp: formatTimestamp()
                }
              ]
            };
          }
          return conversation;
        });
      });
      
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New conversation",
      date: "Just now",
      messages: [
        {
          id: generateId(),
          content: welcomeMessage,
          isUser: false,
          timestamp: formatTimestamp()
        }
      ]
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newConversation.id);
    setSidebarOpen(false); // Auto-close sidebar on mobile after selection
    
    toast({
      title: "New conversation started",
      description: "You can now start chatting with the AI."
    });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false); // Auto-close sidebar on mobile after selection
  };

  useEffect(() => {
    // Set sidebar open by default on desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden border-b flex items-center p-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </Button>
        <div className="flex-1 text-center font-medium">
          {activeConversation?.title || "Chat"}
        </div>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 lg:w-80 
        ${isMobile ? 'absolute z-20 h-[calc(100%-3rem)] top-12' : 'h-full'}
      `}>
        <ChatHistory 
          conversations={conversations}
          activeConversation={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={startNewConversation}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full md:h-screen">
        <div className="flex-1 overflow-y-auto">
          {messages.map((message, index) => (
            <ChatMessage 
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              animationDelay={index * 100}
            />
          ))}
          
          {isTyping && (
            <div className="py-6 px-4 md:px-8 flex items-center gap-4 bg-[hsl(var(--chat-ai-bg))]">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-sm">AI</span>
              </div>
              <div className="typing-indicator font-medium text-sm">
                ChatGPT is thinking
              </div>
            </div>
          )}
          
          <div className="h-36"></div> {/* Spacer for better scrolling */}
        </div>
        
        {/* Chat input */}
        <div className="border-t p-2 bg-white">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
