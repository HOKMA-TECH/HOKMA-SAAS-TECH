'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Palette,
  Bell,
  Plug,
  Shield,
  Settings2,
  Upload,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

export default function ConfiguracoesPage() {
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    leads: true,
    vendas: true,
    tarefas: false,
    relatorios: true,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-2">
          <TabsTrigger value="perfil" className="gap-2 py-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="gap-2 py-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2 py-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2 py-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Perfil Tab */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perfil da Imobiliária</CardTitle>
              <CardDescription>Informações básicas da sua empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    IP
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Alterar Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou SVG. Máximo 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome da Imobiliária</Label>
                  <Input defaultValue="Imobiliária Premium" />
                </div>
                <div className="space-y-2">
                  <Label>CRECI</Label>
                  <Input defaultValue="12345-J" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" defaultValue="www.imobiliariapremium.com.br" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" defaultValue="contato@imobiliariapremium.com.br" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" defaultValue="(11) 3456-7890" />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência Tab */}
        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tema</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { id: 'light', label: 'Claro', icon: Sun },
                  { id: 'dark', label: 'Escuro', icon: Moon },
                  { id: 'system', label: 'Sistema', icon: Monitor },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <option.icon className={`h-6 w-6 mx-auto mb-2 ${
                      theme === option.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-sm font-medium">{option.label}</p>
                  </button>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Cor Principal</Label>
                <div className="flex gap-3">
                  {['#4338ca', '#0891b2', '#059669', '#d97706', '#dc2626'].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-primary transition-all"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar Compacta</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduz a largura da barra lateral
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações Tab */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências de Notificação</CardTitle>
              <CardDescription>Configure como deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Canais</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">E-mail</p>
                        <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push</p>
                        <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Notificação</h4>
                <div className="space-y-4">
                  {[
                    { key: 'leads', label: 'Novos Leads', desc: 'Quando um novo lead é cadastrado' },
                    { key: 'vendas', label: 'Vendas', desc: 'Atualizações sobre vendas' },
                    { key: 'tarefas', label: 'Tarefas', desc: 'Lembretes de tarefas pendentes' },
                    { key: 'relatorios', label: 'Relatórios', desc: 'Relatórios semanais e mensais' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch 
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrações Tab */}
        <TabsContent value="integracoes" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: 'ZAP Imóveis', status: 'conectado', icon: '🏠' },
              { name: 'Viva Real', status: 'conectado', icon: '🏡' },
              { name: 'OLX', status: 'pendente', icon: '📱' },
              { name: 'Google Analytics', status: 'conectado', icon: '📊' },
              { name: 'WhatsApp Business', status: 'desconectado', icon: '💬' },
              { name: 'Mailchimp', status: 'desconectado', icon: '📧' },
            ].map((integration) => (
              <Card key={integration.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <Badge variant={
                          integration.status === 'conectado' ? 'default' :
                          integration.status === 'pendente' ? 'secondary' : 'outline'
                        } className="mt-1">
                          {integration.status === 'conectado' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {integration.status === 'pendente' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      {integration.status === 'desconectado' ? 'Conectar' : 'Configurar'}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Segurança Tab */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Senha Atual</Label>
                <Input type="password" placeholder="Digite sua senha atual" />
              </div>
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input type="password" placeholder="Digite a nova senha" />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nova Senha</Label>
                <Input type="password" placeholder="Confirme a nova senha" />
              </div>
              <Button className="gap-2">
                <Key className="h-4 w-4" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autenticação de Dois Fatores</CardTitle>
              <CardDescription>Adicione uma camada extra de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">2FA Desativado</p>
                    <p className="text-sm text-muted-foreground">
                      Proteja sua conta com autenticação de dois fatores
                    </p>
                  </div>
                </div>
                <Button variant="outline">Ativar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema Tab */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências do Sistema</CardTitle>
              <CardDescription>Configure o comportamento do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <Select defaultValue="dd/MM/yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select defaultValue="BRL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis para sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium">Exportar Todos os Dados</p>
                  <p className="text-sm text-muted-foreground">
                    Baixe uma cópia de todos os seus dados
                  </p>
                </div>
                <Button variant="outline">Exportar</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium text-destructive">Excluir Conta</p>
                  <p className="text-sm text-muted-foreground">
                    Esta ação é permanente e não pode ser desfeita
                  </p>
                </div>
                <Button variant="destructive">Excluir</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
