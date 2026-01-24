"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Bot, Square } from 'lucide-react'

// Optimize: dynamically load the heavy chat component only on interaction
const ChatDialog = dynamic(() => import('./chat-dialog'), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="sm" className="w-9 px-0" disabled>
       <Square className="h-4 w-4 animate-spin" />
    </Button>
  ),
})

export default function LazyChat() {
  const [shouldLoad, setShouldLoad] = useState(false)

  if (!shouldLoad) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-9 px-0" 
        onClick={() => setShouldLoad(true)}
      >
        <Bot className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle AI Chat</span>
      </Button>
    )
  }

  // Once loaded, we keep it mounted to preserve chat state
  // defaultOpen={true} ensures it opens immediately after loading
  return <ChatDialog defaultOpen={true} />
}
