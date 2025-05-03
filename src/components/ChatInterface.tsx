
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

// Mock initial conversations
const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Getting started with AI",
    date: "Today",
    messages: [
      {
        id: "msg-1",
        content: "Hello! How can I help you today?",
        isUser: false,
        timestamp: "12:00 PM"
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

  const handleSendMessage = (content: string) => {
    const timestamp = formatTimestamp();
    
    setConversations(prevConversations => {
      return prevConversations.map(conversation => {
        if (conversation.id === activeConversationId) {
          // Add user message
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

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponses = [
        "I'm an AI assistant, and I'm here to help you with any questions or tasks you might have.",
        "That's an interesting question. Let me think about how to best answer that for you.",
        "I understand what you're asking. Here's what I can tell you about that topic.",
        "Thanks for your message. I'm designed to provide information and assistance on a wide range of topics.",
        "I appreciate your question. Let me provide you with a helpful response."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          if (conversation.id === activeConversationId) {
            return {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: generateId(),
                  content: randomResponse,
                  isUser: false,
                  timestamp: formatTimestamp()
                }
              ]
            };
          }
          return conversation;
        });
      });
      
      setIsTyping(false);
    }, 1500);
  };

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New conversation",
      date: "Just now",
      messages: [
        {
          id: generateId(),
          content: "Hello! How can I help you today?",
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
