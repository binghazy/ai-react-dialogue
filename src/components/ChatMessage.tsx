
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  content: string;
  isUser: boolean;
  timestamp?: string;
  animationDelay?: number;
};

const ChatMessage = ({ content, isUser, timestamp, animationDelay = 0 }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "py-6 px-4 md:px-8 flex w-full items-start gap-4 message-appear",
        isUser ? "bg-white" : "bg-[hsl(var(--chat-ai-bg))]"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex-shrink-0">
        <Avatar className={cn(
          "h-8 w-8 flex items-center justify-center",
          isUser ? "bg-blue-100" : "bg-streamlit-primary/20"
        )}>
          {isUser ? (
            <User size={18} className="text-blue-600" />
          ) : (
            <Bot size={18} className="text-streamlit-primary" />
          )}
        </Avatar>
      </div>

      <div className="flex flex-col w-full">
        <div className="text-sm font-medium mb-1">
          {isUser ? 'You' : 'Tamer Elgayar'}
          {timestamp && <span className="text-xs text-gray-400 ml-2">{timestamp}</span>}
        </div>
        <div className="prose max-w-none">
          {isUser ? (
            content
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
