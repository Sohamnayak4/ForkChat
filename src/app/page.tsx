'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateChatId } from './lib/chatStore';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const newChatId = generateChatId();
    router.push(`/chat/${newChatId}`);
  }, [router]);

  return null;
}