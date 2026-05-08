'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { mockRecentActivities } from '@/lib/mock-data'
import { UserPlus, Calendar, FileText, DollarSign, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const activityIcons = {
  lead: UserPlus,
  visit: Calendar,
  proposal: FileText,
  sale: DollarSign,
  task: CheckCircle,
}

const activityColors = {
  lead: 'bg-blue-100 text-blue-600',
  visit: 'bg-purple-100 text-purple-600',
  proposal: 'bg-orange-100 text-orange-600',
  sale: 'bg-green-100 text-green-600',
  task: 'bg-gray-100 text-gray-600',
}

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle>
          <CardDescription>Últimas atualizações da equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecentActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || CheckCircle
            const colorClass = activityColors[activity.type as keyof typeof activityColors] || activityColors.task

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start gap-3 group"
              >
                <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.user}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function TeamPerformance() {
  const { mockTeamPerformance } = require('@/lib/mock-data')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Desempenho da Equipe</CardTitle>
          <CardDescription>Ranking de corretores este mês</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTeamPerformance.map((member: { name: string; vendas: number; leads: number; conversao: number }, index: number) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-100 text-gray-700' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-muted text-muted-foreground'
              )}>
                {index + 1}
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.leads} leads
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-semibold">{member.vendas}</p>
                <p className="text-xs text-muted-foreground">vendas</p>
              </div>
              
              <Badge variant="secondary" className="ml-2">
                {member.conversao}%
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
