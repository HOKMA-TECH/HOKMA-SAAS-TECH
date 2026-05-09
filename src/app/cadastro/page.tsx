'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/features/auth/auth-context'
import { TurnstileWidget } from '@/features/auth/turnstile-widget'
import { resolveCaptchaToken } from '@/features/auth/captcha'
import { validateStrongPassword } from '@/features/auth/password-policy'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, ArrowRight, Loader2, Building2, User, Mail, Lock } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    nomeImobiliaria: '',
    codigoConvite: '',
  })
  const [signupMode, setSignupMode] = useState<'create_tenant' | 'join_tenant'>('create_tenant')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não conferem')
      return
    }

    const validationErrors = validateStrongPassword(formData.senha)
    setPasswordErrors(validationErrors)
    if (validationErrors.length > 0) {
      setError('A senha nao atende aos requisitos de seguranca.')
      return
    }

    const resolvedCaptchaToken = resolveCaptchaToken(captchaToken)
    if (!resolvedCaptchaToken) {
      setError('Complete a verificacao anti-bot para continuar.')
      return
    }

    setIsLoading(true)

    const result = await signUp({
      email: formData.email,
      password: formData.senha,
      displayName: formData.nome,
      mode: signupMode,
      tenantName: formData.nomeImobiliaria,
      joinCode: formData.codigoConvite,
      requestedRole: 'corretor',
    })
    if (result.error) {
      setError(result.error)
      setCaptchaToken(null)
      setIsLoading(false)
      return
    }

    router.push('/login')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary via-primary to-primary/80" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">H</span>
              </div>
              <span className="text-2xl font-semibold tracking-tight">HOKMA</span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-balance">
              Comece sua
              <br />
              <span className="text-white/80">Jornada</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              Junte-se a milhares de imobiliárias que transformaram sua gestão com o HOKMA.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/70">Imobiliárias</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-sm text-white/70">Usuários</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-8 text-sm text-white/60"
          >
            <div>Teste grátis por 14 dias</div>
            <div>Sem cartão de crédito</div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold">
                Criar conta
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha os dados abaixo para começar
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="h-11 pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-11 pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Modo de entrada</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={signupMode === 'create_tenant' ? 'default' : 'outline'} onClick={() => setSignupMode('create_tenant')}>Criar imobiliaria</Button>
                    <Button type="button" variant={signupMode === 'join_tenant' ? 'default' : 'outline'} onClick={() => setSignupMode('join_tenant')}>Entrar com codigo</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeImobiliaria">Nome da imobiliária</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nomeImobiliaria"
                      name="nomeImobiliaria"
                      type="text"
                      placeholder="Nome da sua imobiliária"
                      value={formData.nomeImobiliaria}
                      onChange={handleChange}
                      className="h-11 pl-10"
                      disabled={isLoading}
                      required={signupMode === 'create_tenant'}
                    />
                  </div>
                </div>

                {signupMode === 'join_tenant' ? (
                  <div className="space-y-2">
                    <Label htmlFor="codigoConvite">Codigo de convite</Label>
                    <Input
                      id="codigoConvite"
                      name="codigoConvite"
                      type="text"
                      placeholder="Ex: A1B2C3D4E5"
                      value={formData.codigoConvite}
                      onChange={handleChange}
                      className="h-11 uppercase"
                      disabled={isLoading}
                      required
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.senha}
                      onChange={handleChange}
                      className="h-11 pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repita a senha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className="h-11 pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                {passwordErrors.length > 0 ? (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {passwordErrors.map((msg) => (
                      <li key={msg}>- {msg}</li>
                    ))}
                  </ul>
                ) : null}

                <TurnstileWidget onTokenChange={setCaptchaToken} />

                <Button 
                  type="submit" 
                  className="w-full h-11 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">
                    Já tem uma conta?
                  </span>
                </div>
              </div>
              
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full h-11">
                  Entrar
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="#" className="underline hover:text-foreground">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="#" className="underline hover:text-foreground">
              Política de Privacidade
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
