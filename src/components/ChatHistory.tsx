
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, User, BarChart, Activity } from 'lucide-react';

type Conversation = {
  id: string;
  title: string;
  date: string;
};

type ChatHistoryProps = {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isMobile?: boolean;
  onClose?: () => void;
  onLogin?: () => void;
  isLoggedIn?: boolean;
  onViewChange?: (view: string) => void;
  activeView?: string;
};

const ChatHistory = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  isMobile = false,
  onClose,
  onLogin,
  isLoggedIn = false,
  onViewChange,
  activeView = 'chat',
}: ChatHistoryProps) => {
  return (
    <div className="h-full flex flex-col bg-[hsl(var(--chat-sidebar))] border-r border-[hsl(var(--chat-border))]">
      <div className="p-4">
        <div className="text-xl font-bold mb-6 text-center text-streamlit-primary">Gayar</div>
        
        {!isMobile && onLogin && (
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-start gap-2 mb-4 border-streamlit-primary/30 hover:bg-streamlit-primary/10"
            onClick={onLogin}
          >
            <User size={16} className="text-streamlit-primary" />
            {isLoggedIn ? "User Profile" : "Login"}
          </Button>
        )}

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-start gap-2 mb-4 bg-streamlit-primary text-white hover:bg-streamlit-primary/90"
          onClick={onNewConversation}
        >
          <Plus size={16} />
          New chat
        </Button>
        
        {onViewChange && (
          <>
            <Button 
              variant="ghost" 
              className={`w-full flex items-center justify-start gap-2 mb-2 ${activeView === 'metrics' ? 'bg-streamlit-primary/10 text-streamlit-primary' : ''}`}
              onClick={() => onViewChange('metrics')}
            >
              <BarChart size={16} className={activeView === 'metrics' ? 'text-streamlit-primary' : ''} />
              Metrics
            </Button>
            
            <Button 
              variant="ghost" 
              className={`w-full flex items-center justify-start gap-2 mb-4 ${activeView === 'analysis' ? 'bg-streamlit-primary/10 text-streamlit-primary' : ''}`}
              onClick={() => onViewChange('analysis')}
            >
              <Activity size={16} className={activeView === 'analysis' ? 'text-streamlit-primary' : ''} />
              Analysis
            </Button>
          </>
        )}
        
        {isMobile && onClose && (
          <Button 
            variant="ghost" 
            className="md:hidden w-full mb-2"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full text-left p-3 rounded-md mb-1 flex items-center gap-2 text-sm transition-colors ${
              activeConversation === conversation.id && activeView === 'chat'
                ? "bg-streamlit-primary/10 text-streamlit-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <MessageSquare size={16} className={activeConversation === conversation.id && activeView === 'chat' ? "text-streamlit-primary" : ""} />
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
  );
};

export default ChatHistory;
