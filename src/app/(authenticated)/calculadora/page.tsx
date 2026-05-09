'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  Download,
  RotateCcw,
  Info,
} from 'lucide-react'

export default function CalculadoraPage() {
  const [valorImovel, setValorImovel] = useState(500000)
  const [entrada, setEntrada] = useState(100000)
  const [taxaJuros, setTaxaJuros] = useState(9.5)
  const [prazo, setPrazo] = useState(360)
  const [sistema, setSistema] = useState('sac')

  const valorFinanciado = valorImovel - entrada
  const percentualEntrada = ((entrada / valorImovel) * 100).toFixed(1)
  const taxaMensal = taxaJuros / 100 / 12

  // Cálculo SAC
  const calcularSAC = useMemo(() => {
    const parcelas = []
    const amortizacao = valorFinanciado / prazo
    let saldoDevedor = valorFinanciado

    for (let i = 1; i <= prazo; i++) {
      const juros = saldoDevedor * taxaMensal
      const parcela = amortizacao + juros
      
      parcelas.push({
        numero: i,
        parcela: parcela,
        amortizacao: amortizacao,
        juros: juros,
        saldoDevedor: saldoDevedor - amortizacao,
      })
      
      saldoDevedor -= amortizacao
    }

    return parcelas
  }, [valorFinanciado, prazo, taxaMensal])

  // Cálculo PRICE
  const calcularPRICE = useMemo(() => {
    const parcelas = []
    const parcela = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) / (Math.pow(1 + taxaMensal, prazo) - 1)
    let saldoDevedor = valorFinanciado

    for (let i = 1; i <= prazo; i++) {
      const juros = saldoDevedor * taxaMensal
      const amortizacao = parcela - juros
      
      parcelas.push({
        numero: i,
        parcela: parcela,
        amortizacao: amortizacao,
        juros: juros,
        saldoDevedor: saldoDevedor - amortizacao,
      })
      
      saldoDevedor -= amortizacao
    }

    return parcelas
  }, [valorFinanciado, prazo, taxaMensal])

  const parcelas = sistema === 'sac' ? calcularSAC : calcularPRICE

  const primeiraParcela = parcelas[0]?.parcela || 0
  const ultimaParcela = parcelas[prazo - 1]?.parcela || 0
  const totalPago = parcelas.reduce((acc, p) => acc + p.parcela, 0)
  const totalJuros = totalPago - valorFinanciado

  const chartData = parcelas.filter((_, i) => i % 12 === 0).map((p) => ({
    mes: p.numero,
    parcela: p.parcela,
    saldo: p.saldoDevedor,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Amortização</h1>
          <p className="text-muted-foreground">
            Simule financiamentos imobiliários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Dados do Financiamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Valor do Imóvel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Valor do Imóvel</Label>
                  <span className="text-lg font-semibold">
                    R$ {valorImovel.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Slider
                  value={[valorImovel]}
                  onValueChange={([value]) => setValorImovel(value)}
                  min={100000}
                  max={5000000}
                  step={10000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>R$ 100k</span>
                  <span>R$ 5M</span>
                </div>
              </div>

              {/* Entrada */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Entrada ({percentualEntrada}%)</Label>
                  <span className="text-lg font-semibold">
                    R$ {entrada.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Slider
                  value={[entrada]}
                  onValueChange={([value]) => setEntrada(value)}
                  min={0}
                  max={valorImovel * 0.9}
                  step={5000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>90%</span>
                </div>
              </div>

              {/* Taxa de Juros */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Taxa de Juros Anual</Label>
                  <span className="text-lg font-semibold">{taxaJuros}% a.a.</span>
                </div>
                <Slider
                  value={[taxaJuros]}
                  onValueChange={([value]) => setTaxaJuros(value)}
                  min={5}
                  max={15}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* Prazo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Prazo</Label>
                  <span className="text-lg font-semibold">{prazo} meses ({(prazo / 12).toFixed(0)} anos)</span>
                </div>
                <Slider
                  value={[prazo]}
                  onValueChange={([value]) => setPrazo(value)}
                  min={60}
                  max={420}
                  step={12}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 anos</span>
                  <span>35 anos</span>
                </div>
              </div>

              {/* Sistema */}
              <div className="space-y-2">
                <Label>Sistema de Amortização</Label>
                <Select value={sistema} onValueChange={setSistema}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sac">SAC - Sistema de Amortização Constante</SelectItem>
                    <SelectItem value="price">PRICE - Parcelas Fixas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Evolução das Parcelas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorParcela" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="mes" 
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `${Math.floor(value / 12)}a`}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => {
                        const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                        const label = name === 'parcela' ? 'Parcela' : 'Saldo'
                        return [`R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, label]
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="parcela"
                      stroke="hsl(var(--chart-1))"
                      fill="url(#colorParcela)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Resumo do Financiamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Valor Financiado</p>
                  <p className="text-xl font-bold text-primary">
                    R$ {valorFinanciado.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Entrada</p>
                  <p className="text-xl font-bold">
                    R$ {entrada.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Primeira Parcela</span>
                  <span className="font-semibold">
                    R$ {primeiraParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Última Parcela</span>
                  <span className="font-semibold">
                    R$ {ultimaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Juros</span>
                  <span className="font-semibold text-red-600">
                    R$ {totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total a Pagar</span>
                  <span className="text-lg font-bold">
                    R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parcels Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tabela de Parcelas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[320px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="text-right">Parcela</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcelas.slice(0, 60).map((p) => (
                      <TableRow key={p.numero}>
                        <TableCell className="text-muted-foreground">{p.numero}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {p.parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          R$ {p.saldoDevedor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
