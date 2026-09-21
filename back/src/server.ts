import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const port = Number(process.env.PORT ?? 3333)
app.listen(port, () => console.log(`API em http://localhost:${port}`))