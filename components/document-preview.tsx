"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Plus, Trash2, XCircle } from "lucide-react"
import type { ProposalData, SelectedItem } from "@/lib/proposal-types"
import { formatCurrency, valorExtenso, SERVICOS_DB } from "@/lib/proposal-types"
import { TEMPLATES } from "@/lib/templates"

function parseMoney(val: string): number {
  if (!val) return 0
  return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0
}

function formatMoneyRaw(val: number): string {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function safeFormatDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toLocaleDateString("pt-BR")
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year}`
}

function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-yellow-100 px-0.5 rounded-sm print:bg-transparent hover:bg-yellow-200 transition-colors cursor-text border-b border-dashed border-yellow-300 print:border-none">
      {children}
    </span>
  )
}

interface DocumentPreviewProps {
  data: ProposalData
  items: SelectedItem[]
  fotos: string[]
  zoom: number
  onUpdateItem?: (index: number, field: string, value: any) => void
}

interface CronoCell { val: string; pct: string }
interface CronoRow { id: string; refIndex?: number; itemNum: string; desc: string; totalAlvo: number; cells: CronoCell[]; isManual: boolean }

export function DocumentPreview({ data, items, fotos, onUpdateItem }: DocumentPreviewProps) {
  const totalGeralOrcamento = items.reduce((acc, i) => acc + i.qtd * i.preco, 0)
  
  const template = TEMPLATES[data.tipoProjeto] || TEMPLATES.drenagem

  const [observacoes, setObservacoes] = useState<string[]>([])
  const [condicoes, setCondicoes] = useState(template.condicoes)
  const [legendas, setLegendas] = useState<string[]>([])
  const [cols, setCols] = useState<string[]>([])
  const [rows, setRows] = useState<CronoRow[]>([])

  useEffect(() => {
    setObservacoes(template.observacoes)
    setCondicoes(template.condicoes)
    setCols(template.cronDias)
  }, [data.tipoProjeto]) 

  useEffect(() => {
    const budgetRows: CronoRow[] = items.map((item, idx) => {
        const dbService = SERVICOS_DB.find(s => s.nome === item.nome)
        // @ts-ignore
        let duration = item.customDuration || dbService?.diasExecucao || 1
        let startDayIndex = (item.customStart || 1) - 1

        if (startDayIndex < 0) startDayIndex = 0
        if (duration < 1) duration = 1
        
        const totalItem = item.qtd * item.preco
        const valPerUnit = totalItem / duration
        const pctPerUnit = 100 / duration

        const cells = Array(cols.length).fill(null).map((_, i) => {
            const isActive = i >= startDayIndex && i < (startDayIndex + duration)
            if (isActive) {
                return {
                    val: formatMoneyRaw(valPerUnit),
                    pct: pctPerUnit.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%"
                }
            }
            return { val: "", pct: "" }
        })

        return {
            id: `budget-${idx}`,
            refIndex: idx,
            itemNum: `1.${idx + 1}`,
            desc: item.nome,
            totalAlvo: totalItem,
            isManual: false,
            cells: cells
        }
    })

    setRows(prevRows => {
        const existingManuals = prevRows.filter(r => r.isManual)
        return [...budgetRows, ...existingManuals]
    })

    setLegendas(prev => {
        if (fotos.length > prev.length) return [...prev, ...Array(fotos.length - prev.length).fill("")]
        return prev
    })
  }, [items, cols.length]) 

  const footerData = useMemo(() => {
    const numCols = cols.length
    const totalPorColuna = Array(numCols).fill(0)
    let grandeTotalCronograma = 0

    rows.forEach(row => {
        row.cells.forEach((cell, idx) => { if (idx < numCols) totalPorColuna[idx] += parseMoney(cell.val) })
    })

    grandeTotalCronograma = totalPorColuna.reduce((a, b) => a + b, 0)
    let acumuladoValor = 0
    let acumuladoPct = 0

    const data = cols.map((_, idx) => {
        const val = totalPorColuna[idx]
        acumuladoValor += val
        const divisor = grandeTotalCronograma || 1
        const pctPeriodo = (val / divisor) * 100
        acumuladoPct += pctPeriodo
        return { val: val, acumuladoVal: acumuladoValor, pct: pctPeriodo, acumuladoPct: acumuladoPct }
    })
    return { colData: data, totalGeral: grandeTotalCronograma }
  }, [rows, cols])

  const updateCell = (rowIdx: number, colIdx: number, field: 'val' | 'pct', inputValue: string) => {
      const newRows = [...rows]
      const row = { ...newRows[rowIdx] }; const cell = { ...row.cells[colIdx] }

      let totalReferencia = row.totalAlvo
      if (row.isManual && totalReferencia === 0) {
          const somaAtual = row.cells.reduce((acc, c, i) => i === colIdx ? acc : acc + parseMoney(c.val), 0)
          totalReferencia = field === 'val' ? somaAtual + parseMoney(inputValue) : somaAtual 
      }

      if (field === 'val') {
          cell.val = inputValue
          const valorFloat = parseMoney(inputValue)
          if (totalReferencia > 0) {
             const pctCalc = (valorFloat / totalReferencia) * 100
             cell.pct = pctCalc.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%"
          }
      } else {
          cell.pct = inputValue
          const pctFloat = parseFloat(inputValue.replace("%", "").replace(",", ".")) || 0
          if (totalReferencia > 0) {
              cell.val = formatMoneyRaw((pctFloat / 100) * totalReferencia)
          }
      }
      newRows[rowIdx].cells[colIdx] = cell; newRows[rowIdx] = row; setRows(newRows)
  }

  const handleTotalChange = (rowIdx: number, newValStr: string) => {
    const numericValue = parseMoney(newValStr)
    const newRows = [...rows]
    newRows[rowIdx].totalAlvo = numericValue
    setRows(newRows)

    if (onUpdateItem && typeof newRows[rowIdx].refIndex === 'number' && !newRows[rowIdx].isManual) {
        const originalItem = items[newRows[rowIdx].refIndex!]
        if (originalItem && originalItem.qtd > 0) {
            onUpdateItem(newRows[rowIdx].refIndex!, 'preco', numericValue / originalItem.qtd)
        }
    }
  }

  const addCol = () => { setCols([...cols, `${cols.length + 1}`]); setRows(prev => prev.map(row => ({ ...row, cells: [...row.cells, { val: "", pct: "" }] }))) }
  const removeCol = (idx: number) => { if (cols.length <= 1) return; setCols(cols.filter((_, i) => i !== idx)); setRows(prev => prev.map(row => ({ ...row, cells: row.cells.filter((_, i) => i !== idx) }))) }
  const addRow = () => { setRows([...rows, { id: crypto.randomUUID(), itemNum: "1.x", desc: "Nova etapa...", totalAlvo: 0, cells: Array(cols.length).fill({ val: "", pct: "" }), isManual: true }]) }
  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx))
  const updateRowMeta = (rowIdx: number, field: 'itemNum' | 'desc', value: string) => { const newRows = [...rows]; newRows[rowIdx] = { ...newRows[rowIdx], [field]: value }; setRows(newRows) }
  const updateColTitle = (idx: number, val: string) => { const newCols = [...cols]; newCols[idx] = val; setCols(newCols) }
  const addObservacao = () => setObservacoes([...observacoes, "Clique para editar..."])
  const removeObservacao = (index: number) => setObservacoes(observacoes.filter((_, i) => i !== index))
  const updateObservacao = (index: number, val: string) => { const newObs = [...observacoes]; newObs[index] = val; setObservacoes(newObs) }
  const updateLegenda = (index: number, val: string) => { const novas = [...legendas]; novas[index] = val; setLegendas(novas) }

  return (
    <div className="w-full bg-slate-200 flex justify-center p-8 print:p-0 print:bg-white print:block overflow-auto print:overflow-visible">
      
      <style type="text/css">
        {`
            @media screen { 
                #preview-wrapper { 
                    background-color: white; 
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); 
                    width: 210mm;
                    min-height: 297mm;
                } 
            }
            @media print {
                #preview-wrapper { 
                    width: 100% !important; 
                    max-width: none !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    background-color: white !important;
                    box-shadow: none !important;
                }
                .print-hidden { display: none !important; }
                .avoid-break { break-inside: avoid !important; page-break-inside: avoid !important; }
            }
            
            /* --- REGRAS BLINDADAS PARA TABELAS --- */
            .print-table { border-collapse: collapse !important; }
            
            /* Garante bordas em telas e PDF, ignorando bugs de RowSpan do Chrome */
            .print-table th, .print-table td { 
                border: 1px solid black !important; 
            }
            
            .print-table tr { 
                break-inside: avoid !important; 
                page-break-inside: avoid !important; 
            }
        `}
      </style>

      <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none z-[-1]">
        <img src="/fundo_timbrado.jpg" alt="Preload" />
      </div>

      <div id="preview-wrapper" className="relative z-[10] mx-auto">
        <table className="w-full print-container font-sans text-slate-900 border-collapse relative z-[20]">
            <thead className="print:table-header-group">
                <tr>
                    <td style={{ height: '4.5cm', padding: 0, border: 'none', position: 'relative' }}>
                        <img 
                            src="/fundo_timbrado.jpg" 
                            className="hidden print:block absolute top-0 left-0 z-[-1] pointer-events-none" 
                            style={{ width: '100%', minHeight: '297mm', objectFit: 'cover' }} 
                            alt="Fundo Timbrado"
                        />
                    </td>
                </tr>
            </thead>
            
            <tfoot className="print:table-footer-group">
                <tr><td style={{ height: '3.5cm', padding: 0, border: 'none' }}></td></tr>
            </tfoot>

            <tbody>
                <tr className="border-none">
                    <td className="px-[2.5cm] align-top border-none pt-2">
                        
                        {/* --- CABEÇALHO --- */}
                        <div className="flex justify-between items-end mb-6 text-[11pt] font-bold mt-4 print:mt-0">
                            <div><span>Proposta nº. <Hl>{data.numProposta || "...."}</Hl></span></div>
                            <div className="text-right"><span className="block"><Hl>{data.local || "Guanambi"}</Hl>, {safeFormatDate(data.data)}</span></div>
                        </div>

                        {/* --- DADOS DO CLIENTE --- */}
                        <div className="mb-6 leading-snug text-[11pt]" contentEditable suppressContentEditableWarning>
                            {data.tipoCliente === 'pf' ? (
                                <>
                                    <p>Ao Sr(a). <span className="font-bold uppercase"><Hl>{data.cliente || "..."}</Hl></span></p>
                                    <p>CPF: <Hl>{data.cpf || "xxx.xxx.xxx-xx"}</Hl></p>
                                    <p>Telefone: <Hl>{data.telefone || "...."}</Hl></p>
                                    <p>Obra: <span className="uppercase"><Hl>{data.endereco || "..."}</Hl></span></p>
                                </>
                            ) : (
                                <>
                                    <p>À Empresa: <span className="font-bold uppercase"><Hl>{data.empresa || "..."}</Hl></span></p>
                                    <p>CNPJ: <Hl>{data.cnpj || "xx.xxx.xxx/xxxx-xx"}</Hl></p>
                                    <p>A.C.: <Hl>{data.ac || "..."}</Hl></p>
                                    <p>Telefone: <Hl>{data.telefone || "...."}</Hl></p>
                                    <p>Obra: <span className="uppercase"><Hl>{data.endereco || "..."}</Hl></span></p>
                                </>
                            )}
                        </div>

                        <div className="text-center mb-8 px-4">
                            <h1 className="font-bold underline uppercase text-lg leading-tight">PROPOSTA DE PREÇOS PARA <br/><span className="bg-yellow-50"><Hl>{data.nomeProjeto || template.nomeProjeto}</Hl></span></h1>
                        </div>

                        <div className="mb-6 text-sm">
                            <p>{data.tipoProjeto === 'sondagem' ? 'Prezada Senhora (ou Senhor),' : 'Prezado senhor,'}</p>
                            <p className="mt-2 text-justify indent-10">Atendendo vossa solicitação estamos enviando nossa estimativa de preço para <Hl>{data.introServico || template.introServico}</Hl>, conforme nossas condições a seguir:</p>
                        </div>

                        {/* --- SEÇÃO 1 (INSTITUCIONAL) --- */}
                        <div className="mb-6">
                            <h3 className="font-bold text-sm mb-2 text-[#006837]">1. REFORSOLO ENGENHARIA LTDA.</h3>
                            <div className="text-[10px] text-justify mb-2 indent-10">
                                A Reforsolo teve suas atividades iniciadas em abril de 2006. Seu representante legal o Engenheiro Haroldo Paranhos, tem atuado em área da Engenharia Civil, especialmente em Geotecnia e Meio Ambiente (Projetos Básicos, Projetos Executivos, Sondagens, Avaliação de Solos, Rochas, Recuperação de Áreas Degradadas, etc.), desenvolvendo os seguintes serviços:
                            </div>
                            <ul className="text-[9px] list-none pl-2 text-slate-700 space-y-1">
                                <li>1.1. Estudos Geotécnicos em geral - ensaios de campo e laboratório - em rodovias, barragens, ferrovias, etc.;</li>
                                <li>1.2. Sondagens em geral (DPL, SPT, trado, poços de inspeção, etc.);</li>
                                <li>1.3. Projeto e execução de sistemas de drenagens;</li>
                                <li>1.4. Projeto e execução de estruturas de contenção (tirantes, solo grampeado, terra armada, etc.);</li>
                                <li>1.5. Projeto e execução de sistemas de fundações (estacas escavadas, hélice contínua, tubulões, sapatas, etc.);</li>
                                <li>1.6. Projeto, execução e reforma de edificações;</li>
                                <li>1.7. Projeto e execução de recuperação de áreas degradadas;</li>
                                <li>1.8. Consultorias na área da Engenharia Civil.</li>
                            </ul>
                        </div>

                        {/* --- SEÇÃO 2 E 3 (PROPOSTA/ESCOPO E TÉCNICA) --- */}
                        <div className="mb-6">
                            <h3 className="font-bold text-sm mb-2 text-[#006837] ">
                                {data.tipoProjeto === 'drenagem' ? '2. ESCOPO DOS SERVIÇOS' : '2. PROPOSTA'}
                            </h3>
                            
                            {data.tipoProjeto === 'sondagem' && (
                                <>
                                    <div className="text-[10px] mb-4">
                                        <p className="text-justify indent-10">A proposta aqui apresentada engloba, ao solicitante, a realização de Sondagem e de acordo com as prescrições das Normas Brasileiras.</p>
                                        
                                        <p className="font-bold mt-2 mb-1">Estão incluídos nos serviços de sondagem:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>Mobilização e desmobilização do corpo técnico e equipamentos para a realização de sondagens SPT com coleta de amostras;</li>
                                            <li>Realização de Sondagem SPT de acordo com os critérios de paralisação da NBR 6484:2020;</li>
                                            <li>Registro fotográfico dos ensaios;</li>
                                            <li>Emissão de ART – CREA/DF;</li>
                                            <li>Emissão do Laudo técnico com o resultado dos dados obtidos em arquivo digital (PDF).</li>
                                        </ul>
                                    </div>

                                    <h3 className="font-bold text-sm mb-2 mt-6 text-[#006837]">3. MATERIAIS E TÉCNICA</h3>
                                    
                                    <h4 className="font-bold text-[11px] mb-1">3.1 Sondagem SPT</h4>
                                    <p className="text-[10px] text-justify mb-2 indent-10">
                                        A utilização da sondagem SPT visa caracterizar e determinar a resistência do solo, é usado o impacto de uma massa metálica de 65 Kg, denominada martelo, caindo em queda livre de 75 cm de altura sobre um ressalto situado na parte superior do hasteamento a ele conectado.
                                    </p>
                                    <p className="text-[10px] text-justify mb-1 indent-10">Ao se realizar uma sondagem pretende-se conhecer:</p>
                                    <ul className="list-[lower-alpha] pl-5 text-[10px] mb-2 space-y-1">
                                        <li>o tipo de solo atravessado pela retirada de uma amostra deformada, a cada metro perfurado;</li>
                                        <li>a resistência (N) oferecida pelo solo à cravação do amostrador padrão, a cada metro perfurado;</li>
                                        <li>a posição do nível ou dos níveis d’água, quando encontrados durante a perfuração.</li>
                                    </ul>
                                    <p className="text-[10px] text-justify mb-4 indent-10">
                                        No Brasil, o ensaio de SPT (Standard Penetration Test) é normalizado pela Associação Brasileira de Normas Técnicas por meio da NBR 6.484 de fevereiro de 2020.
                                    </p>

                                    <div className="flex flex-col items-center mb-6 break-inside-avoid">
                                        <img 
                                            src="/img/spt-foto1.png" 
                                            alt="Sondagem SPT"
                                            className="mb-1 border border-gray-300 object-cover"
                                            style={{ width: '258px', height: '456px' }}
                                        />
                                        <p className="text-[8px] font-bold">Foto 1 - Vista da realização de sondagem SPT</p>
                                    </div>

                                    <h4 className="font-bold text-[11px] mb-1 break-inside-avoid">3.2 Estratigrafia (a verdadeira economia das suas fundações).</h4>
                                    <p className="text-[10px] text-justify mb-2 indent-10">
                                        Ao invés de escolher a profundidade das estacas de fundação pela pior situação, porque não colocá-las na cota mais econômica?
                                    </p>
                                    <p className="text-[10px] text-justify mb-2 indent-10">
                                        Com os resultados obtidos na realização da sondagem SPT, podemos identificar os tipos de solo e as diferentes camadas de solo existentes no local.
                                    </p>
                                    <p className="text-[10px] text-justify mb-4 indent-10">
                                        Com o auxílio do software GEO5 é gerado um modelo estratigráfico em 3D, auxiliando de maneira decisiva o estudo das alternativas das soluções de fundações e demais problemas geotécnicos. Permitindo que o projetista visualize de maneira simples e objetiva as camadas e resistência dos solos.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-4 break-inside-avoid">
                                        <div className="flex flex-col items-center">
                                            <img src="/img/spt-perfil2d.png" alt="Perfil 2D" className="w-full h-40 object-contain border border-gray-300 mb-1 bg-white" />
                                            <p className="text-[8px] font-bold text-center">Foto 2 - Imagem ilustrativa da seção estratigráfica</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img src="/img/spt-estratigrafia3d.png" alt="Estratigrafia 3D" className="w-full h-40 object-contain border border-gray-300 mb-1 bg-white" />
                                            <p className="text-[8px] font-bold text-center">Foto 3 - Imagem ilustrativa da estratigrafia... em 3D</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {data.tipoProjeto === 'geotecnico' && (
                                <>
                                    <div className="text-[10px] mb-4">
                                        {String(data.tecnica || template.tecnica).split('\n').map((line, idx) => (
                                            line.trim() === '' ? <br key={idx} /> : <p key={idx} className="text-justify indent-10 mb-1">{line}</p>
                                        ))}
                                    </div>
                                    
                                    <div className="flex flex-col items-center gap-6 mb-6">
                                        <div className="border border-gray-200 p-2 text-center bg-gray-50 flex flex-col justify-center items-center break-inside-avoid" style={{ width: '249px', height: '191px' }}>
                                            {fotos[0] ? <img src={fotos[0]} className="w-full h-full object-contain"/> : <div className="flex-1 flex items-center text-gray-400 text-[10px]">Figura 01 - Mapa Geológico</div>}
                                            <p className="text-[10px] font-bold mt-2">Figura 01 - Mapa Geológico</p>
                                        </div>
                                        <div className="border border-gray-200 p-2 text-center bg-gray-50 flex flex-col justify-center items-center break-inside-avoid" style={{ width: '249px', height: '191px' }}>
                                            {fotos[1] ? <img src={fotos[1]} className="w-full h-full object-contain"/> : <div className="flex-1 flex items-center text-gray-400 text-[10px]">Figura 02 - Mapa Pedológico</div>}
                                            <p className="text-[10px] font-bold mt-2">Figura 02 - Mapa Pedológico</p>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-justify mb-4 indent-10">A investigação se dará por meio da retirada de amostra indeformada com Shelby (Figura 03 a 06) para realização de ensaio laboratorial de cisalhamento.</p>
                                   
                                    <div className="flex flex-col items-center gap-6 mb-6">
                                        {[3,4,5,6,7].map((n) => (
                                            <div 
                                                key={n} 
                                                className="border border-gray-200 p-2 bg-gray-50 flex flex-col items-center break-inside-avoid w-[340px] h-[256px] print:w-[454px] print:h-[342px]" 
                                            >
                                                <img 
                                                    src={`/img/geo-fig${n}.png`} 
                                                    alt={`Figura 0${n}`}
                                                    className="flex-1 w-full object-cover mb-2 border border-gray-300" 
                                                />
                                                <p className="text-[10px] font-bold">Figura 0{n}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-justify indent-10 mb-2">Os estudos a serem efetuados objetivam os seguintes itens:</p>
                                    <p className="text-[10px] font-bold mt-4">Estão incluídos nos serviços:</p>
                                    <ul className="list-disc pl-4 text-[10px] space-y-1 mt-1">
                                        {items.length > 0 ? items.map((item, i) => (<li key={i}>{item.nome}</li>)) : <li className="text-gray-400 italic">Nenhum item...</li>}
                                    </ul>
                                </>
                            )}

                            {data.tipoProjeto === 'drenagem' && (
                                <>
                                    <div className="text-[10px] text-justify indent-10 mb-2 p-1 rounded">
                                        Os serviços compreendem o desenvolvimento de projeto de drenagem e fornecimento de ART.
                                    </div>
                                    <p className="text-[10px] font-bold mt-2">Estão incluídos nos serviços de consultoria:</p>
                                    <ul contentEditable suppressContentEditableWarning className="list-none pl-2 text-[10px] space-y-1 hover:bg-slate-50 p-1 rounded">
                                        <li>I. Fornecimento de ART / CREA DF;</li>
                                        <li>II. Plantas nas escalas adequadas; (em formato digital)</li>
                                        <li>III. Cotas de referências;</li>
                                        <li>IV. Quantitativo de materiais;</li>
                                        <li>V. Laudos técnicos (em formato digital);</li>
                                    </ul>

                                    <h3 className="font-bold text-sm mb-2 mt-6 text-[#006837]">3. MATERIAIS E TÉCNICA</h3>
                                    <div className="text-[10px] hover:bg-slate-50 p-1 rounded mb-4" contentEditable suppressContentEditableWarning>
                                        {String(data.tecnica || template.tecnica).split('\n').map((line, idx) => (
                                            line.trim() === '' ? <br key={idx} /> : <p key={idx} className="text-justify indent-10 mb-1">{line}</p>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 break-inside-avoid my-4"> 
                                        {[1, 2, 3, 4, 5, 6].map((n) => (
                                            <div key={n} className="border border-gray-200 p-1 bg-gray-50 flex flex-col items-center">
                                                <img 
                                                    src={`/img/drenagem-fig${n}.png`} 
                                                    alt={`Figura 0${n}`} 
                                                    className="object-cover mb-1 border border-gray-300 bg-gray-200"
                                                    style={{ width: '200px', height: '145px' }}
                                                />
                                                <p className="text-[8px] font-bold text-center">Figura 0{n} - Descrição Padrão</p>
                                            </div>
                                        ))}
                                    </div>

                                    {fotos.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4 my-6 break-inside-avoid">
                                            {fotos.map((f, i) => (
                                                <div key={i} className="flex flex-col">
                                                    <img src={f} className="aspect-[4/3] w-full object-cover border border-gray-200 bg-gray-50"/>
                                                    <input 
                                                        className={`text-[9px] text-center mt-1 bg-transparent hover:bg-yellow-50 focus:bg-yellow-50 outline-none w-full text-slate-600 placeholder:text-gray-300 ${!legendas[i] ? 'print:hidden' : ''}`}
                                                        placeholder="Adicionar legenda..."
                                                        value={legendas[i] || ""}
                                                        onChange={(e) => updateLegenda(i, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-[10px] font-bold mt-4">Itens contratados:</p>
                                    <ul className="list-disc pl-4 text-[10px] space-y-1 mt-1">
                                        {items.length > 0 ? items.map((item, i) => (<li key={i}>{item.nome}</li>)) : <li className="text-gray-400 italic">Nenhum item...</li>}
                                    </ul>
                                </>
                            )}
                        </div>

                        {/* --- SEÇÃO DE VALORES (ORÇAMENTO E CRONOGRAMA) --- */}
                        <div className="mb-6 ">
                            <h3 className="font-bold text-sm mb-2 text-[#006837] border-t pt-4 border-gray-300">
                                {data.tipoProjeto === 'geotecnico' ? '3. VALORES' : '4. VALORES'}
                            </h3>
                            <p className="text-justify mb-4 text-xs indent-10">
                                O valor proposto para a realização dos serviços da obra em questão é de <strong className="text-[#006837] text-sm">{formatCurrency(totalGeralOrcamento)}</strong> (<span className="italic">{valorExtenso(totalGeralOrcamento)}</span>) conforme planilha abaixo:
                            </p>

                            {/* --- PLANILHA 01 - ORÇAMENTO --- */}
                            <div className="mb-6">
                                <table className="print-table w-full text-[9px] border-collapse border border-black print:border-black">
                                    <tbody className="bg-gray-200 font-bold print:bg-gray-200" style={{backgroundColor: '#e5e7eb', printColorAdjust: 'exact'}}>
                                        <tr>
                                            <th className="p-1 w-8 text-center border border-black print:border-black">ITEM</th>
                                            <th className="p-1 text-left border border-black print:border-black">DISCRIMINAÇÃO DOS SERVIÇOS </th>
                                            <th className="p-1 w-8 text-center border border-black print:border-black">UNID</th>
                                            <th className="p-1 w-8 text-center border border-black print:border-black">QTD</th>
                                            <th className="p-1 w-16 text-right border border-black print:border-black">UNIT</th>
                                            <th className="p-1 w-16 text-right border border-black print:border-black">TOTAL</th>
                                        </tr>
                                    </tbody>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-1 text-center border border-black print:border-black">1.{idx + 1}</td>
                                                <td className="p-1 border border-black print:border-black">{item.nome}</td>
                                                <td className="p-1 text-center uppercase border border-black print:border-black">{item.unidade}</td>
                                                <td className="p-1 text-center border border-black print:border-black">{item.qtd}</td>
                                                <td className="p-1 text-right border border-black print:border-black">{formatCurrency(item.preco)}</td>
                                                <td className="p-1 text-right font-bold border border-black print:border-black">{formatCurrency(item.qtd * item.preco)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tbody className="font-bold bg-yellow-100 print:bg-yellow-100" style={{backgroundColor: '#fef9c3', printColorAdjust: 'exact'}}>
                                        <tr>
                                            <td colSpan={5} className="p-1 text-right border border-black print:border-black">TOTAL</td>
                                            <td className="p-1 text-right border border-black print:border-black">{formatCurrency(totalGeralOrcamento)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* --- PLANILHA 02 - CRONOGRAMA --- */}
                            <div className="relative group/wrapper">
                                <button onClick={addRow} className="absolute -top-5 left-0 text-[9px] bg-green-100 text-green-800 px-2 rounded print-hidden opacity-0 group-hover/wrapper:opacity-100">+ Add Manual</button>
                                <button onClick={addCol} className="absolute -top-5 right-0 text-[9px] bg-blue-100 text-blue-800 px-2 rounded print-hidden opacity-0 group-hover/wrapper:opacity-100">+ Add Coluna</button>

                                <div>
                                    <table className="print-table w-full text-[8px] border-collapse table-fixed border border-black print:border-black">
                                        <tbody>
                                            <tr className="bg-gray-300 print:bg-gray-300" style={{backgroundColor: '#d1d5db', printColorAdjust: 'exact'}}>
                                                <th colSpan={2 + cols.length + 1} className="p-1 text-center font-bold text-[9px] border border-black print:border-black">CRONOGRAMA FÍSICO-FINANCEIRO</th>
                                            </tr>
                                            <tr className="bg-gray-300 print:bg-gray-300 font-bold" style={{backgroundColor: '#d1d5db', printColorAdjust: 'exact'}}>
                                                <th rowSpan={2} className="w-8 p-1 border border-black print:border-black">Item</th>
                                                <th rowSpan={2} className="p-1 border border-black print:border-black">Descrição</th>
                                                <th colSpan={cols.length} className="p-1 text-center border border-black print:border-black">Dias / Prazo</th>
                                                <th rowSpan={2} className="w-20 p-1 text-center border border-black print:border-black">TOTAL (R$)</th>
                                            </tr>
                                            <tr className="bg-white print:bg-white font-bold h-6">
                                                {cols.map((col, i) => (
                                                    <th key={i} className="text-center w-14 relative group/th bg-white border border-black print:border-black">
                                                        <input value={col} onChange={(e) => updateColTitle(i, e.target.value)} className="w-full text-center font-bold bg-transparent outline-none p-0.5"/>
                                                        {cols.length > 1 && <button onClick={() => removeCol(i)} className="absolute -top-1 -right-1 text-red-500 print-hidden opacity-0 group-hover/th:opacity-100 z-50 bg-white rounded-full"><XCircle size={10}/></button>}
                                                    </th>
                                                ))}
                                            </tr>
                                        </tbody>
                                        <tbody>
                                            {rows.map((row, rIdx) => (
                                                <tr key={row.id} className="relative group/row hover:bg-gray-50">
                                                    <td className="text-center font-bold p-0 relative border border-black print:border-black">
                                                        <input value={row.itemNum} onChange={(e) => updateRowMeta(rIdx, 'itemNum', e.target.value)} className="w-full h-full text-center bg-transparent outline-none py-4"/>
                                                        <button onClick={() => removeRow(rIdx)} className="absolute top-1 left-1 text-red-400 print-hidden opacity-0 group-hover/row:opacity-100"><Trash2 size={8}/></button>
                                                    </td>
                                                    <td className="p-1 border border-black print:border-black"><textarea rows={3} value={row.desc} onChange={(e) => updateRowMeta(rIdx, 'desc', e.target.value)} className="w-full h-full bg-transparent outline-none resize-none text-[8px] leading-tight overflow-hidden"/></td>
                                                    {row.cells.map((cell, cIdx) => (
                                                        <td key={cIdx} className="p-0 h-16 relative border border-black print:border-black">
                                                            <div className="flex flex-col h-full w-full">
                                                                <input className="h-[33%] w-full text-center outline-none bg-transparent pb-1" value={cell.val} onChange={(e) => updateCell(rIdx, cIdx, 'val', e.target.value)} />
                                                                <div className={`h-[34%] w-full border-y border-black print:border-black ${cell.val ? 'bg-green-crono print:bg-green-crono' : 'bg-transparent'}`} style={{ printColorAdjust: 'exact' }}></div>
                                                                <input className="h-[33%] w-full text-center outline-none bg-transparent pt-1 text-gray-600" value={cell.pct} onChange={(e) => updateCell(rIdx, cIdx, 'pct', e.target.value)} />
                                                            </div>
                                                        </td>
                                                    ))}
                                                    <td className="font-bold text-center bg-gray-100 print:bg-gray-100 p-0 border border-black print:border-black" style={{backgroundColor: '#f3f4f6', printColorAdjust: 'exact'}}>
                                                        <input className="w-full h-full bg-transparent text-center font-bold outline-none text-[9px]" value={formatMoneyRaw(row.totalAlvo)} onChange={(e) => handleTotalChange(rIdx, e.target.value)} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tbody className="font-bold">
                                            <tr className="bg-gray-300 print:bg-gray-300" style={{backgroundColor: '#d1d5db', printColorAdjust: 'exact'}}>
                                                <td colSpan={2} className="text-right pr-2 p-1 border border-black print:border-black">Percentual no Período</td>
                                                {footerData.colData.map((d, i) => <td key={i} className="text-center p-1 border border-black print:border-black">{d.pct > 0.01 ? d.pct.toFixed(1).replace('.', ',') + '%' : '-'}</td>)}
                                                <td className="bg-gray-400 print:bg-gray-400 border border-black print:border-black" style={{backgroundColor: '#9ca3af'}}></td>
                                            </tr>
                                            <tr className="bg-gray-300 print:bg-gray-300" style={{backgroundColor: '#d1d5db', printColorAdjust: 'exact'}}>
                                                <td colSpan={2} className="text-right pr-2 p-1 border border-black print:border-black">Valor acumulado</td>
                                                {footerData.colData.map((d, i) => <td key={i} className="text-center p-1 text-[7px] border border-black print:border-black">{d.acumuladoVal > 0 ? formatMoneyRaw(d.acumuladoVal) : '-'}</td>)}
                                                <td rowSpan={2} className="text-center align-middle font-bold text-[9px] border border-black print:border-black">{formatMoneyRaw(footerData.totalGeral)}</td>
                                            </tr>
                                            <tr className="bg-yellow-total print:bg-yellow-total" style={{backgroundColor: '#fff200', printColorAdjust: 'exact'}}>
                                                <td colSpan={2} className="text-right pr-2 p-1 border border-black print:border-black">Valor total</td>
                                                {footerData.colData.map((d, i) => <td key={i} className="text-center p-1 text-[7px] border border-black print:border-black">{d.val > 0 ? formatMoneyRaw(d.val) : '-'}</td>)}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="my-6 break-inside-avoid">
                                <div className="flex justify-between items-center mb-2 border-b border-gray-300 pb-1">
                                    <h3 className="font-bold text-xs uppercase text-[#006837]">Observações</h3>
                                    <button onClick={addObservacao} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 print-hidden"><Plus size={10} /> Add</button>
                                </div>
                                <ul className="text-[10px] space-y-1 list-none ">
                                    {observacoes.map((obs, idx) => (
                                        <li key={idx} className="relative group pl-3 flex items-start">
                                            <span className="absolute left-0 top-1.5 w-1 h-1 bg-black rounded-full "></span>
                                            <div contentEditable suppressContentEditableWarning onBlur={(e) => updateObservacao(idx, e.currentTarget.textContent || "")} className="w-full p-0.5 hover:bg-yellow-50 focus:outline-none">{obs}</div>
                                            <button onClick={() => removeObservacao(idx)} className="ml-2 text-red-400 print-hidden opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 border border-gray-300 p-3 mb-8 rounded break-inside-avoid">
                                <h3 className="font-bold text-xs uppercase mb-2 text-[#006837]">Condições Gerais</h3>
                                <div className="text-[10px] space-y-2 hover:bg-white p-1 rounded">
                                    <p>✓ <strong>CONDIÇÕES DE PAGAMENTO:</strong> {condicoes.pagamento}</p>
                                    <p>✓ <strong>PRAZO DE ENTREGA:</strong> {condicoes.prazo}</p>
                                    <p>✓ <strong>VALIDADE DA PROPOSTA:</strong> {condicoes.validade}</p>
                                </div>
                                <p className="mt-2 text-[9px] text-justify indent-10">
                                    Esta proposta foi emitida em duas vias de igual teor e mesmos efeitos para submeter
                                    a V.Sa. para análise. Caso seja aprovada V.Sa. deverá apor seu DE ACORDO, enviando os
                                    dados para faturamento e devolver-nos uma via assinada para que tenha todos os efeitos
                                    legais para celebração do contrato definitivo.
                                </p>
                            </div>

                            <div className="flex justify-between items-end px-4 mb-10 break-inside-avoid">
                                <div className="text-center flex flex-col items-center">
                                    <div className="border-b border-black w-40 mb-1"></div>
                                    <p className="font-bold text-[10px]">Haroldo Paranhos</p>
                                    <p className="text-[9px]">Engenheiro Civil, CREA 9649/D-DF</p>
                                </div>
                                <div className="text-center">
                                    <div className="border-b border-black w-40 mb-1"></div>
                                    <p className="font-bold text-[10px]">DE ACORDO</p>
                                    <p className="text-[9px]">{data.tipoCliente === 'pf' ? 'Cliente' : 'Representante Legal'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t-2 border-dashed border-gray-300 print:border-none" style={{ pageBreakBefore: "always" }}>
                            <h3 className="font-bold text-sm mb-4 border-b border-black pb-1">Relação dos principais serviços realizados</h3>
                            <div className="border border-gray-300 p-4 bg-gray-50 hover:bg-white min-h-[500px]" contentEditable suppressContentEditableWarning>
                                <div className="w-full flex items-center justify-center p-6 break-inside-avoid">
                                    <img src="/img/lista_clientes1.png" alt="Lista de Clientes" className="w-full h-auto object-contain max-h-[600px]" />
                                </div>
                                <div className="w-full flex items-center justify-center p-6 break-inside-avoid">
                                    <img src="/img/lista_clientes2.png" alt="Lista de Clientes" className="w-full h-auto object-contain max-h-[600px]" />
                                </div>
                                <div className="w-full flex items-center justify-center p-9 break-inside-avoid">
                                    <img src="/img/lista_clientes3.png" alt="Lista de Clientes" className="w-full h-auto object-contain max-h-[600px]" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <div className="w-full flex items-center justify-center p-6 break-inside-avoid">
                                <img src="/img/lista_clientes.jpg" alt="Lista de Clientes" className="w-full h-auto object-contain max-h-[770px]" />
                            </div>
                        </div>
                     
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
}