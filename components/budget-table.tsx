"use client"

import type { SelectedItem } from "@/lib/proposal-types"
import { formatCurrency } from "@/lib/proposal-types"

interface BudgetTableProps {
  items: SelectedItem[]
  total: number
}

export function BudgetTable({ items, total }: BudgetTableProps) {
  return (
    <table className="budget-table">
      <thead>
        <tr>
          <th>ITEM</th>
          <th>DISCRIMINACAO</th>
          <th>UNID</th>
          <th>QTD</th>
          <th>UNIT</th>
          <th>TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-gray-400 py-4 text-[9pt]">
              Nenhum item adicionado
            </td>
          </tr>
        ) : (
          items.map((item, idx) => {
            const subtotal = item.qtd * item.preco
            return (
              <tr key={`${item.nome}-${idx}`}>
                <td>{`1.${idx + 1}`}</td>
                <td className="text-left">{item.nome}</td>
                <td>{item.unidade}</td>
                <td>{item.qtd}</td>
                <td>{formatCurrency(item.preco)}</td>
                <td>{formatCurrency(subtotal)}</td>
              </tr>
            )
          })
        )}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5} className="text-right font-bold">
            VALOR TOTAL DOS ITENS
          </td>
          <td className="font-bold">{formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
