// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from "openai";

import { fetchRepoFiles } from './utils/fetchRepoFiles.js';
import { analyzeProject } from './utils/analyzeProject.js';
import { createFallbackAnalysis } from './utils/fallbackAnalysis.js';
import { calculateScore } from './utils/calculateScore.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


app.post("/api/analyze", async (req, res) => {
    try {
        const { repositories } = req.body;
        if (!repositories?.length) {
            return res.status(400).json({ error: "No repositories provided" });
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

        const validRepos = repositories.filter(repo => repo?.trim());
        let allFiles = {};

        for (let i = 0; i < validRepos.length; i++) {
            const repo = validRepos[i];
            send({ stage: 'fetching', repo: repo.split('/').pop(), current: i + 1, total: validRepos.length });

            try {
                const files = await fetchRepoFiles(repo);
                allFiles = { ...allFiles, ...files };
                send({ stage: 'fetched', fileCount: Object.keys(files).length });
            } catch (err) {
                send({ stage: 'error', repo, error: err.message });
                continue;
            }
        }

        if (!Object.keys(allFiles).length) {
            send({ stage: 'complete', success: false, error: "No files found" });
            return res.end();
        }

        send({ stage: 'analyzing' });
        const stats = analyzeProject(allFiles);
        const score = calculateScore(stats);

        send({ stage: 'ai-processing' });

        let aiFeedback;
        if (process.env.OPENAI_API_KEY) {
            try {
                const chat = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a senior developer. Return only valid JSON." },
                        { role: "user", content: createPrompt(stats, score) }
                    ],
                    temperature: 0.2,
                    max_tokens: 800
                });
                aiFeedback = JSON.parse(chat.choices[0].message.content);
            } catch (err) {
                aiFeedback = createFallbackAnalysis(stats, score);
            }
        } else {
            aiFeedback = createFallbackAnalysis(stats, score);
        }

        send({
            stage: 'complete',
            success: true,
            result: { aiFeedback, metrics: { ...stats, technologies: Array.from(stats.technologies), score } }
        });

        res.end();
    } catch (err) {
        console.error("Analysis error:", err);
        res.write(`data: ${JSON.stringify({ stage: 'error', error: err.message })}\n\n`);
        res.end();
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// Implement a backend logic with less lines of code that syncs with the frontend properly,
// We'll use ATS parsing and openi-ai, to provide the best results on a project repo and score it out of 10.
// takes 15 frontend high priority Files and 15 backend high priority files, returns the Score, techstack used, what needs to be improvement with a proper analysis of code
// efficient and accuracy is a must