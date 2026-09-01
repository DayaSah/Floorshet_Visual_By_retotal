import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react'
import { useGetFloorsheetRaw } from '../hooks/backend/floorsheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../lib/shadcn/table'
import { Button } from '../lib/shadcn/button'
import { Input } from '../lib/shadcn/input'
import { GlassCard } from '../components/GlassCard'
import { getBrokerLabel } from '../utils/brokerNames'
import { formatNumber, formatTradeTime } from '../utils/format'

interface FloorsheetRow {
  contract_id: string
  symbol: string
  buyer_broker: string
  seller_broker: string
  quantity: string
  rate: string
  amount: string
  trade_time: string
}

export default function Floorsheet() {
  const { data, loading, error, dataAccessErrors, trigger } = useGetFloorsheetRaw()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'trade_time', desc: true }])
  const [symbolFilter, setSymbolFilter] = useState('')
  const [brokerFilter, setBrokerFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    trigger()
  }, [])

  const filteredData = useMemo(() => {
    const rows = data ?? []
    const symbolQuery = symbolFilter.trim().toUpperCase()
    const brokerQuery = brokerFilter.trim()
    return rows.filter((row: FloorsheetRow) => {
      const matchesSymbol = symbolQuery === '' || row.symbol.toUpperCase().includes(symbolQuery)
      const matchesBroker =
        brokerQuery === '' || row.buyer_broker === brokerQuery || row.seller_broker === brokerQuery
      const tradeDate = row.trade_time.slice(0, 10)
      const matchesStart = startDate === '' || tradeDate >= startDate
      const matchesEnd = endDate === '' || tradeDate <= endDate
      return matchesSymbol && matchesBroker && matchesStart && matchesEnd
    })
  }, [data, symbolFilter, brokerFilter, startDate, endDate])

  const columns = useMemo<ColumnDef<FloorsheetRow>[]>(
    () => [
      { accessorKey: 'contract_id', header: 'Contract ID' },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'buyer_broker',
        header: 'Buyer',
        cell: ({ getValue }) => {
          const id = getValue<string>()
          return (
            <span
              className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
              title={getBrokerLabel(id)}
            >
              #{id}
            </span>
          )
        },
      },
      {
        accessorKey: 'seller_broker',
        header: 'Seller',
        cell: ({ getValue }) => {
          const id = getValue<string>()
          return (
            <span
              className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
              title={getBrokerLabel(id)}
            >
              #{id}
            </span>
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<string>())}</span>,
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue<string>())}</span>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => <span className="tabular-nums font-medium">{formatNumber(getValue<string>())}</span>,
      },
      {
        accessorKey: 'trade_time',
        header: 'Trade Time',
        cell: ({ getValue }) => (
          <span className="tabular-nums text-muted-foreground">{formatTradeTime(getValue<string>())}</span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex

  return (
    <div className="text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Floorsheet</h1>
            <p className="text-sm text-muted-foreground">
              All records from floorsheet_raw, ordered by trade time descending
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trigger(undefined, { skipCache: true })}
            disabled={loading}
            className="gap-2 transition-transform hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="p-4 mb-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            Error: {error}
          </div>
        ) : dataAccessErrors.length > 0 ? (
          <div className="p-4 mb-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            Access restricted: {dataAccessErrors.map((e) => e.message).join('; ')}
          </div>
        ) : null}

        <GlassCard className="mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="symbol-filter">
                Symbol
              </label>
              <Input
                id="symbol-filter"
                placeholder="e.g. RIDI"
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                className="w-40 bg-background/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="broker-filter">
                Broker ID
              </label>
              <Input
                id="broker-filter"
                placeholder="e.g. 58"
                value={brokerFilter}
                onChange={(e) => setBrokerFilter(e.target.value)}
                className="w-40 bg-background/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="start-date-filter">
                From date
              </label>
              <Input
                id="start-date-filter"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40 bg-background/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="end-date-filter">
                To date
              </label>
              <Input
                id="end-date-filter"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40 bg-background/60"
              />
            </div>
            {symbolFilter || brokerFilter || startDate || endDate ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSymbolFilter('')
                  setBrokerFilter('')
                  setStartDate('')
                  setEndDate('')
                }}
                className="gap-1 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </Button>
            ) : null}
          </div>
        </GlassCard>

        <div className="rounded-xl border border-border/60 bg-card shadow-retool-sm overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortDir = header.column.getIsSorted()
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                            )}
                          </button>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                    Loading floorsheet data...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="transition-colors hover:bg-accent/60">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {data ? `${filteredData.length.toLocaleString()} of ${data.length.toLocaleString()} records` : ''}
            {pageCount > 0 ? ` • Page ${pageIndex + 1} of ${pageCount}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
