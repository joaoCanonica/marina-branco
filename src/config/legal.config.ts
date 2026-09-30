/**
 * Política de Privacidade, Termos de Uso e consentimento de cookies.
 * Texto-base conservador (LGPD, Lei 13.709/2018). REVISÃO JURÍDICA OBRIGATÓRIA
 * antes da publicação; `revisadoPor` vazio mantém o aviso de pendência.
 */
import { CONFIRMAR, type Profile } from '../lib/esquemas.ts';
import { contato } from './contato.config.ts';

export const legal = {
  versao: '1.0',
  vigenteDesde: `${CONFIRMAR}: data de publicação`,
  revisadoPor: `${CONFIRMAR}: advogado(a) responsável pela revisão`,
  hospedagem: `${CONFIRMAR}: provedor de hospedagem e país (ex.: Vercel, EUA)`,
  foro: 'Comarca de Lages – SC',
};

/** Consentimento de cookies/armazenamento. Mudar `versao` faz o banner reaparecer. */
export const cookies = {
  versao: '1',
  chave: 'mb-consentimento',
  categorias: [
    {
      id: 'essenciais',
      obrigatoria: true,
      titulo: 'Essenciais',
      descricao: 'Guardam apenas a sua escolha sobre cookies, no seu navegador. Não identificam você e não são enviados a ninguém.',
    },
    {
      id: 'estatistica',
      obrigatoria: false,
      titulo: 'Estatística',
      descricao: 'Hoje o site não usa nenhuma ferramenta de estatística. Se um dia usar, ela só será carregada se você aceitar, e nunca registrará páginas de procedimentos sensíveis.',
    },
  ],
} as const;

export interface SecaoLegal { titulo: string; paragrafos: string[] }

export function politicaPrivacidade(p: Profile): SecaoLegal[] {
  const f = contato.formulario;
  return [
    {
      titulo: 'Quem somos',
      paragrafos: [
        `${p.nomeClinica}, CNPJ ${p.cnpj}, é a controladora dos dados pessoais tratados por meio deste site.`,
        `Encarregado(a) pelo tratamento de dados: ${p.encarregadoLgpd.nome} — ${p.encarregadoLgpd.contato}.`,
      ],
    },
    {
      titulo: 'O que este site coleta',
      paragrafos: [
        'Navegar no site não exige cadastro. O site não usa cookies de publicidade nem ferramentas de estatística, e não carrega conteúdo de terceiros (mapas, vídeos, redes sociais) na página.',
        `Se você usar o formulário opcional "pedir contato", coletamos apenas nome, telefone, o período preferido e o registro do seu consentimento. Esses dados são usados só para retornar o contato e são guardados por até ${f.retencaoDias} dias. Base legal: consentimento (art. 7º, I, da LGPD).`,
        'O site não coleta sintomas, fotos, exames ou qualquer informação de saúde, e não aceita envio de arquivos.',
      ],
    },
    {
      titulo: 'Dados de saúde e imagens',
      paragrafos: [
        'Informações de saúde e imagens de pacientes são dados pessoais sensíveis (art. 5º, II, e art. 11 da LGPD). Elas são tratadas apenas no atendimento presencial, para a prestação do serviço de saúde, e nunca por meio deste site.',
        'Imagens de pacientes só são divulgadas com termo de autorização específico, por escrito, sem identificação e sem qualquer vantagem em troca. A autorização pode ser revogada a qualquer momento.',
        'Pedimos que você não envie fotos nem informações de saúde pelo WhatsApp ou pelo formulário.',
      ],
    },
    {
      titulo: 'WhatsApp, telefone e links externos',
      paragrafos: [
        'Ao tocar em "WhatsApp" ou "Abrir no mapa", você sai deste site e passa a usar um serviço de terceiro, sujeito à política de privacidade dele. A mensagem pré-preenchida do WhatsApp não contém nenhum dado de saúde.',
      ],
    },
    {
      titulo: 'Com quem compartilhamos',
      paragrafos: [
        `Os dados do formulário são recebidos por ${f.operador}, que atua como operador em nome da clínica.`,
        `O site é hospedado por ${legal.hospedagem}. Quando houver transferência internacional, ela segue o art. 33 da LGPD.`,
        'Não vendemos nem cedemos dados pessoais a terceiros.',
      ],
    },
    {
      titulo: 'Cookies e armazenamento no navegador',
      paragrafos: [
        'Guardamos no seu navegador apenas a sua escolha sobre cookies. Você pode aceitar, recusar ou personalizar, com a mesma facilidade, e mudar de ideia a qualquer momento pelo link "Preferências de cookies" no rodapé.',
      ],
    },
    {
      titulo: 'Retenção e segurança',
      paragrafos: [
        `Dados do formulário: até ${f.retencaoDias} dias ou até o pedido de exclusão, o que ocorrer primeiro. Prontuários e registros de atendimento seguem os prazos legais aplicáveis ao serviço de saúde, fora deste site.`,
        'Adotamos medidas técnicas e administrativas para proteger os dados, como conexão cifrada (HTTPS) e acesso restrito.',
      ],
    },
    {
      titulo: 'Seus direitos',
      paragrafos: [
        'Você pode pedir, a qualquer momento: confirmação de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento e revogação do consentimento (art. 18 da LGPD).',
        `Para exercer seus direitos, fale com o(a) encarregado(a): ${p.encarregadoLgpd.contato}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
      ],
    },
    {
      titulo: 'Alterações',
      paragrafos: [`Versão ${legal.versao}, vigente desde ${legal.vigenteDesde}. Mudanças relevantes serão informadas neste site.`],
    },
  ];
}

export function termosDeUso(p: Profile): SecaoLegal[] {
  return [
    {
      titulo: 'Sobre o conteúdo',
      paragrafos: [
        'O conteúdo deste site é informativo e educativo. Não substitui consulta, avaliação individual, diagnóstico ou tratamento.',
        'Procedimentos só são indicados após avaliação presencial. Resultados variam de pessoa para pessoa, e nenhum resultado é prometido.',
        'Cada página de procedimento informa quem o realiza e as fontes consultadas.',
      ],
    },
    {
      titulo: 'Agendamento',
      paragrafos: ['O agendamento é feito por WhatsApp, telefone ou pelo formulário opcional de contato. O horário só fica reservado depois da confirmação pela clínica.'],
    },
    {
      titulo: 'Propriedade intelectual',
      paragrafos: [`Textos, marca e elementos visuais pertencem a ${p.nomeClinica} ou são usados com autorização. Não é permitida a reprodução sem autorização.`],
    },
    {
      titulo: 'Links externos',
      paragrafos: ['Links para serviços de terceiros (WhatsApp, mapas, Google) seguem as regras desses serviços.'],
    },
    {
      titulo: 'Foro',
      paragrafos: [`Fica eleito o foro da ${legal.foro}, observados os direitos do consumidor.`],
    },
  ];
}
