'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { mockAgenda } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Video,
  Phone,
} from 'lucide-react'

const eventTypeColors = {
  visita: 'bg-blue-100 text-blue-700 border-blue-200',
  reuniao: 'bg-purple-100 text-purple-700 border-purple-200',
  apresentacao: 'bg-orange-100 text-orange-700 border-orange-200',
  ligacao: 'bg-green-100 text-green-700 border-green-200',
}

const eventTypeIcons = {
  visita: MapPin,
  reuniao: Video,
  apresentacao: CalendarIcon,
  ligacao: Phone,
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 - 19:00

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7
    setCurrentDate(addDays(currentDate, days))
  }

  const getEventsForDate = (date: Date) => {
    return mockAgenda.filter((event) => isSameDay(new Date(event.data), date))
  }

  const todayEvents = getEventsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e visitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="todos">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os eventos</SelectItem>
              <SelectItem value="visita">Visitas</SelectItem>
              <SelectItem value="reuniao">Reuniões</SelectItem>
              <SelectItem value="apresentacao">Apresentações</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h2>
                  <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Week Header */}
              <div className="grid grid-cols-7 border-b border-border">
                {weekDays.map((day) => (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'p-3 text-center transition-colors hover:bg-muted/50',
                      isSameDay(day, selectedDate) && 'bg-primary/10',
                      isToday(day) && 'font-bold'
                    )}
                  >
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={cn(
                      'mt-1 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm',
                      isToday(day) && 'bg-primary text-primary-foreground',
                      isSameDay(day, selectedDate) && !isToday(day) && 'bg-secondary'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {getEventsForDate(day).length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-1">
                        {getEventsForDate(day).slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Time Grid */}
              <ScrollArea className="h-[400px]">
                <div className="relative">
                  {hours.map((hour) => (
                    <div key={hour} className="flex border-b border-border/50">
                      <div className="w-16 p-2 text-xs text-muted-foreground text-right pr-3 shrink-0">
                        {hour}:00
                      </div>
                      <div className="flex-1 min-h-[60px] relative border-l border-border/50 hover:bg-muted/30 transition-colors">
                        {/* Events would render here based on time */}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Day Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents.length > 0 ? (
                todayEvents.map((event, index) => {
                  const Icon = eventTypeIcons[event.tipo as keyof typeof eventTypeIcons] || CalendarIcon
                  const colorClass = eventTypeColors[event.tipo as keyof typeof eventTypeColors]

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all',
                        colorClass
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-white/50">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{event.titulo}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.data), 'HH:mm')}
                            <span>•</span>
                            <span>{event.duracao} min</span>
                          </div>
                          {event.local && (
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                              <MapPin className="h-3 w-3" />
                              {event.local}
                            </div>
                          )}
                          {event.cliente && (
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                              <User className="h-3 w-3" />
                              {event.cliente}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum evento para este dia</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAgenda.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="text-center shrink-0">
                    <div className="text-xs text-muted-foreground uppercase">
                      {format(new Date(event.data), 'MMM', { locale: ptBR })}
                    </div>
                    <div className="text-lg font-semibold">
                      {format(new Date(event.data), 'd')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.data), 'HH:mm')} - {event.responsavel}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
