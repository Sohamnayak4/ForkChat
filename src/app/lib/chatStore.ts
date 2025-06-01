import { Message } from '../groq';
import { ChatHistory } from '../components/ChatSidebar';

export interface Chat {
  id: string;
  messages: Message[];
  parentChatId?: string;
}

export function generateChatId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

type ChatStore = { [key: string]: Message[] };

export function getChatMessages(chatId?: string): ChatStore | Message[] {
  const chats = localStorage.getItem('chats');
  const allChats = (chats ? JSON.parse(chats) : {}) as ChatStore;
  
  // If chatId is provided, return only that chat's messages
  if (chatId) {
    return allChats[chatId] || [];
  }
  
  return allChats;
}

export function forkChat(chatId: string, messageIndex: number): string {
  const chats = getChatMessages() as ChatStore;
  const originalChat = chats[chatId];
  
  if (!originalChat) return '';

  const newChatId = generateChatId();
  const forkedMessages = originalChat.slice(0, messageIndex + 1);
  
  // Save forked chat
  chats[newChatId] = forkedMessages;
  localStorage.setItem('chats', JSON.stringify(chats));

  // Update chat history
  const history = getChatHistory();
  const originalTitle = history.find(h => h.id === chatId)?.title || 'Chat';
  
  const historyEntry: ChatHistory = {
    id: newChatId,
    title: `Fork of: ${originalTitle}`,
    lastMessage: forkedMessages[forkedMessages.length - 1]?.content || '',
    timestamp: Date.now(),
    parentChatId: chatId
  };

  history.unshift(historyEntry);
  localStorage.setItem('chatHistory', JSON.stringify(history));

  return newChatId;
}

export function saveChat(chat: Chat): void {
  const chats = getChatMessages() as ChatStore;
  chats[chat.id] = chat.messages;
  localStorage.setItem('chats', JSON.stringify(chats));

  // Update chat history
  const history = getChatHistory();
  const existingIndex = history.findIndex(h => h.id === chat.id);
  const lastMessage = chat.messages[chat.messages.length - 1]?.content || '';
  const title = chat.messages[0]?.content?.slice(0, 30) + '...' || 'New Chat';

  const historyEntry: ChatHistory = {
    id: chat.id,
    title,
    lastMessage,
    timestamp: Date.now(),
    parentChatId: chat.parentChatId
  };

  if (existingIndex !== -1) {
    history[existingIndex] = historyEntry;
  } else {
    history.unshift(historyEntry);
  }

  localStorage.setItem('chatHistory', JSON.stringify(history));
}

export function getChatHistory(): ChatHistory[] {
  const history = localStorage.getItem('chatHistory');
  return history ? JSON.parse(history) : [];
}

export function deleteChat(chatId: string): void {
  const chats = getChatMessages() as ChatStore;
  delete chats[chatId];
  localStorage.setItem('chats', JSON.stringify(chats));

  const history = getChatHistory().filter(chat => chat.id !== chatId);
  localStorage.setItem('chatHistory', JSON.stringify(history));
} 