'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  outputFormat?: string
}

export default function ConversorPDFPage() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'contrato_locacao.pdf', size: 2400000, status: 'completed', progress: 100, outputFormat: 'docx' },
    { id: '2', name: 'planta_baixa.pdf', size: 5600000, status: 'processing', progress: 65, outputFormat: 'jpg' },
    { id: '3', name: 'proposta_comercial.pdf', size: 1200000, status: 'uploading', progress: 30, outputFormat: 'xlsx' },
  ])
  const [isDragging, setIsDragging] = useState(false)
  const [outputFormat, setOutputFormat] = useState('docx')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
  }, [])

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'processing':
        return 'Processando'
      case 'error':
        return 'Erro'
      default:
        return 'Enviando'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFormatIcon = (format?: string) => {
    switch (format) {
      case 'jpg':
      case 'png':
        return <ImageIcon className="h-5 w-5" />
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
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
          <h1 className="text-2xl font-semibold tracking-tight">Conversor de PDF</h1>
          <p className="text-muted-foreground">
            Converta seus documentos PDF para outros formatos
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Drag & Drop Zone */}
          <Card>
            <CardContent className="p-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                )}
              >
                <motion.div
                  animate={{ scale: isDragging ? 1.05 : 1 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className={cn(
                      'h-8 w-8 transition-colors',
                      isDragging ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      Arraste e solte seus arquivos PDF aqui
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ou clique para selecionar arquivos
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    Selecionar Arquivos
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formatos suportados: PDF | Tamanho máximo: 50MB
                  </p>
                </motion.div>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Arquivos</CardTitle>
              <CardDescription>
                {files.length} arquivo(s) na fila
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg group"
                  >
                    <div className="p-2 bg-background rounded-lg">
                      {getFormatIcon(file.outputFormat)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {file.outputFormat?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(file.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusLabel(file.status)}
                          </span>
                        </div>
                      </div>
                      {file.status === 'processing' || file.status === 'uploading' ? (
                        <Progress value={file.progress} className="h-1 mt-2" />
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      {file.status === 'completed' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {files.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum arquivo na fila</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Conversion Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Opções de Conversão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Formato de Saída</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="docx">Word (.docx)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="jpg">Imagem (.jpg)</SelectItem>
                    <SelectItem value="png">Imagem (.png)</SelectItem>
                    <SelectItem value="txt">Texto (.txt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Converter Todos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Histórico Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'documento_01.pdf', format: 'docx', date: 'Hoje, 14:30' },
                { name: 'planilha_vendas.pdf', format: 'xlsx', date: 'Ontem, 10:15' },
                { name: 'foto_imovel.pdf', format: 'jpg', date: '15 Jan, 09:00' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="p-1.5 bg-muted rounded">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.format.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
