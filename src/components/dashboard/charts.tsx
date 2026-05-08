'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { mockChartData } from '@/lib/mock-data'

export function SalesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Vendas Mensais</CardTitle>
          <CardDescription className="text-sm">Comparativo de vendas e metas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData.vendasMensais}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="mes" 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#94a3b8" 
                  fill="url(#colorVendas)"
                  strokeWidth={2}
                  name="Vendas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function LeadsOriginChart() {
  const COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8']
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leads por Origem</CardTitle>
          <CardDescription className="text-sm">Distribuição de leads por canal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockChartData.leadsPorOrigem}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="leads"
                  nameKey="origem"
                  strokeWidth={0}
                >
                  {mockChartData.leadsPorOrigem.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Funil de conversão com barras horizontais coloridas
interface FunnelItemProps {
  label: string
  value: number
  color: string
  maxValue: number
}

function FunnelItem({ label, value, color, maxValue }: FunnelItemProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.max(percentage, value > 0 ? 5 : 0)}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  )
}

export function FunnelChart() {
  const funnelData = [
    { label: 'Leads', value: 0, color: '#3b82f6' },
    { label: 'Em análise', value: 2, color: '#f97316' },
    { label: 'Em trâmite', value: 1, color: '#3b82f6' },
    { label: 'Venda', value: 0, color: '#22c55e' },
  ]
  
  const maxValue = Math.max(...funnelData.map(d => d.value), 1)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Funil de conversão</CardTitle>
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
              Abrir relatórios
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {funnelData.map((item, index) => (
            <FunnelItem 
              key={index}
              label={item.label}
              value={item.value}
              color={item.color}
              maxValue={maxValue}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Próximos agendamentos
export function UpcomingSchedule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Próximos agendamentos</CardTitle>
            <Button variant="outline" size="sm" className="text-sm">
              Ver agenda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sem agendamentos futuros no seu escopo.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Visão por diretoria
interface DiretoriaItemProps {
  name: string
  type: string
  clientes: number
  vendas: number
}

function DiretoriaItem({ name, type, clientes, vendas }: DiretoriaItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg border border-border/50">
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{type}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Clientes</p>
          <p className="text-xl font-semibold text-blue-600">{clientes}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vendas</p>
          <p className="text-xl font-semibold text-emerald-600">{vendas}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
          Ver relatório →
        </Button>
      </div>
    </div>
  )
}

export function DiretoriaView() {
  const diretorias = [
    { name: 'Diretoria Geral', type: 'DIRETORIA', clientes: 0, vendas: 0 },
    { name: 'DIRETORIA THALITA BELLO', type: 'DIRETORIA', clientes: 0, vendas: 0 },
    { name: 'DIRETORIA MARCOS SILVA', type: 'DIRETORIA', clientes: 3, vendas: 1 },
  ]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Visão por Diretoria
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
              Explorar analítico
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {diretorias.map((diretoria, index) => (
            <DiretoriaItem key={index} {...diretoria} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
