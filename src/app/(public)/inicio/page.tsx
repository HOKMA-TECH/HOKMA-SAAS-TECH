"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Building2, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"

const features = [
  {
    icon: Users,
    title: "CRM Imobiliário",
    description: "Gestão completa de leads e clientes com funil de vendas visual e automações inteligentes.",
  },
  {
    icon: Building2,
    title: "Gestão de Empreendimentos",
    description: "Espelho de vendas interativo, controle de unidades e acompanhamento de obras.",
  },
  {
    icon: Calendar,
    title: "Agenda Integrada",
    description: "Organize visitas, reuniões e compromissos com sincronização automática.",
  },
  {
    icon: MessageSquare,
    title: "Chat Integrado",
    description: "Comunicação centralizada com clientes e equipe em uma única plataforma.",
  },
  {
    icon: FileText,
    title: "Ferramentas Exclusivas",
    description: "Conversor de PDF, apuração de renda e calculadoras especializadas.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Avançados",
    description: "Dashboards e métricas em tempo real para tomada de decisão estratégica.",
  },
]

const benefits = [
  "Aumente suas vendas em até 40%",
  "Reduza o tempo de fechamento",
  "Nunca mais perca um lead",
  "Automatize tarefas repetitivas",
  "Tenha visão 360° do cliente",
  "Acesse de qualquer dispositivo",
]

const testimonials = [
  {
    name: "Ricardo Mendes",
    role: "Diretor Comercial",
    company: "Imobiliária Premium",
    content: "O HOKMA revolucionou nossa operação. Aumentamos nossas vendas em 45% nos primeiros 6 meses.",
    rating: 5,
  },
  {
    name: "Ana Carolina Silva",
    role: "Corretora",
    company: "RE/MAX Brasil",
    content: "Finalmente uma ferramenta que entende o mercado imobiliário brasileiro. Interface incrível!",
    rating: 5,
  },
  {
    name: "Fernando Costa",
    role: "CEO",
    company: "Construtora Horizonte",
    content: "A gestão de empreendimentos ficou muito mais simples. Recomendo para qualquer incorporadora.",
    rating: 5,
  },
]

const plans = [
  {
    name: "Starter",
    price: 97,
    description: "Ideal para corretores autônomos",
    features: [
      "Até 100 clientes",
      "1 usuário",
      "CRM básico",
      "Agenda integrada",
      "Suporte por email",
    ],
  },
  {
    name: "Professional",
    price: 297,
    description: "Para imobiliárias em crescimento",
    popular: true,
    features: [
      "Até 1.000 clientes",
      "10 usuários",
      "CRM completo",
      "Todas as ferramentas",
      "Integrações",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    price: 597,
    description: "Para grandes operações",
    features: [
      "Clientes ilimitados",
      "Usuários ilimitados",
      "API dedicada",
      "Customizações",
      "Treinamento exclusivo",
      "Gerente de conta",
    ],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funcionalidades
            </a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Depoimentos
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Nova versão 2.0 disponível</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
              O CRM que{" "}
              <span className="text-primary">transforma</span>
              <br />
              corretores em{" "}
              <span className="text-primary">campeões</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Gerencie clientes, empreendimentos e vendas em uma única plataforma. 
              Aumente sua produtividade e feche mais negócios.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/cadastro">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Agendar Demonstração
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              14 dias grátis. Sem cartão de crédito.
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden shadow-2xl">
              <div className="h-8 bg-muted/50 flex items-center px-4 gap-2 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <Building2 className="h-24 w-24 text-primary/30 mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Preview do Dashboard</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2.500+", label: "Imobiliárias" },
              { value: "15.000+", label: "Corretores" },
              { value: "R$ 8B+", label: "Em Vendas" },
              { value: "98%", label: "Satisfação" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas desenvolvidas especialmente para o mercado imobiliário brasileiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card/50 backdrop-blur border-border/50 h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o HOKMA?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Desenvolvido por profissionais do mercado imobiliário para profissionais do mercado imobiliário.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Rápido", desc: "Interface otimizada" },
                { icon: Shield, title: "Seguro", desc: "Dados protegidos" },
                { icon: Clock, title: "24/7", desc: "Sempre disponível" },
                { icon: Star, title: "Premium", desc: "Suporte dedicado" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-card/50 backdrop-blur border-border/50 text-center p-6">
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Milhares de profissionais confiam no HOKMA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card/50 backdrop-blur border-border/50 h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-muted-foreground">
              Comece gratuitamente e escale conforme cresce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`bg-card/50 backdrop-blur h-full ${
                  plan.popular ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
                }`}>
                  <CardContent className="pt-6">
                    {plan.popular && (
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                        Mais Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Começar Agora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para transformar suas vendas?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já estão vendendo mais com o HOKMA.
              </p>
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/cadastro">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo />
              <p className="text-sm text-muted-foreground mt-4">
                O CRM imobiliário mais completo do Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Atualizações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HOKMA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
