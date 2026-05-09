'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import {
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Home,
  Calendar,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react'

const vendasMensais = [
  { mes: 'Jan', vendas: 12, receita: 850000 },
  { mes: 'Fev', vendas: 18, receita: 1200000 },
  { mes: 'Mar', vendas: 15, receita: 980000 },
  { mes: 'Abr', vendas: 22, receita: 1450000 },
  { mes: 'Mai', vendas: 19, receita: 1280000 },
  { mes: 'Jun', vendas: 25, receita: 1680000 },
]

const leadsPorOrigem = [
  { name: 'Site', value: 35 },
  { name: 'ZAP', value: 25 },
  { name: 'Indicação', value: 20 },
  { name: 'Redes Sociais', value: 15 },
  { name: 'Outros', value: 5 },
]

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('mensal')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho da sua imobiliária
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Receita Total', value: 'R$ 7.44M', change: '+15.3%', positive: true, icon: DollarSign },
          { label: 'Total de Vendas', value: '111', change: '+8.7%', positive: true, icon: Home },
          { label: 'Leads Gerados', value: '892', change: '+22.1%', positive: true, icon: Users },
          { label: 'Taxa Conversão', value: '12.4%', change: '-2.1%', positive: false, icon: TrendingUp },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
                    <div className={`flex items-center gap-1 mt-1 text-sm ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="vendas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vendas" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="desempenho" className="gap-2">
            <Activity className="h-4 w-4" />
            Desempenho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vendas Mensais</CardTitle>
                  <CardDescription>Evolução das vendas no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vendasMensais}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" className="text-xs fill-muted-foreground" />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="vendas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Receita Mensal</CardTitle>
                  <CardDescription>Faturamento no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={vendasMensais}>
                        <defs>
                          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" className="text-xs fill-muted-foreground" />
                        <YAxis 
                          className="text-xs fill-muted-foreground" 
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value) => {
                            const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                            return [`R$ ${(numericValue / 1000000).toFixed(2)}M`, 'Receita']
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="receita"
                          stroke="hsl(var(--chart-2))"
                          fill="url(#colorReceita)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Leads por Origem</CardTitle>
                  <CardDescription>Distribuição de leads por canal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadsPorOrigem}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {leadsPorOrigem.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {leadsPorOrigem.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Métricas de Leads</CardTitle>
                  <CardDescription>Desempenho do funil de leads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Leads Novos', value: 892, change: '+22.1%' },
                    { label: 'Leads Qualificados', value: 445, change: '+18.5%' },
                    { label: 'Propostas Enviadas', value: 178, change: '+12.3%' },
                    { label: 'Vendas Fechadas', value: 111, change: '+8.7%' },
                  ].map((metric, index) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{metric.label}</p>
                        <p className="text-sm text-muted-foreground">{metric.value} no período</p>
                      </div>
                      <Badge variant="secondary" className="text-green-600">
                        {metric.change}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="desempenho">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desempenho por Corretor</CardTitle>
              <CardDescription>Ranking de vendas da equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { nome: 'Ana Silva', vendas: 25, receita: 1850000, conversao: 28.5 },
                  { nome: 'Carlos Souza', vendas: 22, receita: 1620000, conversao: 24.3 },
                  { nome: 'Maria Santos', vendas: 20, receita: 1480000, conversao: 22.1 },
                  { nome: 'Pedro Lima', vendas: 18, receita: 1320000, conversao: 20.8 },
                  { nome: 'Julia Costa', vendas: 15, receita: 1100000, conversao: 18.5 },
                ].map((corretor, index) => (
                  <motion.div
                    key={corretor.nome}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{corretor.nome}</p>
                      <p className="text-sm text-muted-foreground">{corretor.vendas} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {(corretor.receita / 1000000).toFixed(2)}M</p>
                      <p className="text-sm text-green-600">{corretor.conversao}% conversão</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
