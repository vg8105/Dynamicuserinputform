import { useState, useEffect, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

interface BriefingFormData {
  // IDENTIFICAÇÃO
  businessMapTicket: string;
  nomeProjeto: string;
  areaNegocio: string;
  responsavel: string;
  email: string;

  // O PROBLEMA
  situacaoAtual: string;
  oquePrecisaMelhorar: string;

  // PARA QUEM
  quemUsa: string[];
  quantasPessoas: string;
  comoSaoEssasPessoas: string;
  comoFazemHoje: string;
  oquesIncomoda: string;

  // O OBJETIVO
  oqueQueremos: string;
  comoVaiAjudar: string;

  // REFERÊNCIAS E EXCLUSÕES
  inspiracoes: string;
  oqueNaoInclui: string;

  // MEDIR SUCESSO
  comoSaberResultados: string;
  numerosAtuais: string;
  numerosObjetivo: string;

  // QUANDO E LIMITAÇÕES
  prioridade: string;
  quandoPrecisar: string;
  quandoLancar: string;
  limitacoes: string;
  outrasEquipas: string;
  dependencias: string;

  // DOCUMENTOS E LINKS
  documentosLinks: string;

  // EXTRA
  outrasNotas: string;
}

const SECTIONS = [
  { id: 1, title: 'Identificação', icon: '👋', description: 'Dados do projeto' },
  { id: 2, title: 'O problema', icon: '❗', description: 'O que precisa melhorar?' },
  { id: 3, title: 'Para quem', icon: '👥', description: 'Quem vai usar?' },
  { id: 4, title: 'O objetivo', icon: '🎯', description: 'O que queremos?' },
  { id: 5, title: 'Medir resultados', icon: '📊', description: 'Como saber se funcionou?' },
  { id: 6, title: 'Quando e limitações', icon: '⏰', description: 'Prazos e restrições' },
  { id: 7, title: 'Confirmar', icon: '✅', description: 'Rever e enviar' },
];

export default function BriefingForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar sessionStorage no início para recuperar estado
  const [isSubmitted, setIsSubmitted] = useState(() => {
    const saved = sessionStorage.getItem('briefing_submitted');
    console.log('Initializing isSubmitted from sessionStorage:', saved);
    return saved === 'true';
  });

  const { register, handleSubmit, watch, reset } = useForm<BriefingFormData>({
    defaultValues: {
      quemUsa: [],
      prioridade: 'Média',
    }
  });

  const formData = watch();

  // Função para resetar tudo
  const resetForm = () => {
    console.log('=== RESET FORM CALLED ===');

    // Limpar sessionStorage
    sessionStorage.clear();
    console.log('SessionStorage cleared');

    // Resetar formulário
    reset({
      quemUsa: [],
      prioridade: 'Média',
    });
    console.log('Form reset');

    // Resetar estados
    setIsSubmitted(false);
    setIsSubmitting(false);
    setCurrentSection(1);
    console.log('States reset');

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.log('=== RESET COMPLETE ===');
  };

  // Log inicial ao carregar componente
  useEffect(() => {
    console.log('*** BriefingForm component mounted');
    console.log('*** Initial isSubmitted from sessionStorage:', isSubmitted);
    return () => {
      console.log('*** BriefingForm component unmounting');
    };
  }, []);

  const onSubmit = async (data: BriefingFormData) => {
    setIsSubmitting(true);

    const hoje = new Date().toLocaleDateString('pt-PT');
    const businessMap = data.businessMapTicket || 'Sem número';
    const projectName = data.nomeProjeto || 'Sem título';

    const templateParams = {
      to_email: 'volodymyr.grikh@ctt.pt',
      subject: `Briefing - ${businessMap} - ${projectName}`,
      from_name: data.responsavel,
      from_email: data.email,
      date: hoje,
      message: formatEmailBody(data),
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      sessionStorage.setItem('briefing_submitted', 'true');
      sessionStorage.setItem('briefing_data', JSON.stringify(data));
      setIsSubmitted(true);
    } catch (error) {
      console.error('EmailJS error:', error);
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


  const nextSection = () => {
    if (currentSection < 7) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-[#E30613] text-white p-4 md:p-8 rounded-t-lg">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">Pedido de Briefing</h1>
          <p className="text-base md:text-lg opacity-95 mb-3 md:mb-4">Equipa de Experiência Digital</p>
          <div className="bg-white/15 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/20">
            <p className="text-xs md:text-sm leading-relaxed">
              <strong className="block mb-2">👋 Olá!</strong>
              Este formulário ajuda-nos a perceber melhor o seu projeto.
              Responda com as suas próprias palavras, de forma simples.
              <span className="block mt-2 text-xs opacity-75">
                ⏱️ 8-10 minutos | 📧 Envie com pelo menos 5 dias de antecedência
              </span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white px-3 md:px-6 py-4 md:py-5 border-b overflow-x-auto">
          <div className="flex items-center justify-between mb-3 min-w-max md:min-w-0">
            {SECTIONS.map((section, index) => (
              <div key={section.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-base md:text-lg font-bold transition-all ${
                  currentSection >= section.id
                    ? 'bg-[#E30613] text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {currentSection === section.id ? section.icon : section.id}
                </div>
                {index < SECTIONS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 md:mx-2 transition-all ${
                    currentSection > section.id ? 'bg-[#E30613]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-base md:text-lg font-semibold text-gray-800">
              {SECTIONS[currentSection - 1].title}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {SECTIONS[currentSection - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white p-4 md:p-8 rounded-b-lg shadow-lg">
          <form
            noValidate
            onSubmit={(e) => {
              console.log('Form submit event triggered');
              e.preventDefault();
              e.stopPropagation();
              console.log('Default prevented, calling handleSubmit');
              handleSubmit(onSubmit)(e);
            }}
          >
            {!isSubmitted ? (
              <>
                {currentSection === 1 && <Section1Form register={register} />}
                {currentSection === 2 && <Section2Form register={register} />}
                {currentSection === 3 && <Section3Form register={register} />}
                {currentSection === 4 && <Section4Form register={register} />}
                {currentSection === 5 && <Section5Form register={register} />}
                {currentSection === 6 && <Section6Form register={register} />}
                {currentSection === 7 && <Section7Summary data={formData} register={register} />}
              </>
            ) : (
              <SuccessMessage onReset={resetForm} />
            )}

            {/* Navigation */}
            {!isSubmitted && (
              <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0 mt-6 md:mt-8 pt-4 md:pt-6 border-t">
                <button
                  type="button"
                  onClick={prevSection}
                  disabled={currentSection === 1}
                  className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base md:text-base touch-manipulation"
                >
                  <ChevronLeft size={20} />
                  Voltar
                </button>

                {currentSection < 7 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] transition-colors font-medium text-base md:text-base touch-manipulation"
                  >
                    Continuar
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Submit button clicked');
                      handleSubmit(onSubmit)();
                    }}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-4 md:py-3 bg-[#E30613] text-white rounded-lg hover:bg-[#C00510] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-base md:text-base shadow-lg touch-manipulation"
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

// SECÇÃO 1: Identificação
function Section1Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Informações básicas sobre o projeto.</strong><br />
          Isto ajuda-nos a identificar e dar seguimento ao pedido.
        </p>
      </InfoBox>

      <FormField
        label="Número do ticket no BusinessMap"
        placeholder="ex: BM-2024-1234"
        helpText="Todas as iniciativas devem ter um ticket no BusinessMap"
        {...register('businessMapTicket')}
      />

      <FormField
        label="Nome do projeto"
        placeholder="ex: Nova área de rastreamento"
        helpText="Um nome simples para identificar o projeto"
        {...register('nomeProjeto')}
      />

      <FormField
        label="Área de negócio"
        placeholder="ex: Marketing, E-commerce, Operações..."
        {...register('areaNegocio')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="O seu nome"
          placeholder="Nome completo"
          {...register('responsavel')}
        />
        <FormField
          label="O seu email"
          type="email"
          placeholder="nome@ctt.pt"
          {...register('email')}
        />
      </div>
    </div>
  );
}

// SECÇÃO 2: O Problema
function Section2Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Ajude-nos a perceber o problema.</strong><br />
          Descreva a situação atual e o que precisa de ser melhorado.
        </p>
      </InfoBox>

      <FormTextarea
        label="Como é que as coisas funcionam hoje?"
        placeholder="Exemplo: 'Os clientes vão ao site e procuram a página de rastreamento. Muitas pessoas não conseguem encontrar e acabam por ligar.'"
        rows={5}
        helpText="Descreva a situação atual"
        {...register('situacaoAtual')}
      />

      <FormTextarea
        label="O que é que precisa de ser melhorado?"
        placeholder="Exemplo: 'Precisamos de uma forma mais fácil e rápida para os clientes verem onde está a encomenda, sem se perderem no site.'"
        rows={5}
        helpText="O que não está a funcionar bem ou pode melhorar?"
        {...register('oquePrecisaMelhorar')}
      />
    </div>
  );
}

// SECÇÃO 3: Para Quem
function Section3Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Para quem é este projeto?</strong><br />
          Quanto melhor conhecermos quem vai usar, melhor será o resultado.
        </p>
      </InfoBox>

      <div>
        <label className="block font-medium text-gray-700 mb-3 text-sm md:text-base">
          Quem vai usar isto?
        </label>
        <p className="text-xs md:text-sm text-gray-600 mb-3">Selecione todas as opções que se aplicam</p>
        <div className="space-y-3">
          {[
            { value: 'Clientes particulares', desc: 'Pessoas que usam os CTT para envios pessoais' },
            { value: 'Empresas', desc: 'Clientes empresariais' },
            { value: 'Colaboradores CTT', desc: 'Pessoas que trabalham nos CTT' },
            { value: 'Parceiros', desc: 'Franchisados ou rede externa' },
            { value: 'Outro', desc: '' },
          ].map((option) => (
            <label key={option.value} className="flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 hover:border-[#E30613] cursor-pointer transition-all touch-manipulation">
              <input
                type="checkbox"
                value={option.value}
                {...register('quemUsa')}
                className="w-6 h-6 md:w-5 md:h-5 mt-0.5 text-[#E30613] border-gray-300 rounded focus:ring-[#E30613]"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm md:text-base">{option.value}</div>
                {option.desc && <div className="text-xs md:text-sm text-gray-600 mt-1">{option.desc}</div>}
              </div>
            </label>
          ))}
        </div>
      </div>

      <FormField
        label="Quantas pessoas vão usar (aproximadamente)?"
        placeholder="ex: 10.000 pessoas por mês / 50 colaboradores / toda a rede"
        helpText="Uma estimativa é suficiente"
        {...register('quantasPessoas')}
      />

      <FormTextarea
        label="Como são essas pessoas?"
        placeholder="Exemplo: 'Pessoas entre 30-60 anos que fazem compras online. Usam mais o telemóvel que o computador. Não são muito experientes com tecnologia.'"
        rows={4}
        helpText="Idade, hábitos, à-vontade com tecnologia"
        {...register('comoSaoEssasPessoas')}
      />

      <FormTextarea
        label="Como é que fazem isto hoje?"
        placeholder="Exemplo: 'Recebem um SMS com o link, clicam e vão para o site. Procuram a página de rastreamento e inserem o código.'"
        rows={4}
        helpText="Descreva os passos que dão atualmente (opcional)"
        {...register('comoFazemHoje')}
      />

      <FormTextarea
        label="O que é que as incomoda ou dificulta?"
        placeholder="Exemplo: 'Ficam frustradas porque não sabem quando chega a encomenda. Têm medo de perder a entrega. O site é confuso.'"
        rows={4}
        helpText="Principais problemas ou frustrações (opcional)"
        {...register('oquesIncomoda')}
      />
    </div>
  );
}

// SECÇÃO 4: O Objetivo
function Section4Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>O que queremos alcançar?</strong><br />
          Qual é o objetivo principal e que melhorias esperamos.
        </p>
      </InfoBox>

      <FormTextarea
        label="O que queremos alcançar?"
        placeholder="Exemplo: 'Queremos que os clientes consigam ver onde está a encomenda de forma rápida e fácil, sem precisar de ajuda.'"
        rows={4}
        helpText="Descreva o objetivo principal"
        {...register('oqueQueremos')}
      />

      <FormTextarea
        label="Como é que isto vai ajudar?"
        placeholder="Exemplo: 'Vai reduzir as chamadas ao call center. Os clientes vão ficar mais satisfeitos porque conseguem ter a informação rapidamente.'"
        rows={4}
        helpText="Que benefícios práticos esperamos?"
        {...register('comoVaiAjudar')}
      />

      <FormTextarea
        label="Tem algum exemplo ou inspiração? (opcional)"
        placeholder="Exemplo: 'Gosto da forma como a Amazon mostra o rastreamento. É muito claro e fácil de perceber.'"
        rows={4}
        helpText="Sites, apps ou exemplos que admiram"
        {...register('inspiracoes')}
      />
    </div>
  );
}

// SECÇÃO 5: Medir Resultados
function Section5Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Como vamos saber se funcionou?</strong><br />
          Ajude-nos a perceber como medir se está a resultar.
        </p>
      </InfoBox>

      <FormTextarea
        label="Como vamos saber se está a funcionar?"
        placeholder="Exemplo: 'Vamos ver se há menos chamadas ao call center. Vamos perguntar aos clientes se ficaram satisfeitos.'"
        rows={4}
        helpText="Que sinais mostram que o projeto está a resultar? (opcional)"
        {...register('comoSaberResultados')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormTextarea
          label="Números atuais (se souber)"
          placeholder="ex: 'Temos 500 chamadas por semana'"
          rows={3}
          helpText="Situação atual em números (opcional)"
          {...register('numerosAtuais')}
        />
        <FormTextarea
          label="Números que queremos atingir"
          placeholder="ex: 'Reduzir para 200 chamadas por semana'"
          rows={3}
          helpText="Objetivos em números (opcional)"
          {...register('numerosObjetivo')}
        />
      </div>
    </div>
  );
}

// SECÇÃO 6: Quando e Limitações
function Section6Form({ register }: any) {
  return (
    <div className="space-y-6">
      <InfoBox>
        <p className="text-sm md:text-base">
          <strong>Quando e com que limitações?</strong><br />
          Prazos, prioridade e eventuais restrições.
        </p>
      </InfoBox>

      <div>
        <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
          Qual é a prioridade?
        </label>
        <p className="text-xs md:text-sm text-gray-600 mb-3">Isto ajuda-nos a organizar o trabalho</p>
        <select
          {...register('prioridade')}
          className="w-full px-4 py-4 md:py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all font-medium"
        >
          <option value="Crítica">🔴 Urgente - Está a bloquear outras coisas</option>
          <option value="Alta">🟠 Importante - Precisa ser feito em breve</option>
          <option value="Média">🟡 Normal - Importante mas pode esperar</option>
          <option value="Baixa">🟢 Baixa - Não é urgente</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Quando precisamos pronto?"
          type="date"
          helpText="Data ideal de entrega (opcional)"
          {...register('quandoPrecisar')}
        />
        <FormField
          label="Quando lançar?"
          type="date"
          helpText="Data prevista para ir para o ar (opcional)"
          {...register('quandoLancar')}
        />
      </div>

      <FormTextarea
        label="Há limitações ou regras a seguir? (opcional)"
        placeholder="Exemplo: 'Tem de cumprir as regras de proteção de dados. Tem de funcionar bem em telemóveis. Tem de usar as cores CTT.'"
        rows={4}
        helpText="Regras, restrições legais, requisitos técnicos"
        {...register('limitacoes')}
      />

      <FormTextarea
        label="Outras equipas ou pessoas envolvidas? (opcional)"
        placeholder="Exemplo: 'Marketing precisa aprovar os textos. IT vai implementar depois. Fornecedor X está num projeto relacionado.'"
        rows={4}
        helpText="Outras equipas internas ou externas envolvidas"
        {...register('outrasEquipas')}
      />

      <FormTextarea
        label="Há dependências de outros projetos? (opcional)"
        placeholder="Exemplo: 'Depende de novo sistema de notificações que está a ser desenvolvido. Precisa esperar migração do servidor.'"
        rows={4}
        helpText="Projetos ou sistemas que este depende"
        {...register('dependencias')}
      />

      <FormTextarea
        label="O que é que NÃO está incluído? (opcional)"
        placeholder="Exemplo: 'Não inclui a programação do site, isso fica para a equipa de IT. Também não inclui a parte de fazer login.'"
        rows={4}
        helpText="Se houver algo que definitivamente NÃO faz parte"
        {...register('oqueNaoInclui')}
      />

      <FormTextarea
        label="Documentos de suporte ou links (opcional)"
        placeholder="Exemplo: 'Link para o protótipo: https://... | Link para a jornada atual: https://... | Documento com dados: https://...'"
        rows={5}
        helpText="Links para documentos, protótipos, jornadas, dashboards ou qualquer material de apoio"
        {...register('documentosLinks')}
      />
    </div>
  );
}

// SECÇÃO 7: Resumo
function Section7Summary({ data, register }: { data: BriefingFormData; register: any }) {
  return (
    <div className="space-y-6">
      <InfoBox variant="success">
        <div className="flex items-start gap-2 md:gap-3">
          <CheckCircle2 className="text-[#E30613] flex-shrink-0 mt-0.5 md:mt-1" size={24} />
          <div>
            <p className="font-bold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Está quase! 🎉</p>
            <p className="text-gray-800 text-sm md:text-base">
              Reveja o resumo abaixo. Se estiver tudo bem, clique em <strong>"Enviar Briefing"</strong>.
            </p>
          </div>
        </div>
      </InfoBox>

      <FormTextarea
        label="Há mais alguma coisa que devemos saber? (opcional)"
        placeholder="Qualquer informação adicional que possa ser útil..."
        rows={4}
        {...register('outrasNotas')}
      />

      <div className="border-t-2 border-gray-200 pt-4 md:pt-6 mt-4 md:mt-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">📋 Resumo</h3>
        <div className="space-y-3 md:space-y-4">
          <SummarySection title="🎫 Identificação">
            <SummaryItem label="BusinessMap" value={data.businessMapTicket} highlight />
            <SummaryItem label="Projeto" value={data.nomeProjeto} />
            <SummaryItem label="Área" value={data.areaNegocio} />
            <SummaryItem label="Responsável" value={data.responsavel} />
            <SummaryItem label="Email" value={data.email} />
          </SummarySection>

          <SummarySection title="❗ O Problema">
            <SummaryItem label="O que precisa melhorar" value={data.oquePrecisaMelhorar} truncate />
          </SummarySection>

          <SummarySection title="👥 Para Quem">
            <SummaryItem label="Quem vai usar" value={Array.isArray(data.quemUsa) ? data.quemUsa.join(', ') : ''} />
            <SummaryItem label="Quantas pessoas" value={data.quantasPessoas} />
          </SummarySection>

          <SummarySection title="🎯 Objetivo">
            <SummaryItem label="O que queremos" value={data.oqueQueremos} truncate />
            <SummaryItem label="Inspirações" value={data.inspiracoes} truncate />
          </SummarySection>

          <SummarySection title="📊 Medir Resultados">
            <SummaryItem label="Como saber se funciona" value={data.comoSaberResultados} truncate />
          </SummarySection>

          <SummarySection title="⏰ Quando e Limitações">
            <SummaryItem label="Prioridade" value={data.prioridade} />
            <SummaryItem label="Quando precisamos" value={data.quandoPrecisar || 'A definir'} />
            <SummaryItem label="Quando lançar" value={data.quandoLancar || 'A definir'} />
            <SummaryItem label="Limitações" value={data.limitacoes} truncate />
            <SummaryItem label="O que NÃO inclui" value={data.oqueNaoInclui} truncate />
          </SummarySection>

          <SummarySection title="🔗 Documentos e Links">
            <SummaryItem label="Documentos de suporte" value={data.documentosLinks} truncate />
          </SummarySection>
        </div>
      </div>
    </div>
  );
}

// Componente de Sucesso
function SuccessMessage({ onReset }: { onReset: () => void }) {
  const savedData = sessionStorage.getItem('briefing_data');
  const data = savedData ? JSON.parse(savedData) : null;
  const businessMap = data?.businessMapTicket || 'Sem número';
  const projectName = data?.nomeProjeto || 'Sem título';

  return (
    <div className="py-6 md:py-12 px-3 md:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full mb-4 md:mb-6">
            <CheckCircle2 className="text-[#E30613]" size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-4">Briefing Enviado! 🎉</h2>
          <p className="text-gray-600 text-base md:text-lg">
            O seu briefing foi enviado automaticamente para a equipa.
          </p>
        </div>

        <div className="bg-gray-50 border-2 border-[#E30613] rounded-lg p-4 md:p-6 mb-6">
          <p className="text-sm md:text-base text-gray-700 space-y-1">
            <strong className="block text-[#E30613] mb-2">📧 Detalhes do envio:</strong>
            <span className="block"><strong>Para:</strong> volodymyr.grikh@ctt.pt</span>
            <span className="block"><strong>Assunto:</strong> Briefing - {businessMap} - {projectName}</span>
          </p>
        </div>

        <div className="text-center pt-4 border-t">
          <button
            onClick={onReset}
            className="px-6 py-4 md:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-sm md:text-base touch-manipulation"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES
function InfoBox({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' }) {
  const styles = variant === 'success'
    ? 'bg-red-50 border-red-200'
    : 'bg-gray-50 border-gray-300';

  return (
    <div className={`${styles} border-2 rounded-lg p-3 md:p-4 mb-4 md:mb-6`}>
      <div className="text-gray-800 leading-relaxed text-sm md:text-base">{children}</div>
    </div>
  );
}

const FormField = forwardRef(({ label, helpText, ...props }: any, ref: any) => {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
        {label}
      </label>
      {helpText && (
        <p className="text-xs md:text-sm text-gray-600 mb-2">{helpText}</p>
      )}
      <input
        ref={ref}
        {...props}
        className="w-full px-4 py-3 md:py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all"
      />
    </div>
  );
});
FormField.displayName = 'FormField';

const FormTextarea = forwardRef(({ label, helpText, ...props }: any, ref: any) => {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-2 text-sm md:text-base">
        {label}
      </label>
      {helpText && (
        <p className="text-xs md:text-sm text-gray-600 mb-2">{helpText}</p>
      )}
      <textarea
        ref={ref}
        {...props}
        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E30613] focus:border-[#E30613] transition-all resize-none"
      />
    </div>
  );
});
FormTextarea.displayName = 'FormTextarea';

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-3 md:p-4 bg-gray-50">
      <h4 className="font-bold text-[#E30613] mb-2 md:mb-3 text-base md:text-lg">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, truncate, highlight }: { label: string; value?: string; truncate?: boolean; highlight?: boolean }) {
  if (!value) return null;

  const displayValue = truncate && value.length > 120
    ? value.substring(0, 120) + '...'
    : value;

  return (
    <div className="text-xs md:text-sm break-words">
      <span className={`font-medium ${highlight ? 'text-[#E30613]' : 'text-gray-700'}`}>{label}:</span>{' '}
      <span className="text-gray-600">{displayValue}</span>
    </div>
  );
}
