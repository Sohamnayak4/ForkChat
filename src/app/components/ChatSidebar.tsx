'use client';

import { PlusIcon, ChatBubbleLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  parentChatId?: string;
}

interface ChatSidebarProps {
  currentChatId?: string;
  onNewChat: () => void;
}

export default function ChatSidebar({ currentChatId, onNewChat }: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const router = useRouter();

  useEffect(() => {
    const history = localStorage.getItem('chatHistory');
    if (history) {
      setChatHistory(JSON.parse(history));
    }
  }, []);

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    
    if (id === currentChatId) {
      onNewChat();
    }
  };

  const selectChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  // Group chats by parent
  const groupedChats = chatHistory.reduce((acc, chat) => {
    if (!chat.parentChatId) {
      if (!acc[chat.id]) {
        acc[chat.id] = { main: chat, forks: [] };
      } else {
        acc[chat.id].main = chat;
      }
    } else {
      if (!acc[chat.parentChatId]) {
        acc[chat.parentChatId] = { main: null, forks: [chat] };
      } else {
        acc[chat.parentChatId].forks.push(chat);
      }
    }
    return acc;
  }, {} as Record<string, { main: ChatHistory | null; forks: ChatHistory[] }>);

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedChats).map(([parentId, { main, forks }]) => (
          <div key={parentId}>
            {main && (
              <div
                onClick={() => selectChat(main.id)}
                className={`flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  currentChatId === main.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {main.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {main.lastMessage}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteChat(main.id, e)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            )}
            {forks.length > 0 && (
              <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                {forks.map((fork) => (
                  <div
                    key={fork.id}
                    onClick={() => selectChat(fork.id)}
                    className={`flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      currentChatId === fork.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {fork.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {fork.lastMessage}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteChat(fork.id, e)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 