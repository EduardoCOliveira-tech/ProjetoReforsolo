"use client"

import { useState } from "react"
import { EditorSidebar } from "@/components/editor-sidebar"
import { DocumentPreview } from "@/components/document-preview"
import type { ProposalData, SelectedItem, ProjectType } from "@/lib/proposal-types"
import { ZoomControls } from "@/components/zoom-controls"
import { TEMPLATES } from "@/lib/templates"

function getTodayISO() {
  const d = new Date()
  return d.toISOString().split("T")[0]
}

export default function Page() {
  const [view, setView] = useState<'landing' | 'editor'>('landing')

  const [data, setData] = useState<ProposalData>({
    tipoProjeto: "drenagem",
    tipoCliente: "pf",
    numProposta: "",
    data: getTodayISO(),
    local: "Brasília",
    telefone: "",
    endereco: "",
    cliente: "",
    empresa: "",
    cnpj: "",
    ac: "",
    nomeProjeto: "",
    introServico: "",
    tecnica: "",
    cronDias: [],
  })

  const [items, setItems] = useState<SelectedItem[]>([])
  const [fotos, setFotos] = useState<string[]>([])
  const [zoom, setZoom] = useState(0.65)

  // Inicia o projeto com os dados do Template escolhido
  const startProject = (type: ProjectType) => {
    const template = TEMPLATES[type]
    
    setData(prev => ({
        ...prev,
        tipoProjeto: type,
        nomeProjeto: template.nomeProjeto,
        introServico: template.introServico,
        tecnica: template.tecnica,
        cronDias: template.cronDias
    }))
    
    setView('editor')
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // --- TELA DE SELEÇÃO INICIAL (LANDING) ---
 if (view === 'landing') {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-5xl w-full text-center border border-slate-700">
                <div className="mb-10">
                    <div className="h-16 w-16 bg-[#006837] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-900/50">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">Gerador de Propostas Reforsolo</h1>
                    <p className="text-slate-400">Selecione o tipo de projeto para iniciar uma nova proposta técnica.</p>
                </div>

                {/* Alterado para 3 colunas (md:grid-cols-3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button onClick={() => startProject('drenagem')} className="group relative p-8 border-2 border-slate-700 bg-slate-800/50 rounded-2xl hover:border-blue-500 hover:bg-slate-800 transition-all text-left flex flex-col items-center duration-300">
                        <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h3 className="font-bold text-xl text-slate-200 mb-2 group-hover:text-white">Drenagem</h3>
                        <p className="text-sm text-slate-400 text-center leading-relaxed">Projetos de drenagem com cronogramas automáticos.</p>
                    </button>

                    <button onClick={() => startProject('geotecnico')} className="group relative p-8 border-2 border-slate-700 bg-slate-800/50 rounded-2xl hover:border-emerald-500 hover:bg-slate-800 transition-all text-left flex flex-col items-center duration-300">
                        <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="font-bold text-xl text-slate-200 mb-2 group-hover:text-white">Geotecnia</h3>
                        <p className="text-sm text-slate-400 text-center leading-relaxed">Ensaios de campo, mapas geológicos, pedológicos e laudos completos.</p>
                    </button>

                    {/* NOVO: BOTÃO SONDAGEM SPT */}
                    <button onClick={() => startProject('sondagem')} className="group relative p-8 border-2 border-slate-700 bg-slate-800/50 rounded-2xl hover:border-amber-500 hover:bg-slate-800 transition-all text-left flex flex-col items-center duration-300">
                        <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="font-bold text-xl text-slate-200 mb-2 group-hover:text-white">Sondagem SPT</h3>
                        <p className="text-sm text-slate-400 text-center leading-relaxed">Perfuração, ensaios NBR 6484:2020 e modelagem estratigráfica.</p>
                    </button>
                </div>
            </div>
        </div>
    )
  }

  // --- TELA DO EDITOR ---
  return (
    // ADICIONADO: Classes 'print:' para resetar o layout fixo na hora da impressão
    <div className="flex h-screen bg-slate-950 overflow-hidden print:overflow-visible print:h-auto print:block print:bg-white">
      
      {/* Wrapper da Sidebar com 'print:hidden' para garantir que suma */}
      <div className="h-full print:hidden">
        <EditorSidebar
            data={data}
            onChange={setData}
            items={items}
            onItemsChange={setItems}
            fotos={fotos}
            onFotosChange={setFotos}
        />
      </div>

      {/* Main ajustado: remove overflow na impressão e reseta margens */}
      <main className="flex-1 overflow-auto relative bg-slate-900/50 flex flex-col items-center print:overflow-visible print:h-auto print:block print:bg-white print:m-0 print:p-0">
        
        {/* Botão Voltar (Escondido na impressão) */}
        <div className="absolute top-4 left-4 z-50 print:hidden">
             <button 
                onClick={() => setView('landing')} 
                className="bg-slate-800 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all flex items-center gap-2"
             >
                ← Voltar
             </button>
         </div>

        {/* Wrapper do Documento (Ajustado para não ter padding na impressão) */}
        <div className="py-6 px-4 flex justify-center w-full print:p-0 print:block">
          <DocumentPreview
            data={data}
            items={items}
            fotos={fotos}
            zoom={zoom}
            onUpdateItem={updateItem}
          />
        </div>

        {/* Zoom (Escondido na impressão) */}
        <div className="print:hidden">
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>
      </main>
    </div>
  )
}