// lib/proposal-types.ts

export type ClientType = "pf" | "pj"
export type ProjectType = "drenagem" | "geotecnico" | "sondagem"

export interface ServiceItem {
  id: number
  nome: string
  unidade: string
  preco: number
  diasExecucao?: number
  diaInicioPadrao?: number
}

export interface SelectedItem extends ServiceItem {
  qtd: number
  customDuration?: number // Duração personalizada em dias (colunas)
  customStart?: number    // Dia de início (1 = 1ª coluna, 2 = 2ª coluna...)
}

export interface ProposalData {
  // Configuração
  tipoProjeto: ProjectType
  tipoCliente: ClientType
  numProposta: string
  data: string
  local: string
  telefone: string
  endereco: string // Obra
  nomeProjeto: string
  cliente: string // Nome
  empresa: string
  cnpj: string
  ac: string // Aos cuidados de
  introServico: string
  tecnica: string
  cronDias: string[]
}

export const SERVICOS_DB: ServiceItem[] = [
  { 
    id: 1, 
    nome: "Mobilização/desmobilização de equipe técnica e equipamentos para avaliação das interferências, análise dos documentos e projetos existentes, execução dos ensaios para realização dos estudos, avaliações das interferência e reuniões com cliente.", 
    unidade: "vb", 
    preco: 2400.0, 
    diasExecucao: 2, 
    diaInicioPadrao: 1 
  },
  { 
    id: 2, 
    nome: 'Ensaio de infiltração "in situ" para determinação do coeficiente de permeabilidade do solo (k).', 
    unidade: "un", 
    preco: 950.0, 
    diasExecucao: 5, 
    diaInicioPadrao: 3 
  },
  { 
    id: 3, 
    nome: "Desenvolvimento de projeto de drenagem provisório para rebaixamento do nível d'água do lençol freático para execução das fundações.", 
    unidade: "un", 
    preco: 10250.0, 
    diasExecucao: 5, 
    diaInicioPadrao: 3 
  },
  { 
    id: 4, 
    nome: "Desenvolvimento de projeto de drenagem definitiva profunda, trincheiras drenantes e colchão drenante. Dimensionamento dos reservatórios de drenagem e sistema de bombeamento.", 
    unidade: "un", 
    preco: 14200.0, 
    diasExecucao: 7, 
    diaInicioPadrao: 1 
  },
  { 
    id: 5, 
    nome: "Fornecimento ART - Anotação de Responsabilidade Técnica.", 
    unidade: "un", 
    preco: 290.0, 
    diasExecucao: 1, 
    diaInicioPadrao: 7 
  },
  { 
    id: 6, 
    nome: "Sondagem SPT", 
    unidade: "m", 
    preco: 120.0, 
    diasExecucao: 3,
    diaInicioPadrao: 1
  },

  // --- NOVOS SERVIÇOS: GEOTECNIA (SOLOS MOLES) ---
  {
    id: 7,
    nome: "Mobilização de equipe técnica especializada e recursos necessários para execução dos serviços de coleta de amostras de solos moles, incluindo logística, equipamentos auxiliares e preparação operacional para execução segura e adequada das atividades.",
    unidade: "vb",
    preco: 1800.0,
    diasExecucao: 2, // Preenche "1 a 5" e "6 a 10"
    diaInicioPadrao: 1
  },
  {
    id: 8,
    nome: "Planejamento técnico da campanha de investigação geotécnica, incluindo análise prévia das condições geológico-geotécnicas da área, embasados em relatórios anteriores, definição dos pontos de amostragem em solos moles, avaliação da representatividade estratigráfica e estabelecimento dos procedimentos técnicos a serem adotados em campo e laboratório.",
    unidade: "un",
    preco: 1000.0,
    diasExecucao: 1, // Preenche "1 a 5"
    diaInicioPadrao: 1
  },
  {
    id: 9,
    nome: "Execução de coleta de amostra indeformada de solo mole, considerando as particularidades estratigráficas locais, com foco na obtenção de material representativo para ensaios de resistência ao cisalhamento em laboratório. Abertura do pré-furo/cava, por conta do cliente!",
    unidade: "un",
    preco: 1250.0,
    diasExecucao: 2, // Preenche "1 a 5" e "6 a 10"
    diaInicioPadrao: 1
  },
  {
    id: 10,
    nome: "Identificação, selagem, acondicionamento e transporte técnico das amostras coletadas, adotando procedimentos destinados à minimização de distúrbios mecânicos, variações de umidade e degradação estrutural até a etapa de ensaios laboratoriais.",
    unidade: "un",
    preco: 400.0,
    diasExecucao: 2, // Preenche "1 a 5" e "6 a 10"
    diaInicioPadrao: 1
  },
  {
    id: 11,
    nome: "Preparação criteriosa das amostras em laboratório para ensaio na condição natural e saturada, incluindo procedimentos de saturação controlada, incluindo regularização geométrica, controle dimensional e verificação das condições físicas do material, respeitando suas características originais. Execução de ensaio de cisalhamento direto em amostra de solo mole na condição natural, com aplicação de diferentes níveis de tensão normal, visando à determinação dos parâmetros de resistência ao cisalhamento (coesão aparente e ângulo de atrito interno).",
    unidade: "un",
    preco: 250.0,
    diasExecucao: 2, // Preenche "6 a 10" e "11 a 15"
    diaInicioPadrao: 2 // Começa na coluna 2
  },
  {
    id: 12,
    nome: "Execução do ensaio de determinação do limite de liquidez e plasticidade, com avaliação do comportamento reológico do solo em diferentes estados de consistência, permitindo a identificação da sensibilidade do material à variação do teor de umidade e obtenção de parâmetros fundamentais para classificação e análise do comportamento mecânico de solos finos e moles.",
    unidade: "un",
    preco: 340.0,
    diasExecucao: 3, // Preenche "6 a 10", "11 a 15", "16 a 20"
    diaInicioPadrao: 2
  },
  {
    id: 13,
    nome: "Execução de análise granulométrica completa, incluindo peneiramento para frações grossas e ensaio de sedimentação para frações finas, possibilitando a determinação da distribuição granulométrica e da predominância de partículas argilosas e silto-argilosas.",
    unidade: "un",
    preco: 300.0,
    diasExecucao: 3, // Preenche "6 a 10", "11 a 15", "16 a 20"
    diaInicioPadrao: 2
  },
  {
    id: 14,
    nome: "Execução de ensaio de cisalhamento direto em amostra de solo mole nas condições natural e saturadas, permitindo a avaliação do comportamento mecânico do solo sob condições desfavoráveis de drenagem e carregamento.",
    unidade: "un",
    preco: 3500.0,
    diasExecucao: 4, // Preenche "6 a 10", "11 a 15", "16 a 20", "21 a 25"
    diaInicioPadrao: 2
  },
  {
    id: 15,
    nome: "Elaboração de relatório técnico geotécnico conclusivo, contendo descrição da metodologia adotada, procedimentos de campo e laboratório, apresentação dos resultados, interpretação técnica, conclusões e recomendações aplicáveis a projetos e análises de engenharia.",
    unidade: "un",
    preco: 3500.0,
    diasExecucao: 3, // Preenche "11 a 15", "16 a 20", "21 a 25"
    diaInicioPadrao: 3 // Começa na coluna 3
  },
  {
    id: 16,
    nome: "EMISSÃO DE ART - CREA/DF.",
    unidade: "vb",
    preco: 290.0,
    diasExecucao: 1, // Preenche "21 a 25"
    diaInicioPadrao: 5 // Começa na coluna 5
  },

  // --- NOVOS SERVIÇOS: SONDAGEM SPT ESPECÍFICO ---
  {
    id: 17,
    nome: "Mobilização e desmobilização do corpo técnico e equipamentos para a realização de sondagens SPT com coleta de amostras.",
    unidade: "vb",
    preco: 4300.0,
    diasExecucao: 1, 
    diaInicioPadrao: 1
  },
  {
    id: 18,
    nome: "Realização de Sondagem SPT e laudo técnico com os resultados obtidos - NBR 6484:2020.",
    unidade: "un",
    preco: 1000.0,
    diasExecucao: 4, 
    diaInicioPadrao: 1
  },
  {
    id: 19,
    nome: "Emissão de ART - CREA/GO",
    unidade: "vb",
    preco: 290.0,
    diasExecucao: 1,
    diaInicioPadrao: 5
  }
]

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ... mantenha as funções valorExtenso e formatDate como estão ...
export function valorExtenso(v: number): string {
    // (Mantenha o código original aqui para economizar espaço)
    if (v === 0) return "zero reais"
    const inteiro = Math.floor(v)
    const centavos = Math.round((v - inteiro) * 100)
  
    const unidades = [
      "", "um", "dois", "três", "quatro", "cinco",
      "seis", "sete", "oito", "nove", "dez",
      "onze", "doze", "treze", "quatorze", "quinze",
      "dezesseis", "dezessete", "dezoito", "dezenove",
    ]
    const dezenas = [
      "", "", "vinte", "trinta", "quarenta", "cinquenta",
      "sessenta", "setenta", "oitenta", "noventa",
    ]
    const centenas = [
      "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
      "seiscentos", "setecentos", "oitocentos", "novecentos",
    ]
  
    function porExtenso(n: number): string {
      if (n === 0) return ""
      if (n === 100) return "cem"
      if (n < 20) return unidades[n]
      if (n < 100) {
        const d = Math.floor(n / 10)
        const u = n % 10
        return u === 0 ? dezenas[d] : `${dezenas[d]} e ${unidades[u]}`
      }
      if (n < 1000) {
        const c = Math.floor(n / 100)
        const resto = n % 100
        return resto === 0 ? (n === 100 ? "cem" : centenas[c]) : `${centenas[c]} e ${porExtenso(resto)}`
      }
      if (n < 1000000) {
        const milhares = Math.floor(n / 1000)
        const resto = n % 1000
        const milStr = milhares === 1 ? "mil" : `${porExtenso(milhares)} mil`
        return resto === 0 ? milStr : `${milStr} e ${porExtenso(resto)}`
      }
      return `${n}`
    }
  
    let resultado = ""
    if (inteiro > 0) {
      resultado = `${porExtenso(inteiro)} ${inteiro === 1 ? "real" : "reais"}`
    }
    if (centavos > 0) {
      const centStr = `${porExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`
      resultado = resultado ? `${resultado} e ${centStr}` : centStr
    }
    return resultado
  }
  
  export function formatDate(dateStr: string): string {
    if (!dateStr) return "..."
    const [ano, mes, dia] = dateStr.split("-")
    return `${dia}/${mes}/${ano}`
  }