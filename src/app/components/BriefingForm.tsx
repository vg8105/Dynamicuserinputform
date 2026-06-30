import { useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

// EmailJS credentials — move to .env in production:
// VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
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

// Required fields per section — used for validation before advancing
const REQUIRED_BY_SECTION: Record<number, (keyof BriefingFormData)[]> = {
  1: ['businessMapTicket', 'nomeProjeto', 'areaNegocio', 'responsavel', 'email'],
  2: ['situacaoAtual', 'oquePrecisaMelhorar'],
  3: ['quemUsa'],
  4: ['oqueQueremos', 'comoVaiAjudar'],
  5: [],
  6: [],
  7: [],
};

const SECTIONS = [
  { id: 1, title: 'Identificação', icon: '👋', description: 'Dados do projeto' },
  { id: 2, title: 'O problema', icon: '❗', description: 'O que precisa melhorar?' },
  { id: 3, title: 'Para quem', icon: '👥', description: 'Quem vai usar?' },
  { id: 4, title: 'O objetivo', icon: '🎯', description: 'O que queremos?' },
  { id: 5, title: 'Resultados', icon: '📊', description: 'Como saber se funcionou?' },
  { id: 6, title: 'Prazos', icon: '⏰', description: 'Datas e limitações' },
  { id: 7, title: 'Confirmar', icon: '✅', description: 'Rever e enviar' },
];

export default function BriefingForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return sessionStorage.getItem('briefing_submitted') === 'true';
  });

  const { register, handleSubmit, reset, formState: { errors }, trigger, getValues } = useForm<BriefingFormData>({
    defaultValues: { quemUsa: [], prioridade: 'Média' },
    mode: 'onTouched',
  });

  const resetForm = () => {
    sessionStorage.clear();
    reset({ quemUsa: [], prioridade: 'Média' });
    setIsSubmitted(false);
    setIsSubmitting(false);
    setCurrentSection(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: BriefingFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const businessMap = data.businessMapTicket || 'Sem número';
    const projectName = data.nomeProjeto || 'Sem título';

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          subject: `Briefing - ${businessMap} - ${projectName}`,
          from_name: data.responsavel,
          from_email: data.email,
          message: formatEmailBody(data),
        },
        EMAILJS_PUBLIC_KEY
      );

      sessionStorage.setItem('briefing_submitted', 'true');
      sessionStorage.setItem('briefing_data', JSON.stringify(data));
      setIsSubmitted(true);
    } catch (error) {
      toast.error('Erro ao enviar o briefing. Por favor tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEmailBody = (data: BriefingFormData) => {
    const hoje = new Date().toLocaleDateString('pt-PT');
    return `
PEDIDO DE BRIEFING - Equipa de Experiência Digital CTT
=====================================================

🎫 BUSINESSMAP: ${data.businessMapTicket}
📋 PROJETO: ${data.nomeProjeto}
📅 DATA: ${hoje}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 QUEM FAZ O PEDIDO
--------------------
Área: ${data.areaNegocio}
Responsável: ${data.responsavel}
Email: ${data.email}

❗ O PROBLEMA
-------------
Como funciona hoje:
${data.situacaoAtual}

O que precisa melhorar:
${data.oquePrecisaMelhorar}

👥 PARA QUEM É
--------------
Quem vai usar: ${Array.isArray(data.quemUsa) ? data.quemUsa.join(', ') : 'N/A'}
Quantas pessoas: ${data.quantasPessoas || 'N/A'}

Como são essas pessoas:
${data.comoSaoEssasPessoas || 'N/A'}

Como fazem hoje:
${data.comoFazemHoje || 'N/A'}

O que as incomoda:
${data.oquesIncomoda || 'N/A'}

🎯 O OBJETIVO
-------------
O que queremos:
${data.oqueQueremos}

Como vai ajudar:
${data.comoVaiAjudar}

💡 REFERÊNCIAS E EXCLUSÕES
--------------------------
Inspirações ou referências:
${data.inspiracoes || 'Nenhuma'}

O que NÃO está incluído:
${data.oqueNaoInclui || 'N/A'}

📊 MEDIR RESULTADOS
-------------------
Como saber se está a funcionar:
${data.comoSaberResultados || 'N/A'}

Números atuais:
${data.numerosAtuais || 'N/A'}

Números que queremos atingir:
${data.numerosObjetivo || 'N/A'}

⏰ QUANDO E LIMITAÇÕES
----------------------
Prioridade: ${data.prioridade || 'N/A'}
Quando precisamos: ${data.quandoPrecisar || 'A definir'}
Quando lançar: ${data.quandoLancar || 'A definir'}

Limitações ou regras:
${data.limitacoes || 'Nenhuma'}

Outras equipas envolvidas:
${data.outrasEquipas || 'Nenhuma'}

Dependências de outros projetos:
${data.dependencias || 'Nenhuma'}

🔗 DOCUMENTOS E LINKS DE SUPORTE
---------------------------------
${data.documentosLinks || 'Nenhum'}

📎 NOTAS ADICIONAIS
-------------------
${data.outrasNotas || 'Nenhuma'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Briefing enviado através do formulário digital
    `.trim();
  };

  const nextSection = async () => {
    const required = REQUIRED_BY_SECTION[currentSection] ?? [];
    if (required.length > 0) {
      const valid = await trigger(required);
      if (!valid) {
        toast.error('Por favor preencha os campos obrigatórios antes de continuar.');
        return;
      }
    }
    // Extra check for quemUsa (checkbox array)
    if (currentSection === 3) {
      const quemUsa = getValues('quemUsa');
      if (!quemUsa || quemUsa.length === 0) {
        toast.error('Por favor selecione pelo menos uma opção em "Quem vai usar".');
        return;
      }
    }
    setCurrentSection(s => Math.min(s + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevSection = () => {
    setCurrentSection(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progressPct = Math.round(((currentSection - 1) / (SECTIONS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-[#E30613] text-white p-4 md:p-8 rounded-t-lg">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Pedido de Briefing</h1>
          <p className="text-base md:text-lg opacity-95 mb-3 md:mb-4">Equipa de Experiência Digital CTT</p>
          <div className="bg-white/15 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/20">
            <p className="text-xs md:text-sm leading-relaxed">
              <strong className="block mb-1">👋 Olá!</strong>
              Responda com as suas próprias palavras — não há respostas certas ou erradas.
              <span className="block mt-1 text-xs opacity-75">⏱️ 8-10 minutos &nbsp;·&nbsp; 📧 Envie com pelo menos 5 dias de antecedência</span>
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white px-3 md:px-6 py-4 border-b">
          {/* Step dots */}
          <div className="flex items-center justify-between mb-3 overflow-x-auto min-w-max md:min-w-0">
            {SECTIONS.map((section, index) => (
              <div key={section.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => currentSection > section.id && setCurrentSection(section.id)}
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-base md:text-lg font-bold transition-all focus:outline-none ${
                    currentSection > section.id
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : currentSection === section.id
                        ? 'bg-[#E30613] text-white shadow-lg scale-110 cursor-default'
                        : 'bg-gray-200 text-gray-400 cursor-default'
                  }`}
                  aria-label={section.title}
                  disabled={currentSection <= section.id}
                >
                  {currentSection > section.id ? '✓' : currentSection === section.id ? section.icon : section.id}
                </button>
                {index < SECTIONS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 md:mx-2 transition-all ${
                    currentSection > section.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div
              className="bg-[#E30613] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-base md:text-lg font-semibold text-gray-800">
                {SECTIONS[currentSection - 1].title}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {SECTIONS[currentSection - 1].description}
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {currentSection} / {SECTIONS.length}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-4 md:p-8 rounded-b-lg shadow-lg">
          <form noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }}>
            {!isSubmitted ? (
              <>
                {currentSection === 1 && <Section1Form register={register} errors={errors} />}
                {currentSection === 2 && <Section2Form register={register} errors={errors} />}
                {currentSection === 3 && <Section3Form register={register} errors={errors} />}
                {currentSection === 4 && <Section4Form register={register} errors={errors} />}
                {currentSection === 5 && <Section5Form register={register} />}
                {currentSection === 6 && <Section6Form register={register} />}
                {currentSection === 7 && <Section7Summary data={getValues()} register={register} />}
              </>
            ) : (
              <SuccessMessage onReset={resetForm} />
            )}

            {!isSubmitted && (
              <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0 mt-6 md:mt-8 pt-4 md:pt-6 border-t">
                <button
                  type="button"
                  onClick={prevSection}
                  disabled={currentSection === 1}
                  className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
                >
                  <ChevronLeft size={20} />
                  Voltar
                </button>

                {currentSection < 7 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] transition-colors font-medium touch-manipulation"
                  >
                    Continuar
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(onSubmit)()}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-4 md:py-3 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg touch-manipulation"
                  >
                    {isSubmitting ? 'A enviar...' : 'Enviar Briefing'}
                    <Send size={20} />
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── SECÇÃO 1: Identificação ────────────────────────────────────────────────
function Section1Form({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Informações básicas sobre o projeto.</strong><br />
          Os campos com <span className="text-[#E30613]">*</span> são obrigatórios.
        </p>
      </InfoBox>

      <FormField
        label="Número do ticket no BusinessMap"
        placeholder="ex: BM-2024-1234"
        helpText="Todas as iniciativas devem ter um ticket no BusinessMap"
        required
        error={errors.businessMapTicket?.message}
        {...register('businessMapTicket', { required: 'Campo obrigatório' })}
      />

      <FormField
        label="Nome do projeto"
        placeholder="ex: Nova área de rastreamento"
        helpText="Um nome simples para identificar o projeto"
        required
        error={errors.nomeProjeto?.message}
        {...register('nomeProjeto', { required: 'Campo obrigatório' })}
      />

      <FormField
        label="Área de negócio"
        placeholder="ex: Marketing, E-commerce, Operações..."
        required
        error={errors.areaNegocio?.message}
        {...register('areaNegocio', { required: 'Campo obrigatório' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="O seu nome"
          placeholder="Nome completo"
          required
          error={errors.responsavel?.message}
          {...register('responsavel', { required: 'Campo obrigatório' })}
        />
        <FormField
          label="O seu email"
          type="email"
          placeholder="nome@ctt.pt"
          required
          error={errors.email?.message}
          {...register('email', {
            required: 'Campo obrigatório',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
          })}
        />
      </div>
    </div>
  );
}

// ─── SECÇÃO 2: O Problema ───────────────────────────────────────────────────
function Section2Form({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Ajude-nos a perceber o problema.</strong><br />
          Não precisa ser perfeito — escreva como falaria com um colega.
        </p>
      </InfoBox>

      <FormTextarea
        label="Como é que as coisas funcionam hoje?"
        placeholder="Ex: 'Os clientes vão ao site e procuram a página de rastreamento. Muitas pessoas não conseguem encontrar e acabam por ligar para o call center.'"
        rows={5}
        helpText="Descreva o processo atual, passo a passo se possível"
        required
        error={errors.situacaoAtual?.message}
        {...register('situacaoAtual', { required: 'Campo obrigatório' })}
      />

      <FormTextarea
        label="O que é que precisa de ser melhorado?"
        placeholder="Ex: 'Precisamos de uma forma mais fácil e rápida para os clientes verem onde está a encomenda, sem se perderem no site.'"
        rows={5}
        helpText="O que não está a funcionar bem ou pode melhorar?"
        required
        error={errors.oquePrecisaMelhorar?.message}
        {...register('oquePrecisaMelhorar', { required: 'Campo obrigatório' })}
      />
    </div>
  );
}

// ─── SECÇÃO 3: Para Quem ────────────────────────────────────────────────────
function Section3Form({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Para quem é este projeto?</strong><br />
          Quanto mais soubermos sobre quem vai usar, melhor será o resultado final.
        </p>
      </InfoBox>

      <div>
        <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">
          Quem vai usar isto? <span className="text-[#E30613]">*</span>
        </label>
        <p className="text-xs md:text-sm text-gray-500 mb-3">Pode selecionar mais do que uma opção</p>
        <div className="space-y-3">
          {[
            { value: 'Clientes particulares', desc: 'Pessoas que usam os CTT para envios pessoais' },
            { value: 'Empresas', desc: 'Clientes empresariais e grandes contas' },
            { value: 'Colaboradores CTT', desc: 'Pessoas que trabalham nos CTT' },
            { value: 'Parceiros', desc: 'Franchisados ou rede externa' },
            { value: 'Outro', desc: 'Outro tipo de utilizador' },
          ].map((option) => (
            <label key={option.value} className="flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-red-50 hover:border-[#E30613] cursor-pointer transition-all touch-manipulation">
              <input
                type="checkbox"
                value={option.value}
                {...register('quemUsa')}
                className="w-6 h-6 md:w-5 md:h-5 mt-0.5 text-[#E30613] border-gray-300 rounded focus:ring-[#E30613]"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm md:text-base">{option.value}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-0.5">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <FormField
        label="Quantas pessoas vão usar (aproximadamente)?"
        placeholder="ex: 10.000 pessoas/mês · 50 colaboradores · toda a rede"
        helpText="Uma estimativa é suficiente — não precisa ser exacto"
        {...register('quantasPessoas')}
      />

      <FormTextarea
        label="Como são essas pessoas? (opcional)"
        placeholder="Ex: 'Pessoas entre 30-60 anos que fazem compras online. Usam mais o telemóvel do que o computador. Não são muito experientes com tecnologia.'"
        rows={4}
        helpText="Idade, hábitos digitais, à-vontade com tecnologia"
        {...register('comoSaoEssasPessoas')}
      />

      <FormTextarea
        label="Como é que fazem isto hoje? (opcional)"
        placeholder="Ex: 'Recebem um SMS com o link, clicam e vão para o site. Procuram a página de rastreamento e inserem o código.'"
        rows={4}
        helpText="Descreva os passos que dão actualmente"
        {...register('comoFazemHoje')}
      />

      <FormTextarea
        label="O que é que as incomoda ou dificulta? (opcional)"
        placeholder="Ex: 'Ficam frustradas porque não sabem quando chega a encomenda. O site é confuso no telemóvel.'"
        rows={4}
        helpText="Principais problemas ou frustrações que têm hoje"
        {...register('oquesIncomoda')}
      />
    </div>
  );
}

// ─── SECÇÃO 4: O Objetivo ───────────────────────────────────────────────────
function Section4Form({ register, errors }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>O que queremos alcançar?</strong><br />
          Pense no resultado final — o que é que vai ser diferente depois deste projeto?
        </p>
      </InfoBox>

      <FormTextarea
        label="O que queremos alcançar?"
        placeholder="Ex: 'Queremos que os clientes consigam ver onde está a encomenda de forma rápida e fácil, sem precisar de ajuda ou de ligar para o call center.'"
        rows={5}
        helpText="Descreva o objetivo principal em linguagem simples"
        required
        error={errors.oqueQueremos?.message}
        {...register('oqueQueremos', { required: 'Campo obrigatório' })}
      />

      <FormTextarea
        label="Como é que isto vai ajudar?"
        placeholder="Ex: 'Vai reduzir as chamadas ao call center. Os clientes vão ficar mais satisfeitos porque conseguem ter a informação sem esperar.'"
        rows={4}
        helpText="Que benefícios práticos esperamos para o negócio e para os utilizadores?"
        required
        error={errors.comoVaiAjudar?.message}
        {...register('comoVaiAjudar', { required: 'Campo obrigatório' })}
      />

      <FormTextarea
        label="Tem algum exemplo ou inspiração? (opcional)"
        placeholder="Ex: 'Gosto da forma como a Amazon mostra o rastreamento — é muito claro e simples de perceber.'"
        rows={4}
        helpText="Sites, apps ou exemplos que admira ou que gostaria de seguir"
        {...register('inspiracoes')}
      />

      <FormTextarea
        label="O que NÃO está incluído neste pedido? (opcional)"
        placeholder="Ex: 'Não inclui a programação do backend — isso fica para a equipa de IT. Também não inclui a área de login.'"
        rows={3}
        helpText="Se houver algo que definitivamente não faz parte deste projeto"
        {...register('oqueNaoInclui')}
      />
    </div>
  );
}

// ─── SECÇÃO 5: Medir Resultados ─────────────────────────────────────────────
function Section5Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Como vamos saber se funcionou?</strong><br />
          Todos os campos desta secção são opcionais — preencha o que souber.
        </p>
      </InfoBox>

      <FormTextarea
        label="Como vamos saber se está a funcionar? (opcional)"
        placeholder="Ex: 'Vamos ver se há menos chamadas ao call center. Vamos fazer inquéritos de satisfação aos clientes após a entrega.'"
        rows={4}
        helpText="Que sinais ou indicadores mostram que o projeto está a resultar?"
        {...register('comoSaberResultados')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormTextarea
          label="Números actuais (opcional)"
          placeholder="Ex: '500 chamadas por semana relacionadas com rastreamento'"
          rows={3}
          helpText="Situação actual em números, se os tiver"
          {...register('numerosAtuais')}
        />
        <FormTextarea
          label="Números que queremos atingir (opcional)"
          placeholder="Ex: 'Reduzir para menos de 200 chamadas por semana'"
          rows={3}
          helpText="Objetivos quantificáveis, se os houver"
          {...register('numerosObjetivo')}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> Se não tiver números agora, não se preocupe. Podemos definir as métricas em conjunto durante o processo.
        </p>
      </div>
    </div>
  );
}

// ─── SECÇÃO 6: Prazos e Limitações ──────────────────────────────────────────
function Section6Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Prazos, prioridade e contexto.</strong><br />
          Isto ajuda-nos a planear o trabalho e a envolver as pessoas certas.
        </p>
      </InfoBox>

      <div>
        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
          Qual é a prioridade deste projeto?
        </label>
        <div className="space-y-2">
          {[
            { value: 'Crítica', label: '🔴 Urgente', desc: 'Está a bloquear outras coisas — precisa de atenção imediata' },
            { value: 'Alta', label: '🟠 Alta', desc: 'Importante — precisa de ser feito em breve' },
            { value: 'Média', label: '🟡 Normal', desc: 'Importante mas pode aguardar planeamento' },
            { value: 'Baixa', label: '🟢 Baixa', desc: 'Não é urgente — pode entrar em ciclo normal' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 p-3 border-2 rounded-lg hover:bg-red-50 hover:border-[#E30613] cursor-pointer transition-all">
              <input
                type="radio"
                value={opt.value}
                {...register('prioridade')}
                className="mt-1 text-[#E30613] focus:ring-[#E30613]"
              />
              <div>
                <div className="font-medium text-gray-800 text-sm">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Quando precisamos que esteja pronto? (opcional)"
          type="date"
          helpText="Data ideal de entrega para revisão/aprovação"
          {...register('quandoPrecisar')}
        />
        <FormField
          label="Quando está previsto o lançamento? (opcional)"
          type="date"
          helpText="Data prevista para ir para o ar"
          {...register('quandoLancar')}
        />
      </div>

      <FormTextarea
        label="Há limitações ou regras a seguir? (opcional)"
        placeholder="Ex: 'Tem de cumprir as regras de protecção de dados (RGPD). Tem de funcionar bem em telemóveis. Tem de usar as cores e tipografia CTT.'"
        rows={3}
        helpText="Regras, restrições legais, requisitos técnicos ou de marca"
        {...register('limitacoes')}
      />

      <FormTextarea
        label="Outras equipas ou fornecedores envolvidos? (opcional)"
        placeholder="Ex: 'Marketing precisa aprovar os textos. A equipa de IT vai implementar. O fornecedor X está num projeto relacionado.'"
        rows={3}
        helpText="Outras equipas internas ou parceiros externos que devemos incluir"
        {...register('outrasEquipas')}
      />

      <FormTextarea
        label="Este projeto depende de outros projetos? (opcional)"
        placeholder="Ex: 'Depende do novo sistema de notificações que está em desenvolvimento. Precisa esperar a migração do servidor prevista para Setembro.'"
        rows={3}
        helpText="Projetos, sistemas ou entregas de que este depende"
        {...register('dependencias')}
      />

      <FormTextarea
        label="Documentos, links ou materiais de apoio (opcional)"
        placeholder="Ex: 'Protótipo: https://... | Jornada actual: https://... | Dados de Analytics: https://...'"
        rows={4}
        helpText="Links para documentos, protótipos, jornadas, dashboards ou qualquer material útil"
        {...register('documentosLinks')}
      />
    </div>
  );
}

// ─── SECÇÃO 7: Resumo ───────────────────────────────────────────────────────
function Section7Summary({ data, register }: { data: BriefingFormData; register: any }) {
  return (
    <div className="space-y-6">
      <InfoBox variant="success">
        <div className="flex items-start gap-2 md:gap-3">
          <CheckCircle2 className="text-[#E30613] flex-shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-bold text-gray-900 mb-1 text-base md:text-lg">Está quase! 🎉</p>
            <p className="text-gray-700 text-sm md:text-base">
              Reveja o resumo abaixo. Se estiver tudo correcto, clique em <strong>"Enviar Briefing"</strong> — o email é enviado automaticamente.
            </p>
          </div>
        </div>
      </InfoBox>

      <FormTextarea
        label="Quer acrescentar mais alguma coisa? (opcional)"
        placeholder="Qualquer informação adicional que possa ser útil para a equipa..."
        rows={3}
        {...register('outrasNotas')}
      />

      <div className="border-t-2 border-gray-100 pt-4 md:pt-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">📋 Resumo do briefing</h3>
        <div className="space-y-3">
          <SummarySection title="🎫 Identificação">
            <SummaryItem label="BusinessMap" value={data.businessMapTicket} highlight />
            <SummaryItem label="Projeto" value={data.nomeProjeto} />
            <SummaryItem label="Área" value={data.areaNegocio} />
            <SummaryItem label="Responsável" value={data.responsavel} />
            <SummaryItem label="Email" value={data.email} />
          </SummarySection>

          <SummarySection title="❗ O Problema">
            <SummaryItem label="Situação actual" value={data.situacaoAtual} truncate />
            <SummaryItem label="O que precisa melhorar" value={data.oquePrecisaMelhorar} truncate />
          </SummarySection>

          <SummarySection title="👥 Para Quem">
            <SummaryItem label="Quem vai usar" value={Array.isArray(data.quemUsa) ? data.quemUsa.join(', ') : ''} />
            <SummaryItem label="Quantas pessoas" value={data.quantasPessoas} />
          </SummarySection>

          <SummarySection title="🎯 Objetivo">
            <SummaryItem label="O que queremos" value={data.oqueQueremos} truncate />
            <SummaryItem label="Como vai ajudar" value={data.comoVaiAjudar} truncate />
            <SummaryItem label="Inspirações" value={data.inspiracoes} truncate />
          </SummarySection>

          <SummarySection title="📊 Resultados">
            <SummaryItem label="Como medir" value={data.comoSaberResultados} truncate />
            <SummaryItem label="Números actuais" value={data.numerosAtuais} />
            <SummaryItem label="Números objetivo" value={data.numerosObjetivo} />
          </SummarySection>

          <SummarySection title="⏰ Prazos">
            <SummaryItem label="Prioridade" value={data.prioridade} />
            <SummaryItem label="Quando precisamos" value={data.quandoPrecisar || 'A definir'} />
            <SummaryItem label="Quando lançar" value={data.quandoLancar || 'A definir'} />
            <SummaryItem label="Limitações" value={data.limitacoes} truncate />
            <SummaryItem label="Dependências" value={data.dependencias} truncate />
          </SummarySection>

          {(data.documentosLinks || data.outrasNotas) && (
            <SummarySection title="🔗 Extras">
              <SummaryItem label="Documentos" value={data.documentosLinks} truncate />
              <SummaryItem label="Notas" value={data.outrasNotas} truncate />
            </SummarySection>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ecrã de Sucesso ────────────────────────────────────────────────────────
function SuccessMessage({ onReset }: { onReset: () => void }) {
  const savedData = sessionStorage.getItem('briefing_data');
  let data: BriefingFormData | null = null;
  try { data = savedData ? JSON.parse(savedData) : null; } catch { data = null; }
  const businessMap = data?.businessMapTicket || 'Sem número';
  const projectName = data?.nomeProjeto || 'Sem título';

  return (
    <div className="py-8 md:py-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full mb-5">
        <CheckCircle2 className="text-green-500" size={40} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Briefing enviado! 🎉</h2>
      <p className="text-gray-500 text-base mb-6 max-w-sm mx-auto">
        A equipa de Experiência Digital recebeu o seu pedido e entrará em contacto em breve.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-left max-w-sm mx-auto">
        <p className="text-xs text-gray-500 mb-1"><strong>Para:</strong> volodymyr.grikh@ctt.pt</p>
        <p className="text-xs text-gray-500 mb-1"><strong>Assunto:</strong> Briefing - {businessMap} - {projectName}</p>
        <p className="text-xs text-gray-400 mt-2">Enviado em {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm touch-manipulation"
      >
        Fazer novo pedido
      </button>
    </div>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────
function InfoBox({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' }) {
  const styles = variant === 'success' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
  return (
    <div className={`${styles} border-2 rounded-lg p-3 md:p-4 mb-2`}>
      <div className="text-gray-800 leading-relaxed text-sm md:text-base">{children}</div>
    </div>
  );
}

const FormField = forwardRef(({ label, helpText, required, error, ...props }: any, ref: any) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">
      {label}{required && <span className="text-[#E30613] ml-1">*</span>}
    </label>
    {helpText && <p className="text-xs md:text-sm text-gray-500 mb-2">{helpText}</p>}
    <input
      ref={ref}
      {...props}
      className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
));
FormField.displayName = 'FormField';

const FormTextarea = forwardRef(({ label, helpText, required, error, ...props }: any, ref: any) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1 text-sm md:text-base">
      {label}{required && <span className="text-[#E30613] ml-1">*</span>}
    </label>
    {helpText && <p className="text-xs md:text-sm text-gray-500 mb-2">{helpText}</p>}
    <textarea
      ref={ref}
      {...props}
      className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all resize-none ${
        error ? 'border-red-400 bg-red-50' : 'border-gray-300'
      }`}
    />
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
));
FormTextarea.displayName = 'FormTextarea';

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 md:p-4 bg-gray-50">
      <h4 className="font-bold text-[#E30613] mb-2 text-sm md:text-base">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value, truncate, highlight }: { label: string; value?: string; truncate?: boolean; highlight?: boolean }) {
  if (!value) return null;
  const displayValue = truncate && value.length > 120 ? value.substring(0, 120) + '…' : value;
  return (
    <div className="text-xs md:text-sm break-words">
      <span className={`font-medium ${highlight ? 'text-[#E30613]' : 'text-gray-600'}`}>{label}:</span>{' '}
      <span className="text-gray-700">{displayValue}</span>
    </div>
  );
}
