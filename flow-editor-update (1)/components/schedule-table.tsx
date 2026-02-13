"use client"

import type { SelectedItem } from "@/lib/proposal-types"
import { formatCurrency } from "@/lib/proposal-types"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"

interface ScheduleTableProps {
  items: SelectedItem[]
  cronDias: string[]
  // Função opcional para atualizar itens se você quiser editar valores nesta tabela
  onUpdateItem?: (index: number, field: string, value: any) => void
}

export function ScheduleTable({ items, cronDias, onUpdateItem }: ScheduleTableProps) {
  // Total Geral de todos os serviços
  const grandTotal = items.reduce((acc, item) => acc + (item.qtd * item.preco), 0)

  // Array auxiliar para somar as colunas (os dias)
  const columnSums = new Array(cronDias.length).fill(0)
  const columnPercs = new Array(cronDias.length).fill(0)

  // Calcular as distribuições antes de renderizar
  const rows = items.map((item) => {
    const totalItem = item.qtd * item.preco
    // Pega os dias definidos no DB ou assume 1 se não tiver
    // Se o diasExecucao for maior que o numero de colunas, limita ao numero de colunas
    const duration = Math.min(item.diasExecucao || 1, cronDias.length)
    
    const valuePerDay = totalItem / duration
    const percPerDay = 100 / duration // Porcentagem do item concluída por dia

    // Array de valores para cada coluna desta linha
    const cells = cronDias.map((_, i) => {
      if (i < duration) {
        return { 
          value: valuePerDay, 
          perc: percPerDay,
          active: true 
        }
      }
      return { value: 0, perc: 0, active: false }
    })

    return { item, totalItem, cells }
  })

  // Calcular totais das colunas para o rodapé
  rows.forEach(row => {
    row.cells.forEach((cell, i) => {
      if (cell.active) {
        columnSums[i] += cell.value
      }
    })
  })

  // Calcular porcentagem acumulada financeira (Cronograma Financeiro)
  let accumulatedValue = 0
  const accumulatedRow = columnSums.map(val => {
    accumulatedValue += val
    return accumulatedValue
  })

  // Handle edit do valor total
  const handleTotalChange = (index: number, newTotalStr: string) => {
    if (!onUpdateItem) return
    
    // Remove formatação para pegar o numero
    const numericValue = parseFloat(newTotalStr.replace(/[^0-9,.]/g, '').replace(',', '.'))
    
    if (!isNaN(numericValue) && items[index]) {
      // Se mudar o total, mudamos o preço unitário (assumindo QTD fixa ou recalcula preco)
      const newPrice = numericValue / items[index].qtd
      onUpdateItem(index, 'preco', newPrice)
    }
  }

  return (
    <div className="w-full overflow-auto">
    <table className="cron-table w-full border-collapse border border-gray-400 text-[10px]">
      <thead>
        <tr>
          <th className="bg-gray-300 border border-gray-400 p-1 w-10" rowSpan={2}>Item</th>
          <th className="bg-gray-300 border border-gray-400 p-1 w-64" rowSpan={2}>Descrição</th>
          <th className="bg-gray-300 border border-gray-400 p-1" colSpan={cronDias.length}>
            Dias (Cronograma Físico)
          </th>
          <th className="bg-gray-300 border border-gray-400 p-1 w-24" rowSpan={2}>TOTAL (R$)</th>
        </tr>
        <tr>
          {cronDias.map((dia, i) => (
            <th key={i} className="bg-gray-300 border border-gray-400 p-1 text-center">
              {dia}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={cronDias.length + 3} className="text-center py-4 text-gray-500">
              Nenhum item adicionado ao orçamento.
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={`${row.item.id}-${idx}`}>
              <td className="border border-gray-400 text-center">{`1.${idx + 1}`}</td>
              <td className="border border-gray-400 px-1 text-left">
                {row.item.nome}
              </td>
              {/* Renderiza as células de dias */}
              {row.cells.map((cell, i) => (
                <td key={i} className={`border border-gray-400 p-0 h-full relative ${cell.active ? 'bg-green-200' : ''}`}>
                  {cell.active && (
                    <div className="flex flex-col items-center justify-center text-[7px] leading-tight h-full py-1">
                      <span className="font-semibold">
                        {cell.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-gray-600">
                        {Math.round(cell.perc)}%
                      </span>
                    </div>
                  )}
                </td>
              ))}
              
              {/* Célula de Total Editável */}
              <td className="border border-gray-400 p-0">
                {onUpdateItem ? (
                    <input 
                        type="text" // Usando text para facilitar formatação se quiser
                        className="w-full h-full text-center bg-transparent outline-none text-[10px]"
                        value={row.totalItem.toFixed(2)}
                        onChange={(e) => handleTotalChange(idx, e.target.value)}
                        onBlur={(e) => {
                             // Opcional: formatação ao sair do campo
                        }}
                    />
                ) : (
                    <div className="text-center">
                        {row.totalItem.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        {/* Linha de Percentual por coluna (baseado no total acumulado até o momento vs Total Geral) */}
        <tr>
          <td colSpan={2} className="font-bold text-right px-2 border border-gray-400">
            Percentual Acumulado
          </td>
          {accumulatedRow.map((accVal, i) => {
            const perc = grandTotal > 0 ? (accVal / grandTotal) * 100 : 0
            return (
                <td key={i} className="bg-yellow-100 font-bold border border-gray-400 text-center">
                {perc.toFixed(1)}%
                </td>
            )
          })}
          <td className="bg-gray-400 text-white font-bold text-center border border-gray-400">100%</td>
        </tr>
        
        {/* Linha de Valores Acumulados */}
        <tr>
          <td colSpan={2} className="font-bold text-right px-2 border border-gray-400">
            Valor Acumulado
          </td>
          {accumulatedRow.map((val, i) => (
            <td key={i} className="text-center text-[8pt] border border-gray-400">
              {val > 0
                ? val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 0 })
                : "-"}
            </td>
          ))}
          <td className="font-bold text-center border border-gray-400">
            {grandTotal.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}
          </td>
        </tr>
      </tfoot>
    </table>
    </div>
  )
}