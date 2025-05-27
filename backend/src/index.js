import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analysis.route.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
