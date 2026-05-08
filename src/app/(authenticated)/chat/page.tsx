'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { mockConversas, mockMensagens } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react'

interface Conversa {
  id: string
  participante: {
    nome: string
    avatar: string
    online: boolean
  }
  ultimaMensagem: string
  dataUltimaMensagem: Date
  naoLidas: number
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string>('1')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedChat = mockConversas.find((c) => c.id === selectedConversation)
  const messages = mockMensagens.filter((m) => m.conversaId === selectedConversation)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Handle sending message
    setMessage('')
  }

  return (
    <div className="h-[calc(100vh-7rem)]">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Comunicação interna e com clientes
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100%-4rem)]"
      >
        {/* Conversations List */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {mockConversas.map((conversa, index) => (
                <motion.button
                  key={conversa.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedConversation(conversa.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                    'hover:bg-muted/50',
                    selectedConversation === conversa.id && 'bg-muted'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {conversa.participante.nome.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversa.participante.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {conversa.participante.nome}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conversa.dataUltimaMensagem), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate pr-2">
                        {conversa.ultimaMensagem}
                      </span>
                      {conversa.naoLidas > 0 && (
                        <Badge className="h-5 min-w-[20px] px-1.5 text-[10px]">
                          {conversa.naoLidas}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedChat.participante.nome.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedChat.participante.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.participante.online ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'flex',
                          msg.enviada ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            msg.enviada
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          )}
                        >
                          <p className="text-sm">{msg.conteudo}</p>
                          <div className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            msg.enviada ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            <span className="text-[10px]">
                              {format(new Date(msg.data), 'HH:mm')}
                            </span>
                            {msg.enviada && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="min-h-[44px] max-h-[120px] resize-none pr-10"
                      rows={1}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 bottom-1 h-8 w-8"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    size="icon" 
                    className="h-10 w-10"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione uma conversa para começar
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
