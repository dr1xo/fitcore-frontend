import { useState, type ReactNode } from 'react'
import { Alert } from './Alert'
import { Pagination } from './Pagination'
import { Spinner } from './Spinner'
import './table.css'

export interface Column<T> {
  // Si no hay render, se muestra row[key]
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  getRowKey: (row: T) => string | number
  loading?: boolean
  error?: string
  emptyMessage?: string
  pageSizeOptions?: number[]
  initialPageSize?: number
}

const DEFAULT_PAGE_SIZES = [5, 10, 20, 50]

function getCellValue<T extends object>(row: T, key: string): string {
  const value = (row as Record<string, unknown>)[key]
  return value === null || value === undefined ? '' : String(value)
}

export function DataTable<T extends object>({
  columns,
  data,
  getRowKey,
  loading = false,
  error,
  emptyMessage = 'No hay registros para mostrar.',
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  initialPageSize,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    initialPageSize ?? pageSizeOptions[0],
  )

  // Si la búsqueda reduce los datos, la página actual se ajusta sola.
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const firstIndex = (currentPage - 1) * pageSize
  const rows = data.slice(firstIndex, firstIndex + pageSize)
  const from = rows.length === 0 ? 0 : firstIndex + 1
  const to = firstIndex + rows.length

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPage(1)
  }

  function renderBody(): ReactNode {
    if (loading) {
      return (
        <tr>
          <td colSpan={columns.length} className="table__message">
            <Spinner />
          </td>
        </tr>
      )
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="table__message">
            {emptyMessage}
          </td>
        </tr>
      )
    }

    return rows.map((row) => (
      <tr key={getRowKey(row)}>
        {columns.map((column) => (
          <td key={column.key}>
            {column.render ? column.render(row) : getCellValue(row, column.key)}
          </td>
        ))}
      </tr>
    ))
  }

  if (error) {
    return <Alert type="error">{error}</Alert>
  }

  return (
    <div className="data-table">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      {!loading && (
        <div className="table-footer">
          <label className="table-footer__size">
            Registros por página
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(event.target.value)}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <span>
            Mostrando {from}–{to} de {data.length}
          </span>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
