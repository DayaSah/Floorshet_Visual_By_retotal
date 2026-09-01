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

type Params = Record<string, never>

export default async function (_req: { params: Params }) {
  const result = await grafana.query<FloorsheetRow>(
    'SELECT contract_id, symbol, buyer_broker, seller_broker, quantity, rate, amount, trade_time FROM floorsheet_raw ORDER BY trade_time DESC'
  )
  return result.data
}
