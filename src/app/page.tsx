'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, streamCompletion } from './groq';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, ShareIcon } from '@heroicons/react/24/outline';
import MessageContent from './components/MessageContent';
import ChatSidebar from './components/ChatSidebar';
import { generateChatId, saveChat, getChatMessages, forkChat } from './lib/chatStore';
import { useRouter, useParams } from 'next/navigation';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const chatId = params?.chatId as string;

  useEffect(() => {
    setMounted(true);
    if (chatId) {
      const chats = getChatMessages();
      if (chats[chatId]) {
        setMessages(chats[chatId]);
      }
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleNewChat = () => {
    const newChatId = generateChatId();
    setMessages([]);
    router.push(`/chat/${newChatId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentChatId = chatId || generateChatId();
    if (!chatId) {
      router.push(`/chat/${currentChatId}`);
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const completion = await streamCompletion([...messages, userMessage]);
      let fullContent = '';

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;
        setStreamingContent(fullContent);
      }

      const newMessages: Message[] = [...messages, userMessage, { role: 'assistant', content: fullContent }];
      setMessages(newMessages);
      setStreamingContent('');
      
      // Save to local storage
      saveChat({
        id: currentChatId,
        messages: newMessages,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFork = (index: number) => {
    if (!chatId) return;
    const newChatId = forkChat(chatId, index);
    if (newChatId) {
      router.push(`/chat/${newChatId}`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ChatSidebar currentChatId={chatId} onNewChat={handleNewChat} />
      
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white dark:bg-gray-800 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Fork Chat</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-xl font-semibold mb-2">Welcome to the Chat!</p>
                <p>Start a conversation by typing a message below.</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 group relative ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white dark:bg-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md'
                } transform transition-all duration-200 hover:scale-[1.02]`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                  <MessageContent content={message.content} />
                )}
                <button
                  onClick={() => handleFork(index)}
                  className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  title="Fork from this message"
                >
                  <ShareIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[70%] rounded-2xl p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md">
                <MessageContent content={streamingContent} />
                <span className="inline-block w-2 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 shadow-md">
          <div className="flex space-x-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                       bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 
                ${isLoading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-lg'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}