"use client"

import React, { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Search, Plus, X, ImagePlus, Trash2, Printer, FileText, PenTool, DollarSign, User, Building2 } from "lucide-react"
import type { ProposalData, SelectedItem, ServiceItem } from "@/lib/proposal-types"
import { SERVICOS_DB, formatCurrency } from "@/lib/proposal-types"

interface EditorSidebarProps {
  data: ProposalData
  onChange: (data: ProposalData) => void
  items: SelectedItem[]
  onItemsChange: (items: SelectedItem[]) => void
  fotos: string[]
  onFotosChange: (fotos: string[]) => void
}

export function EditorSidebar({
  data,
  onChange,
  items,
  onItemsChange,
  fotos,
  onFotosChange,
}: EditorSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customDesc, setCustomDesc] = useState("")
  const [customValor, setCustomValor] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredServices = SERVICOS_DB.filter((s) =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função genérica para atualizar campos
  function handleFieldChange(field: keyof ProposalData, value: any) {
    onChange({ ...data, [field]: value })
  }

  function addService(service: ServiceItem) {
    const existing = items.find((i) => i.id === service.id)
    if (existing) {
      onItemsChange(
        items.map((i) =>
          i.id === service.id ? { ...i, qtd: i.qtd + 1 } : i
        )
      )
    } else {
      // Adiciona com padrões iniciais (customStart 1, customDuration padrão do DB ou 1)
      onItemsChange([...items, { 
          ...service, 
          qtd: 1, 
          customStart: service.diaInicioPadrao || 1, 
          customDuration: service.diasExecucao || 1
      }])
    }
  }

  function addCustomItem() {
    const val = parseFloat(customValor)
    if (customDesc && !isNaN(val) && val > 0) {
      const newItem: SelectedItem = {
        id: Date.now(), 
        nome: customDesc,
        unidade: "vb",
        preco: val,
        diasExecucao: 1,
        qtd: 1,
        customStart: 1,
        customDuration: 1
      }
      onItemsChange([...items, newItem])
      setCustomDesc("")
      setCustomValor("")
    }
  }

  function removeItem(index: number) {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  // Atualiza QTD, Preço, Start ou Duration
  function updateItem(
    index: number,
    field: "qtd" | "preco" | "customStart" | "customDuration",
    value: string
  ) {
    const newItems = [...items]
    const num = parseFloat(value)
    if (!isNaN(num)) {
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: num }
        onItemsChange(newItems)
    }
  }

  function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newFotos: string[] = []
      let loaded = 0
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            newFotos.push(ev.target.result as string)
          }
          loaded++
          if (loaded === files.length) {
            onFotosChange([...fotos, ...newFotos])
          }
        }
        reader.readAsDataURL(file)
      })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <aside className="w-80 flex-shrink-0 h-screen flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 no-print">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
        <div className="w-3 h-3 rounded-full bg-[#006837]" />
        <h1 className="text-sm font-bold tracking-wide flex-1">
          Reforsolo Editor v9.0
        </h1>
        <Button
          size="sm"
          onClick={() => window.print()}
          variant="ghost"
          className="h-7 px-2 text-[10px] hover:bg-slate-800 text-slate-300"
        >
          <Printer className="h-3 w-3 mr-1" />
          Imprimir
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion
            type="multiple"
            defaultValue={["dados", "orcamento"]} // Orçamento aberto por padrão para facilitar
            className="space-y-2"
          >
            {/* 1. Dados Principais */}
            <AccordionItem value="dados" className="border border-slate-700 bg-slate-800/50 rounded px-2">
              <AccordionTrigger className="text-xs font-semibold text-green-400 hover:no-underline py-2">
                <span className="flex items-center gap-2"><FileText size={14}/> 1. Dados Principais</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                
                {/* SELETOR TIPO DE CLIENTE */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={() => handleFieldChange("tipoCliente", "pf")}
                        className={`flex items-center justify-center gap-2 text-[10px] py-1.5 rounded border transition-all ${
                            data.tipoCliente === 'pf' 
                            ? 'bg-green-700/30 border-green-600 text-green-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <User size={12} /> Pessoa Física
                    </button>
                    <button
                        onClick={() => handleFieldChange("tipoCliente", "pj")}
                        className={`flex items-center justify-center gap-2 text-[10px] py-1.5 rounded border transition-all ${
                            data.tipoCliente === 'pj' 
                            ? 'bg-blue-700/30 border-blue-600 text-blue-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <Building2 size={12} /> Empresa
                    </button>
                </div>

                <div className="space-y-1">
                  <Input placeholder="Nº da Proposta" value={data.numProposta} onChange={(e) => handleFieldChange("numProposta", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-1">
                   <Label className="text-[10px] text-slate-400">Data</Label>
                   <Input type="date" value={data.data} onChange={(e) => handleFieldChange("data", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                
                {/* CAMPOS CONDICIONAIS */}
                {data.tipoCliente === 'pf' ? (
                    <div className="space-y-1">
                        <Input placeholder="Nome do Cliente" value={data.cliente} onChange={(e) => handleFieldChange("cliente", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <Input placeholder="Razão Social / Empresa" value={data.empresa || ''} onChange={(e) => handleFieldChange("empresa", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-1">
                            <Input placeholder="CNPJ" value={data.cnpj || ''} onChange={(e) => handleFieldChange("cnpj", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                        </div>
                        <div className="space-y-1">
                            <Input placeholder="A.C. (Aos Cuidados)" value={data.ac || ''} onChange={(e) => handleFieldChange("ac", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                        </div>
                    </>
                )}

                <div className="space-y-1">
                  <Input placeholder="Telefone" value={data.telefone} onChange={(e) => handleFieldChange("telefone", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-1">
                  <Input placeholder="Local (Ex: Brasília - DF)" value={data.local} onChange={(e) => handleFieldChange("local", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-1">
                  <Input placeholder="Endereço / Obra" value={data.endereco} onChange={(e) => handleFieldChange("endereco", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-1">
                  <Input placeholder="Nome do Projeto" value={data.nomeProjeto} onChange={(e) => handleFieldChange("nomeProjeto", e.target.value)} className="h-7 text-xs bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-1">
                  <Textarea placeholder="Intro do Serviço" value={data.introServico} onChange={(e) => handleFieldChange("introServico", e.target.value)} className="text-xs min-h-[60px] bg-slate-900 border-slate-700" />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Materiais e Tecnica */}
            <AccordionItem value="tecnica" className="border border-slate-700 bg-slate-800/50 rounded px-2">
              <AccordionTrigger className="text-xs font-semibold text-green-400 hover:no-underline py-2">
                 <span className="flex items-center gap-2"><PenTool size={14}/> 2. Materiais e Técnica</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <Textarea
                  value={data.tecnica}
                  onChange={(e) => handleFieldChange("tecnica", e.target.value)}
                  className="text-xs min-h-[80px] bg-slate-900 border-slate-700"
                  placeholder="Descrição da técnica..."
                />

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Fotos de vistoria ({fotos.length})
                  </Label>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFotoUpload} className="hidden" />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} className="h-7 text-[10px] flex-1 bg-slate-700 hover:bg-slate-600">
                      <ImagePlus className="h-3 w-3 mr-1" /> Adicionar
                    </Button>
                    {fotos.length > 0 && (
                      <Button size="sm" variant="destructive" onClick={() => onFotosChange([])} className="h-7 text-[10px]">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Orçamento */}
            <AccordionItem value="orcamento" className="border border-slate-700 bg-slate-800/50 rounded px-2">
              <AccordionTrigger className="text-xs font-semibold text-green-400 hover:no-underline py-2">
                <span className="flex items-center gap-2"><DollarSign size={14}/> 3. Orçamento</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-7 text-xs pl-7 bg-slate-900 border-slate-700"
                    placeholder="Buscar serviço..."
                  />
                </div>

                <div className="space-y-0.5 max-h-40 overflow-y-auto rounded border border-slate-700 bg-slate-900">
                  {filteredServices.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => addService(service)}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-green-900/30 hover:text-green-400 flex items-start justify-between transition-colors group gap-2"
                    >
                      <span className="flex-1 leading-tight line-clamp-2" title={service.nome}>{service.nome}</span>
                      <Plus className="h-3 w-3 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Item personalizado
                  </Label>
                  <Input
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="h-7 text-xs bg-slate-900 border-slate-700"
                    placeholder="Descrição do item"
                  />
                  <div className="flex gap-1.5">
                    <Input
                      value={customValor}
                      onChange={(e) => setCustomValor(e.target.value)}
                      className="h-7 text-xs bg-slate-900 border-slate-700"
                      placeholder="Valor (R$)"
                      type="number"
                    />
                    <Button size="sm" onClick={addCustomItem} className="h-7 px-2 bg-green-700 hover:bg-green-600">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Itens selecionados
                    </Label>
                    
                    {/* LISTA DE ITENS SELECIONADOS COM CAMPOS DE CRONOGRAMA */}
                    {items.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="bg-slate-900 rounded p-2 border border-slate-700 hover:border-slate-500 transition-colors">
                        
                        {/* Linha 1: Nome e Excluir */}
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <span className="text-[10px] flex-1 font-medium text-slate-200 leading-tight line-clamp-3" title={item.nome}>
                            {item.nome}
                          </span>
                          <button type="button" onClick={() => removeItem(idx)} className="text-slate-500 hover:text-red-400 shrink-0 mt-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Linha 2: QTD e Preço */}
                        <div className="flex gap-2 mb-2">
                          <div className="flex items-center bg-slate-800 rounded px-1 border border-slate-700 w-1/3">
                             <span className="text-[8px] text-slate-500 mr-1">QTD</span>
                             <Input type="number" value={item.qtd} onChange={(e) => updateItem(idx, "qtd", e.target.value)} className="h-5 text-[10px] w-full bg-transparent border-none p-0 text-center focus-visible:ring-0" min={1} />
                          </div>
                          <div className="flex items-center bg-slate-800 rounded px-1 border border-slate-700 flex-1">
                             <span className="text-[8px] text-slate-500 mr-1">R$</span>
                             <Input type="number" value={item.preco} onChange={(e) => updateItem(idx, "preco", e.target.value)} className="h-5 text-[10px] w-full bg-transparent border-none p-0 focus-visible:ring-0" />
                          </div>
                        </div>

                        {/* Linha 3: Início e Duração (Cronograma) */}
                        <div className="flex gap-2 border-t border-slate-800 pt-2 mb-1">
                            <div className="flex items-center bg-slate-950/50 rounded px-1 border border-slate-800 flex-1" title="Dia de início no cronograma">
                                <span className="text-[8px] text-blue-400 mr-1">INÍCIO</span>
                                <Input 
                                    type="number" 
                                    value={item.customStart || 1} 
                                    onChange={(e) => updateItem(idx, "customStart", e.target.value)} 
                                    className="h-5 text-[10px] w-full bg-transparent border-none p-0 text-center focus-visible:ring-0 text-blue-200" 
                                    min={1}
                                />
                            </div>
                            <div className="flex items-center bg-slate-950/50 rounded px-1 border border-slate-800 flex-1" title="Duração em dias">
                                <span className="text-[8px] text-blue-400 mr-1">DIAS</span>
                                <Input 
                                    type="number" 
                                    value={item.customDuration || item.diasExecucao || 1} 
                                    onChange={(e) => updateItem(idx, "customDuration", e.target.value)} 
                                    className="h-5 text-[10px] w-full bg-transparent border-none p-0 text-center focus-visible:ring-0 text-blue-200" 
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="text-right text-[10px] text-green-500 font-bold">
                            Total: {formatCurrency(item.qtd * item.preco)}
                        </div>
                      </div>
                    ))}

                    <div className="text-center text-xs font-bold text-green-400 pt-1 border-t border-slate-700 mt-2">
                      Total Geral: {formatCurrency(items.reduce((acc, i) => acc + i.qtd * i.preco, 0))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </aside>
  )
}