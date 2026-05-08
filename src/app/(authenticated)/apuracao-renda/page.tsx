'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calculator,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react'

interface MembroFamilia {
  id: string
  nome: string
  parentesco: string
  rendaBruta: number
  rendaLiquida: number
}

export default function ApuracaoRendaPage() {
  const [membros, setMembros] = useState<MembroFamilia[]>([
    { id: '1', nome: 'Titular', parentesco: 'titular', rendaBruta: 8500, rendaLiquida: 6800 },
    { id: '2', nome: 'Cônjuge', parentesco: 'conjuge', rendaBruta: 5200, rendaLiquida: 4160 },
  ])
  
  const [despesas, setDespesas] = useState({
    aluguel: 2500,
    financiamentos: 800,
    pensao: 0,
    outros: 500,
  })

  const addMembro = () => {
    const newId = (membros.length + 1).toString()
    setMembros([...membros, { 
      id: newId, 
      nome: '', 
      parentesco: 'dependente', 
      rendaBruta: 0, 
      rendaLiquida: 0 
    }])
  }

  const removeMembro = (id: string) => {
    setMembros(membros.filter((m) => m.id !== id))
  }

  const updateMembro = (id: string, field: keyof MembroFamilia, value: string | number) => {
    setMembros(membros.map((m) => m.id === id ? { ...m, [field]: value } : m))
  }

  // Cálculos
  const totalRendaBruta = membros.reduce((acc, m) => acc + m.rendaBruta, 0)
  const totalRendaLiquida = membros.reduce((acc, m) => acc + m.rendaLiquida, 0)
  const totalDespesas = Object.values(despesas).reduce((acc, v) => acc + v, 0)
  const rendaDisponivel = totalRendaLiquida - totalDespesas
  const comprometimentoRenda = ((totalDespesas / totalRendaLiquida) * 100).toFixed(1)
  const capacidadeParcela = totalRendaLiquida * 0.3 // 30% da renda

  const getStatusColor = () => {
    const comprometimento = parseFloat(comprometimentoRenda)
    if (comprometimento <= 30) return 'text-green-600'
    if (comprometimento <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apuração de Renda</h1>
          <p className="text-muted-foreground">
            Análise de capacidade financeira do cliente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Composição Familiar */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Composição Familiar
                  </CardTitle>
                  <CardDescription>Informe os rendimentos de cada membro</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addMembro} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {membros.map((membro, index) => (
                <motion.div
                  key={membro.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-muted/30 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Membro {index + 1}</Badge>
                    {membros.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeMembro(membro.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={membro.nome}
                        onChange={(e) => updateMembro(membro.id, 'nome', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parentesco</Label>
                      <Select 
                        value={membro.parentesco}
                        onValueChange={(value) => updateMembro(membro.id, 'parentesco', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="titular">Titular</SelectItem>
                          <SelectItem value="conjuge">Cônjuge</SelectItem>
                          <SelectItem value="dependente">Dependente</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Renda Bruta (R$)</Label>
                      <Input
                        type="number"
                        value={membro.rendaBruta}
                        onChange={(e) => updateMembro(membro.id, 'rendaBruta', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renda Líquida (R$)</Label>
                      <Input
                        type="number"
                        value={membro.rendaLiquida}
                        onChange={(e) => updateMembro(membro.id, 'rendaLiquida', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Despesas Mensais
              </CardTitle>
              <CardDescription>Compromissos financeiros atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Aluguel Atual (R$)</Label>
                  <Input
                    type="number"
                    value={despesas.aluguel}
                    onChange={(e) => setDespesas({ ...despesas, aluguel: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Financiamentos (R$)</Label>
                  <Input
                    type="number"
                    value={despesas.financiamentos}
                    onChange={(e) => setDespesas({ ...despesas, financiamentos: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pensão Alimentícia (R$)</Label>
                  <Input
                    type="number"
                    value={despesas.pensao}
                    onChange={(e) => setDespesas({ ...despesas, pensao: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outras Despesas (R$)</Label>
                  <Input
                    type="number"
                    value={despesas.outros}
                    onChange={(e) => setDespesas({ ...despesas, outros: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                </div>
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
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renda Bruta Total</span>
                  <span className="font-semibold">R$ {totalRendaBruta.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renda Líquida Total</span>
                  <span className="font-semibold">R$ {totalRendaLiquida.toLocaleString('pt-BR')}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Despesas</span>
                  <span className="font-semibold text-red-600">- R$ {totalDespesas.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Renda Disponível</span>
                  <span className="font-semibold text-green-600">R$ {rendaDisponivel.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Comprometimento</span>
                  <span className={`font-bold text-lg ${getStatusColor()}`}>
                    {comprometimentoRenda}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Capacidade de Parcela (30%)</span>
                  <span className="font-bold text-lg text-primary">
                    R$ {capacidadeParcela.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                parseFloat(comprometimentoRenda) <= 30 
                  ? 'bg-green-50 text-green-700' 
                  : parseFloat(comprometimentoRenda) <= 50 
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
              }`}>
                {parseFloat(comprometimentoRenda) <= 30 ? (
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                ) : parseFloat(comprometimentoRenda) <= 50 ? (
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                )}
                <div className="text-sm">
                  {parseFloat(comprometimentoRenda) <= 30 ? (
                    <>
                      <p className="font-medium">Situação Favorável</p>
                      <p>O cliente possui boa capacidade de pagamento.</p>
                    </>
                  ) : parseFloat(comprometimentoRenda) <= 50 ? (
                    <>
                      <p className="font-medium">Atenção</p>
                      <p>Comprometimento moderado. Avaliar com cautela.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Comprometimento Alto</p>
                      <p>Renda muito comprometida. Não recomendado.</p>
                    </>
                  )}
                </div>
              </div>

              <Button className="w-full gap-2">
                <FileText className="h-4 w-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
