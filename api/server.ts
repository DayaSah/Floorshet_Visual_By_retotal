import http from 'http'
import url from 'url'
import rawHandler from './floorsheet/raw'
import statsHandler from './floorsheet/stats'
import symbolsHandler from './floorsheet/symbols'
import brokersHandler from './floorsheet/brokers'
import networkHandler from './floorsheet/network'
import timePatternsHandler from './floorsheet/time-patterns'
import tradeSizeHandler from './floorsheet/trade-size'

const routes: Record<string, any> = {
  '/api/floorsheet/raw': rawHandler,
  '/api/floorsheet/stats': statsHandler,
  '/api/floorsheet/symbols': symbolsHandler,
  '/api/floorsheet/brokers': brokersHandler,
  '/api/floorsheet/network': networkHandler,
  '/api/floorsheet/time-patterns': timePatternsHandler,
  '/api/floorsheet/trade-size': tradeSizeHandler,
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true)
  const pathname = parsedUrl.pathname || ''
  const handler = routes[pathname]

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (handler) {
    const vercelReq = Object.assign(req, { query: parsedUrl.query })
    const vercelRes = Object.assign(res, {
      status(code: number) {
        res.statusCode = code
        return this
      },
      json(data: any) {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
        return this
      },
    })
    try {
      await handler(vercelReq, vercelRes)
    } catch (err: any) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: err.message }))
    }
  } else {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Endpoint not found' }))
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`> API Server running on http://localhost:${PORT}`)
})
