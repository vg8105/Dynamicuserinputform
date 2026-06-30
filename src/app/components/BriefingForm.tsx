import { useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Send, CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? 'service_87odr2k';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? 'template_otu7qe8';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? 'hcTyx_N67Vk03xVj-';

interface BriefingFormData {
  businessMapTicket: string;
  nomeProjeto: string;
  areaNegocio: string;
  responsavel: string;
  email: string;
  situacaoAtual: string;
  oquePrecisaMelhorar: string;
  quemUsa: string[];
  quantasPessoas: string;
  comoSaoEssasPessoas: string;
  comoFazemHoje: string;
  oquesIncomoda: string;
  oqueQueremos: string;
  comoVaiAjudar: string;
  inspiracoes: string;
  oqueNaoInclui: string;
  comoSaberResultados: string;
  numerosAtuais: string;
  numerosObjetivo: string;
  prioridade: string;
  quandoPrecisar: string;
  quandoLancar: string;
  limitacoes: string;
  outrasEquipas: string;
  dependencias: string;
  documentosLinks: string;
  outrasNotas: string;
}

const SECTIONS = [
  { id: 1, title: 'Quem somos', icon: '👋', short: 'Identificação' },
  { id: 2, title: 'O problema', icon: '💡', short: 'Problema' },
  { id: 3, title: 'Para quem', icon: '👥', short: 'Utilizadores' },
  { id: 4, title: 'O objetivo', icon: '🎯', short: 'Objetivo' },
  { id: 5, title: 'Prazos', icon: '📅', short: 'Prazos' },
  { id: 6, title: 'Confirmar', icon: '✅', short: 'Confirmar' },
];

// Section intros — conversational, encouraging
const SECTION_INTROS: Record<number, { headline: string; sub: string }> = {
  1: {
    headline: 'Vamos começar pelo básico',
    sub: 'Só precisamos de saber quem faz o pedido e de que projeto se trata. Dois minutos e está feito.',
  },
  2: {
    headline: 'Conte-nos o problema',
    sub: 'Não precisa de ter tudo pensado. Descreva a situação com as suas próprias palavras — como faria a um colega.',
  },
  3: {
    headline: 'Quem vai usar isto?',
    sub: 'Quanto mais soubermos sobre quem vai usar, melhor conseguimos ajudar. Mas se não souber tudo, não há problema.',
  },
  4: {
    headline: 'O que queremos alcançar?',
    sub: 'Uma frase simples já chega. O que é que vai ser diferente depois deste projeto existir?',
  },
  5: {
    headline: 'Quando e com que urgência?',
    sub: 'Se não tiver datas definidas, diga-nos a prioridade e deixe o resto em branco — tratamos disso juntos.',
  },
  6: {
    headline: 'Está quase! Reveja antes de enviar.',
    sub: 'Confirme se está tudo correcto. Se quiser alterar algo, pode voltar atrás.',
  },
};

const SECTION_ENCOURAGEMENTS = [
  'Boa! Agora conte-nos o que precisa de mudar. 👇',
  'Óptimo! Quem vai usar isto? 👇',
  'Perfeito! Qual é o objetivo? 👇',
  'Excelente! Só mais uma secção. 👇',
  'Está quase! Vamos rever. 👇',
];

export default function BriefingForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() =>
    sessionStorage.getItem('briefing_submitted') === 'true'
  );

  const { register, handleSubmit, reset, formState: { errors }, trigger, getValues, setValue } = useForm<BriefingFormData>({
    defaultValues: { quemUsa: [], prioridade: 'normal' },
    mode: 'onTouched',
  });

  const resetForm = () => {
    sessionStorage.clear();
    reset({ quemUsa: [], prioridade: 'normal' });
    setIsSubmitted(false);
    setIsSubmitting(false);
    setCurrentSection(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatEmailBody = (data: BriefingFormData) => {
    const hoje = new Date().toLocaleDateString('pt-PT');
    const prioridadeLabel: Record<string, string> = {
      critica: '🔴 Urgente — está a bloquear outras coisas',
      alta: '🟠 Alta — precisa de ser feito em breve',
      normal: '🟡 Normal — importante mas pode aguardar planeamento',
      baixa: '🟢 Baixa — sem urgência',
    };
    return `
PEDIDO DE BRIEFING — Equipa de Experiência Digital CTT
=======================================================

🎫 BUSINESSMAP: ${data.businessMapTicket || 'N/A'}
📋 PROJETO: ${data.nomeProjeto}
📅 DATA: ${hoje}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 QUEM FAZ O PEDIDO
Área: ${data.areaNegocio}
Responsável: ${data.responsavel}
Email: ${data.email}

❗ O PROBLEMA
Como funciona hoje:
${data.situacaoAtual}

O que precisa melhorar:
${data.oquePrecisaMelhorar}

👥 PARA QUEM É
Quem vai usar: ${Array.isArray(data.quemUsa) && data.quemUsa.length > 0 ? data.quemUsa.join(', ') : 'A definir'}
Quantas pessoas: ${data.quantasPessoas || 'A definir'}
Como são: ${data.comoSaoEssasPessoas || 'N/A'}
Como fazem hoje: ${data.comoFazemHoje || 'N/A'}
O que as incomoda: ${data.oquesIncomoda || 'N/A'}

🎯 O OBJETIVO
${data.oqueQueremos}

Como vai ajudar:
${data.comoVaiAjudar || 'N/A'}

Inspirações: ${data.inspiracoes || 'Nenhuma'}
O que NÃO inclui: ${data.oqueNaoInclui || 'N/A'}

⏰ PRAZOS E CONTEXTO
Prioridade: ${prioridadeLabel[data.prioridade] || data.prioridade}
Quando precisamos: ${data.quandoPrecisar || 'A definir'}
Quando lançar: ${data.quandoLancar || 'A definir'}
Limitações: ${data.limitacoes || 'Nenhuma'}
Outras equipas: ${data.outrasEquipas || 'Nenhuma'}
Dependências: ${data.dependencias || 'Nenhuma'}

📊 COMO MEDIR O SUCESSO
${data.comoSaberResultados || 'A definir em conjunto'}
Números actuais: ${data.numerosAtuais || 'N/A'}
Números objectivo: ${data.numerosObjetivo || 'N/A'}

🔗 DOCUMENTOS E LINKS
${data.documentosLinks || 'Nenhum'}

📎 NOTAS ADICIONAIS
${data.outrasNotas || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enviado através do formulário digital de briefing CTT
    `.trim();
  };

  const onSubmit = async (data: BriefingFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const projectName = data.nomeProjeto || 'Sem título';
    const businessMap = data.businessMapTicket || '';
    const subject = businessMap
      ? `Briefing — ${businessMap} — ${projectName}`
      : `Briefing — ${projectName}`;
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { subject, from_name: data.responsavel, from_email: data.email, message: formatEmailBody(data) },
        EMAILJS_PUBLIC_KEY
      );
      sessionStorage.setItem('briefing_submitted', 'true');
      sessionStorage.setItem('briefing_data', JSON.stringify(data));
      setIsSubmitted(true);
    } catch {
      toast.error('Erro ao enviar. Por favor tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextSection = async () => {
    const requiredBySection: Record<number, (keyof BriefingFormData)[]> = {
      1: ['nomeProjeto', 'areaNegocio', 'responsavel', 'email'],
      2: ['situacaoAtual', 'oquePrecisaMelhorar'],
      3: [], 4: ['oqueQueremos'], 5: [], 6: [],
    };
    const required = requiredBySection[currentSection] ?? [];
    if (required.length > 0) {
      const valid = await trigger(required);
      if (!valid) {
        toast.error('Por favor preencha os campos assinalados antes de continuar.');
        return;
      }
    }
    setCurrentSection(s => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSection = (n: number) => {
    if (n < currentSection) { setCurrentSection(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const intro = SECTION_INTROS[currentSection];
  const progressPct = Math.round(((currentSection - 1) / (SECTIONS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="bg-[#E30613] text-white px-5 py-6 md:px-8 md:py-8 rounded-t-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase opacity-75 mb-1">Equipa de Experiência Digital · CTT</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Pedido de Briefing</h1>
          <p className="text-sm opacity-80">⏱ 5–10 minutos &nbsp;·&nbsp; Responda como falaria com um colega</p>
        </div>

        {/* Progress */}
        <div className="bg-white px-5 md:px-8 pt-4 pb-3 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-1 mb-3">
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => goToSection(s.id)}
                  disabled={s.id >= currentSection}
                  title={s.short}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all focus:outline-none ${
                    currentSection > s.id
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : currentSection === s.id
                        ? 'bg-[#E30613] text-white ring-2 ring-[#E30613] ring-offset-2'
                        : 'bg-gray-200 text-gray-400 cursor-default'
                  }`}
                >
                  {currentSection > s.id ? '✓' : s.id}
                </button>
                {i < SECTIONS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all ${currentSection > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 text-sm md:text-base">{SECTIONS[currentSection - 1].title}</p>
            </div>
            <span className="text-xs text-gray-400">{currentSection} / {SECTIONS.length}</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
            <div className="bg-[#E30613] h-1 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white px-5 md:px-8 pt-6 pb-8 rounded-b-2xl shadow-lg">
          {!isSubmitted ? (
            <>
              {/* Section intro */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{intro.headline}</h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">{intro.sub}</p>
              </div>

              <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }}>
                {currentSection === 1 && <Section1 register={register} errors={errors} />}
                {currentSection === 2 && <Section2 register={register} errors={errors} />}
                {currentSection === 3 && <Section3 register={register} setValue={setValue} getValues={getValues} />}
                {currentSection === 4 && <Section4 register={register} errors={errors} setValue={setValue} />}
                {currentSection === 5 && <Section5 register={register} setValue={setValue} />}
                {currentSection === 6 && <Section6Summary data={getValues()} register={register} />}

                {/* Navigation */}
                <div className="flex flex-col md:flex-row justify-between gap-3 mt-8 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setCurrentSection(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={currentSection === 1}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    <ChevronLeft size={18} /> Voltar
                  </button>

                  {currentSection < 6 ? (
                    <button
                      type="button"
                      onClick={nextSection}
                      className="flex items-center justify-center gap-2 px-7 py-3 bg-[#E30613] text-white rounded-xl hover:bg-[#C00510] transition-colors font-semibold text-sm shadow-sm"
                    >
                      Continuar <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit(onSubmit)()}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-[#E30613] text-white rounded-xl hover:bg-[#C00510] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-md"
                    >
                      {isSubmitting ? 'A enviar...' : 'Enviar Briefing'} <Send size={18} />
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <SuccessMessage onReset={resetForm} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SECÇÃO 1: Identificação ─────────────────────────────────────────────────
function Section1({ register, errors }: any) {
  return (
    <div className="space-y-5">
      <ConversationField
        label="Qual é o nome do projeto?"
        why="Para identificarmos o pedido e criarmos um registo."
        required
        error={errors.nomeProjeto?.message}
      >
        <Input
          placeholder="ex: Novo rastreio de encomendas, Redesign da área de clientes..."
          error={errors.nomeProjeto?.message}
          {...register('nomeProjeto', { required: 'Precisamos de um nome para o projeto' })}
        />
      </ConversationField>

      <ConversationField
        label="De que área vem este pedido?"
        why="Ajuda-nos a perceber o contexto do negócio e a envolver as pessoas certas."
        required
        error={errors.areaNegocio?.message}
      >
        <Input
          placeholder="ex: Marketing, E-commerce, Operações, Recursos Humanos, IT..."
          error={errors.areaNegocio?.message}
          {...register('areaNegocio', { required: 'Campo obrigatório' })}
        />
      </ConversationField>

      <ConversationField
        label="O número do ticket no BusinessMap"
        hint="Se ainda não tiver, pode deixar em branco."
        why="Serve para ligar este briefing à iniciativa no BusinessMap."
      >
        <Input
          placeholder="ex: BM-2024-1234 (opcional)"
          {...register('businessMapTicket')}
        />
      </ConversationField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ConversationField
          label="O seu nome"
          required
          error={errors.responsavel?.message}
        >
          <Input
            placeholder="Nome completo"
            error={errors.responsavel?.message}
            {...register('responsavel', { required: 'Campo obrigatório' })}
          />
        </ConversationField>

        <ConversationField
          label="O seu email"
          required
          error={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="nome@ctt.pt"
            error={errors.email?.message}
            {...register('email', {
              required: 'Campo obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
          />
        </ConversationField>
      </div>
    </div>
  );
}

// ─── SECÇÃO 2: O Problema ─────────────────────────────────────────────────────
function Section2({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <ConversationField
        label="Como é que as coisas funcionam hoje?"
        why="Precisamos de perceber o ponto de partida para sugerir a melhor solução."
        hint="Não precisa de ser técnico. Descreva como se contasse a um colega novo na empresa."
        examples={[
          'Os clientes recebem um SMS quando a encomenda chega ao distribuidor, mas depois não têm mais informação até à entrega.',
          'Os colaboradores têm de entrar em 3 sistemas diferentes para completar uma tarefa — SAP, o portal interno e Excel.',
          'Quando um cliente quer atualizar a morada de entrega, tem de ligar para o call center. Não há forma de o fazer online.',
        ]}
        required
        error={errors.situacaoAtual?.message}
      >
        <Textarea
          placeholder="Descreva como funciona hoje, passo a passo se possível..."
          rows={5}
          error={errors.situacaoAtual?.message}
          {...register('situacaoAtual', { required: 'Este campo ajuda-nos muito a perceber o problema' })}
        />
      </ConversationField>

      <ConversationField
        label="O que é que precisa de mudar ou melhorar?"
        why="É aqui que começa a solução. Mesmo uma frase vaga é um bom ponto de partida."
        hint="Pode ser algo concreto ('quero um botão para X') ou uma sensação ('o processo é demasiado lento')."
        examples={[
          'Os clientes precisam de conseguir ver o estado da encomenda em tempo real, sem ligar para nós.',
          'A integração de novos colaboradores demora 3 semanas — queremos reduzir para 1 semana.',
          'A página de pagamento tem uma taxa de abandono de 40%. Precisamos de perceber porquê e melhorar.',
        ]}
        required
        error={errors.oquePrecisaMelhorar?.message}
      >
        <Textarea
          placeholder="O que é que gostaria de ver diferente?"
          rows={5}
          error={errors.oquePrecisaMelhorar?.message}
          {...register('oquePrecisaMelhorar', { required: 'Campo obrigatório' })}
        />
      </ConversationField>
    </div>
  );
}

// ─── SECÇÃO 3: Para Quem ──────────────────────────────────────────────────────
function Section3({ register, setValue, getValues }: any) {
  return (
    <div className="space-y-6">
      <ConversationField
        label="Quem vai usar o resultado deste projeto?"
        hint="Pode selecionar mais do que uma opção. Se não tiver a certeza, escolha a que parece mais próxima."
        why="Conhecer os utilizadores ajuda-nos a tomar melhores decisões de design e conteúdo."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {[
            { value: 'Clientes particulares', icon: '🏠', desc: 'Pessoas que usam os CTT no dia a dia' },
            { value: 'Clientes empresariais', icon: '🏢', desc: 'Empresas e grandes contas' },
            { value: 'Colaboradores CTT', icon: '🔴', desc: 'Equipas internas dos CTT' },
            { value: 'Parceiros e franchisados', icon: '🤝', desc: 'Rede externa e parceiros' },
            { value: 'Ambos (clientes e colaboradores)', icon: '👥', desc: 'Uso misto interno/externo' },
            { value: 'Ainda não sei', icon: '🤷', desc: 'A definir com a equipa' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-[#E30613] hover:bg-red-50 cursor-pointer transition-all group">
              <input
                type="checkbox"
                value={opt.value}
                {...register('quemUsa')}
                className="mt-0.5 w-5 h-5 text-[#E30613] border-gray-300 rounded focus:ring-[#E30613]"
              />
              <div>
                <div className="font-medium text-gray-800 text-sm">{opt.icon} {opt.value}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </ConversationField>

      <ConversationField
        label="Quantas pessoas vão usar (aproximadamente)?"
        hint="Uma estimativa muito a olho já ajuda. Não precisa de ser exacto."
        examples={['Cerca de 10.000 clientes por mês', 'Uns 50 colaboradores da área de operações', 'Toda a rede de franchisados — cerca de 300 lojas']}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {['Menos de 100', 'Centenas', 'Milhares', 'Dezenas de milhares', 'Não sei'].map(v => (
            <QuickFillButton key={v} onClick={() => setValue('quantasPessoas', v)}>{v}</QuickFillButton>
          ))}
        </div>
        <Input placeholder="Ou escreva aqui..." {...register('quantasPessoas')} />
      </ConversationField>

      <ConversationField
        label="O que sabe sobre como essas pessoas se comportam? (opcional)"
        hint="Qualquer detalhe ajuda — idade, dispositivo que usam, frequência de uso, nível de conforto com tecnologia."
        examples={[
          'Maioria usa telemóvel, faixa etária 25-55 anos, fazem compras online regularmente.',
          'Colaboradores com 10+ anos de empresa, habituados ao SAP, resistentes a mudanças de ferramenta.',
        ]}
      >
        <Textarea
          placeholder="Se não souber, deixe em branco — descobrimos juntos."
          rows={3}
          {...register('comoSaoEssasPessoas')}
        />
      </ConversationField>

      <ConversationField
        label="O que é que as frustra hoje? (opcional)"
        hint="Mesmo que seja uma sensação vaga ('o processo é confuso'), é útil."
        examples={[
          'Não sabem quando chega a encomenda e entram em pânico.',
          'Têm de repetir a mesma informação em vários sítios.',
          'A app é lenta e às vezes fecha sozinha.',
        ]}
      >
        <Textarea
          placeholder="Queixas frequentes, dificuldades, frustrações..."
          rows={3}
          {...register('oquesIncomoda')}
        />
      </ConversationField>
    </div>
  );
}

// ─── SECÇÃO 4: O Objetivo ─────────────────────────────────────────────────────
function Section4({ register, errors, setValue }: any) {
  return (
    <div className="space-y-6">
      <ConversationField
        label="O que queremos que aconteça depois deste projeto?"
        why="É a pergunta mais importante do briefing. Com uma resposta clara aqui, o resto fica mais fácil."
        hint="Uma frase já chega. Pense no resultado final para o utilizador, não na solução técnica."
        examples={[
          'Queremos que os clientes consigam rastrear a encomenda sem ligar para o call center.',
          'Queremos que os novos colaboradores consigam começar a trabalhar de forma autónoma na primeira semana.',
          'Queremos reduzir o abandono no pagamento — os clientes devem conseguir pagar em menos de 2 minutos.',
        ]}
        required
        error={errors.oqueQueremos?.message}
      >
        <Textarea
          placeholder="Após este projeto, os utilizadores vão conseguir..."
          rows={4}
          error={errors.oqueQueremos?.message}
          {...register('oqueQueremos', { required: 'Diga-nos o que quer alcançar — mesmo que seja uma ideia vaga' })}
        />
      </ConversationField>

      <ConversationField
        label="Que impacto espera para o negócio? (opcional)"
        hint="Pode ser uma redução de custos, aumento de satisfação, menos chamadas, mais conversões — qualquer coisa."
        examples={[
          'Menos chamadas ao call center → menos custos operacionais.',
          'Processo mais rápido → colaboradores mais satisfeitos e produtivos.',
          'Checkout mais simples → mais vendas online.',
        ]}
      >
        <Textarea
          placeholder="O que muda para o negócio se este projeto correr bem?"
          rows={3}
          {...register('comoVaiAjudar')}
        />
      </ConversationField>

      <ConversationField
        label="Como vamos saber se resultou? (opcional)"
        hint="Pode ser um número, uma métrica, ou simplesmente 'menos reclamações sobre X'."
        why="Definir o sucesso antes de começar ajuda-nos a tomar melhores decisões ao longo do projeto."
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {[
            'Menos chamadas ao call center',
            'Maior satisfação (NPS)',
            'Mais conversões',
            'Menos erros reportados',
            'A definir em conjunto',
          ].map(v => (
            <QuickFillButton key={v} onClick={() => setValue('comoSaberResultados', v)}>{v}</QuickFillButton>
          ))}
        </div>
        <Textarea
          placeholder="Ou descreva como mediria o sucesso..."
          rows={2}
          {...register('comoSaberResultados')}
        />
      </ConversationField>

      <ConversationField
        label="Há algum exemplo ou referência que admira? (opcional)"
        hint="Pode ser um site, uma app, um fluxo de outro produto CTT, ou até de outra empresa."
        examples={[
          'Gosto da forma como a Amazon mostra o rastreio — muito simples e em tempo real.',
          'A integração de clientes da app do Banco X é muito intuitiva.',
          'O portal da FNAC tem uma pesquisa que funciona muito bem.',
        ]}
      >
        <Textarea
          placeholder="Sites, apps, processos ou produtos que gostaria de seguir como referência..."
          rows={3}
          {...register('inspiracoes')}
        />
      </ConversationField>
    </div>
  );
}

// ─── SECÇÃO 5: Prazos ────────────────────────────────────────────────────────
function Section5({ register, setValue }: any) {
  return (
    <div className="space-y-6">
      <ConversationField
        label="Qual é a urgência deste projeto?"
        why="Ajuda-nos a priorizar o trabalho e a alocar a equipa certa no momento certo."
      >
        <div className="space-y-2 mt-1">
          {[
            { value: 'critica', label: '🔴 Urgente', desc: 'Está a bloquear outras coisas ou tem deadline fixo muito próximo' },
            { value: 'alta', label: '🟠 Alta', desc: 'Importante — precisa de atenção nos próximos 30 dias' },
            { value: 'normal', label: '🟡 Normal', desc: 'Importante mas pode entrar em ciclo normal de planeamento' },
            { value: 'baixa', label: '🟢 Baixa', desc: 'Sem urgência — pode ser planeado com antecedência' },
          ].map(opt => (
            <label key={opt.value} className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-[#E30613] hover:bg-red-50 cursor-pointer transition-all">
              <input type="radio" value={opt.value} {...register('prioridade')} className="mt-1 text-[#E30613] focus:ring-[#E30613]" />
              <div>
                <div className="font-medium text-gray-800 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </ConversationField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ConversationField
          label="Quando precisamos de ter isto pronto?"
          hint="Deixe em branco se ainda não sabe — definimos juntos."
        >
          <div className="flex flex-wrap gap-1.5 mb-2">
            {['Esta semana', 'Este mês', 'Próximo trimestre', 'A definir'].map(v => (
              <QuickFillButton key={v} onClick={() => setValue('quandoPrecisar', v)} small>{v}</QuickFillButton>
            ))}
          </div>
          <Input type="date" {...register('quandoPrecisar')} />
        </ConversationField>

        <ConversationField
          label="Quando está previsto o lançamento?"
          hint="Data em que vai para o ar. Pode ser diferente da entrega."
        >
          <div className="flex flex-wrap gap-1.5 mb-2">
            {['Este mês', 'Q3 2025', 'Q4 2025', 'A definir'].map(v => (
              <QuickFillButton key={v} onClick={() => setValue('quandoLancar', v)} small>{v}</QuickFillButton>
            ))}
          </div>
          <Input type="date" {...register('quandoLancar')} />
        </ConversationField>
      </div>

      <ConversationField
        label="Há restrições ou regras importantes a considerar? (opcional)"
        hint="Pode ser RGPD, requisitos de marca, restrições técnicas, aprovações necessárias..."
        examples={[
          'Tem de cumprir RGPD — nada de dados pessoais sem consentimento.',
          'Precisa de aprovação do Departamento Jurídico antes de lançar.',
          'Só pode usar a paleta de cores e tipografia da marca CTT.',
        ]}
      >
        <Textarea placeholder="Liste as principais restrições, se houver..." rows={3} {...register('limitacoes')} />
      </ConversationField>

      <ConversationField
        label="Há outras equipas ou fornecedores envolvidos? (opcional)"
        hint="Útil para percebermos dependências e quem convidar para reuniões."
        examples={[
          'Marketing — tem de aprovar todos os textos.',
          'IT — vai fazer a implementação técnica.',
          'Fornecedor X — está a desenvolver algo relacionado.',
        ]}
      >
        <Textarea placeholder="Nome das equipas e o que fazem neste projeto..." rows={3} {...register('outrasEquipas')} />
      </ConversationField>

      <ConversationField
        label="Documentos, links ou materiais de apoio (opcional)"
        hint="Qualquer coisa que nos ajude a perceber melhor o contexto — um Excel, um Figma, um email, uma jornada..."
      >
        <Textarea
          placeholder="Cole aqui os links ou descreva os documentos que pode partilhar..."
          rows={3}
          {...register('documentosLinks')}
        />
      </ConversationField>

      <ConversationField
        label="Há mais alguma coisa que devemos saber? (opcional)"
        hint="Contexto político, histórico do projeto, tentativas anteriores, sensibilidades... Tudo conta."
      >
        <Textarea
          placeholder="Qualquer informação adicional que ache relevante partilhar..."
          rows={3}
          {...register('outrasNotas')}
        />
      </ConversationField>
    </div>
  );
}

// ─── SECÇÃO 6: Resumo ─────────────────────────────────────────────────────────
function Section6Summary({ data, register }: { data: BriefingFormData; register: any }) {
  const prioridadeLabel: Record<string, string> = {
    critica: '🔴 Urgente', alta: '🟠 Alta', normal: '🟡 Normal', baixa: '🟢 Baixa',
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
        <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-gray-800 text-sm">Tudo preenchido!</p>
          <p className="text-gray-600 text-xs mt-0.5">Reveja o resumo abaixo. Se quiser alterar algo, clique em "Voltar".</p>
        </div>
      </div>

      {/* Quick summary cards */}
      <div className="space-y-3">
        <SummaryCard title="👋 Identificação" items={[
          { label: 'Projeto', value: data.nomeProjeto },
          { label: 'Área', value: data.areaNegocio },
          { label: 'BusinessMap', value: data.businessMapTicket },
          { label: 'Responsável', value: `${data.responsavel} · ${data.email}` },
        ]} />

        <SummaryCard title="💡 O problema" items={[
          { label: 'Situação actual', value: data.situacaoAtual },
          { label: 'O que precisa mudar', value: data.oquePrecisaMelhorar },
        ]} />

        <SummaryCard title="👥 Para quem" items={[
          { label: 'Utilizadores', value: Array.isArray(data.quemUsa) && data.quemUsa.length > 0 ? data.quemUsa.join(', ') : undefined },
          { label: 'Volume', value: data.quantasPessoas },
          { label: 'Perfil', value: data.comoSaoEssasPessoas },
          { label: 'Frustrações', value: data.oquesIncomoda },
        ]} />

        <SummaryCard title="🎯 Objetivo" items={[
          { label: 'O que queremos', value: data.oqueQueremos },
          { label: 'Impacto no negócio', value: data.comoVaiAjudar },
          { label: 'Como medir', value: data.comoSaberResultados },
          { label: 'Referências', value: data.inspiracoes },
        ]} />

        <SummaryCard title="📅 Prazos" items={[
          { label: 'Prioridade', value: prioridadeLabel[data.prioridade] ?? data.prioridade },
          { label: 'Entrega', value: data.quandoPrecisar },
          { label: 'Lançamento', value: data.quandoLancar },
          { label: 'Restrições', value: data.limitacoes },
          { label: 'Equipas', value: data.outrasEquipas },
          { label: 'Documentos', value: data.documentosLinks },
          { label: 'Notas', value: data.outrasNotas },
        ]} />
      </div>

      <div className="bg-[#E30613]/5 border border-[#E30613]/20 rounded-xl p-4 text-xs text-gray-600">
        📧 O briefing será enviado automaticamente para <strong>volodymyr.grikh@ctt.pt</strong> ao clicar em "Enviar Briefing".
      </div>
    </div>
  );
}

// ─── Ecrã de Sucesso ──────────────────────────────────────────────────────────
function SuccessMessage({ onReset }: { onReset: () => void }) {
  const savedData = sessionStorage.getItem('briefing_data');
  let data: BriefingFormData | null = null;
  try { data = savedData ? JSON.parse(savedData) : null; } catch { data = null; }

  return (
    <div className="py-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-5">
        <CheckCircle2 className="text-green-500" size={36} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Briefing enviado! 🎉</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Recebemos o pedido e vamos entrar em contacto em breve para marcar uma reunião de kick-off.
      </p>
      {data && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left max-w-sm mx-auto text-xs text-gray-500 space-y-1">
          <p><strong>Projeto:</strong> {data.nomeProjeto}</p>
          <p><strong>Para:</strong> volodymyr.grikh@ctt.pt</p>
          <p><strong>Enviado:</strong> {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      )}
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
      >
        Fazer novo pedido
      </button>
    </div>
  );
}

// ─── Componentes de UI ────────────────────────────────────────────────────────

function ConversationField({
  label, why, hint, examples, required, error, children,
}: {
  label: string;
  why?: string;
  hint?: string;
  examples?: string[];
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const [showExamples, setShowExamples] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <label className="block font-semibold text-gray-800 text-sm md:text-base leading-snug">
          {label}
          {required && <span className="text-[#E30613] ml-1">*</span>}
        </label>
        <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
          {why && (
            <button
              type="button"
              onClick={() => setShowWhy(v => !v)}
              className="text-gray-400 hover:text-[#E30613] transition-colors"
              title="Porquê perguntamos isto?"
            >
              <HelpCircle size={15} />
            </button>
          )}
        </div>
      </div>

      {showWhy && why && (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          💬 {why}
        </div>
      )}

      {hint && (
        <p className="text-xs text-gray-500 leading-relaxed">{hint}</p>
      )}

      {examples && examples.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowExamples(v => !v)}
            className="text-xs text-[#E30613] hover:underline flex items-center gap-1"
          >
            {showExamples ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showExamples ? 'Ocultar exemplos' : 'Ver exemplos de resposta'}
          </button>
          {showExamples && (
            <div className="mt-2 space-y-1.5">
              {examples.map((ex, i) => (
                <div key={i} className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  💡 <em>"{ex}"</em>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {children}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function QuickFillButton({ children, onClick, small }: { children: React.ReactNode; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border border-gray-300 rounded-full text-gray-600 hover:border-[#E30613] hover:text-[#E30613] hover:bg-red-50 transition-all ${
        small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      {children}
    </button>
  );
}

const Input = forwardRef(({ error, ...props }: any, ref: any) => (
  <input
    ref={ref}
    {...props}
    className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all outline-none ${
      error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    }`}
  />
));
Input.displayName = 'Input';

const Textarea = forwardRef(({ error, rows = 4, ...props }: any, ref: any) => (
  <textarea
    ref={ref}
    rows={rows}
    {...props}
    className={`w-full px-4 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all outline-none resize-none ${
      error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
    }`}
  />
));
Textarea.displayName = 'Textarea';

function SummaryCard({ title, items }: { title: string; items: { label: string; value?: string }[] }) {
  const filled = items.filter(i => i.value);
  if (filled.length === 0) return null;
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-800 text-sm mb-2">{title}</h4>
      <div className="space-y-1.5">
        {filled.map((item, i) => (
          <div key={i} className="text-xs break-words">
            <span className="font-medium text-gray-500">{item.label}:</span>{' '}
            <span className="text-gray-700">{item.value!.length > 150 ? item.value!.slice(0, 150) + '…' : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
