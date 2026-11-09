import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { tratarErros } from './middlewares/tratar-erros.js';
const app = express();
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use(cors({ origin: corsOrigins }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRouter);
app.use(tratarErros);
const port = Number(process.env.PORT ?? 3333);
app.listen(port, () => console.log(`API em http://localhost:${port}`));
