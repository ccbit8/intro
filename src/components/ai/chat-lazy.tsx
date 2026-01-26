"use client"

import LazyInteraction from '@/components/lazy-interaction'
import { Button } from '@/components/ui/button'
import { Bot, Square } from 'lucide-react'

export default function LazyChat() {
  return (
    <LazyInteraction
      loader={() => import('./chat-dialog')}
      fallback={(handleClick) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-9 px-0" 
          onClick={handleClick}
        >
          <Bot className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle AI Chat</span>
        </Button>
      )}
      componentProps={{ defaultOpen: true }}
    />
  )
}
