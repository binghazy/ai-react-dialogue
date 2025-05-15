
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { Button } from '@/components/ui/button';
import { Menu, User, BarChart, Activity } from 'lucide-react';
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
const welcomeMessage = "Hello! I'm Tamer Elgayar, your AI assistant. How can I help you today?";

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
  const [activeView, setActiveView] = useState<'chat' | 'metrics' | 'analysis'>('chat');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
    toast({
      title: isLoggedIn ? "Logged out" : "Logged in",
      description: isLoggedIn ? "You have been logged out" : "You are now logged in as User"
    });
  };

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
    setActiveView('chat');
    
    toast({
      title: "New conversation started",
      description: "You can now start chatting with the AI."
    });
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false); // Auto-close sidebar on mobile after selection
    setActiveView('chat');
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'metrics':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <BarChart size={64} className="text-streamlit-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chat Metrics</h2>
            <p className="text-center text-gray-600 max-w-md">
              Track your conversation statistics and usage patterns over time. This feature will show charts and data visualization of your chat activity.
            </p>
          </div>
        );
      case 'analysis':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Activity size={64} className="text-streamlit-secondary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Content Analysis</h2>
            <p className="text-center text-gray-600 max-w-md">
              Get insights about the content of your conversations, including sentiment analysis, topic detection, and key points extraction.
            </p>
          </div>
        );
      case 'chat':
      default:
        return (
          <>
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
                  <div className="h-8 w-8 rounded-full bg-streamlit-primary/20 flex items-center justify-center">
                    <span className="text-streamlit-primary text-sm">AI</span>
                  </div>
                  <div className="typing-indicator font-medium text-sm">
                    Tamer Elgayar is thinking
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
          </>
        );
    }
  };

  useEffect(() => {
    // Set sidebar open by default on desktop
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar toggle with app title */}
      <div className="md:hidden border-b flex items-center p-2 bg-app-dark">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white"
        >
          <Menu size={20} />
        </Button>
        <div className="flex-1 text-center font-medium text-white">
          {activeConversation?.title || "Gayar"}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleLogin} 
          className="w-9 h-9"
        >
          <User size={16} />
        </Button>
      </div>
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 lg:w-80 
        ${isMobile ? 'absolute z-20 h-[calc(100%-3rem)] top-12' : 'h-full'}
      `}>
        <div className="h-full flex flex-col bg-app-dark border-r border-gray-800">
          {/* App title for desktop */}
          <div className="hidden md:flex items-center justify-center p-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">GAYAR FIT</h1>
          </div>
          
          <div className="p-4">
            {/* Desktop login button */}
            {!isMobile && (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start gap-2 mb-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={handleLogin}
              >
                <User size={16} />
                {isLoggedIn ? "User Profile" : "Login"}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-start gap-2 mb-4 bg-streamlit-primary text-white hover:bg-streamlit-primary/90"
              onClick={startNewConversation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              New chat
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full flex items-center justify-start gap-2 mb-2 text-gray-300 ${activeView === 'metrics' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => setActiveView('metrics')}
            >
              <BarChart size={16} />
              Metrics
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full flex items-center justify-start gap-2 mb-4 text-gray-300 ${activeView === 'analysis' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              onClick={() => setActiveView('analysis')}
            >
              <Activity size={16} />
              Analysis
            </Button>
            
            {isMobile && (
              <Button 
                variant="ghost" 
                className="md:hidden w-full mb-2 text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                Close
              </Button>
            )}
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-md mb-1 flex items-center gap-2 text-sm transition-colors ${
                  activeConversationId === conversation.id && activeView === 'chat'
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <div className="flex-1 truncate">{conversation.title}</div>
              </button>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center text-gray-500 mt-4 text-sm">
                No conversations yet
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full md:h-screen">
        {/* App title for desktop in main area */}
        <div className="md:flex hidden items-center p-3 border-b border-gray-800 bg-app-dark">
          <h1 className="text-2xl font-bold text-white">GAYAR FIT</h1>
        </div>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default ChatInterface;
