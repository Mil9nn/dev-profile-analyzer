import express from 'express';
import dotenv from 'dotenv';
import fetchRepoFiles from '../utils/fetchRepoFiles.js';
import prepareProjectSummary from "../utils/prepareProjectSummary.js";
import { OpenAI } from "openai";
import { parseProjectSummary } from '../utils/parseProjectSummary.js';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { repositories } = req.body;

    if (!repositories || repositories.length === 0) {
      return res.status(400).json({ message: "No repositories provided" });
    }
    let allFiles = {};

    for (const repoUrl of repositories.filter(Boolean)) {
      const files = await fetchRepoFiles(repoUrl);
      allFiles = { ...allFiles, ...files };
    }

    const summary = prepareProjectSummary(allFiles);

    const prompt = `
You are an expert software engineer analyzing a combined GitHub project made up of multiple repositories.
Evaluate the following collective code and provide:

1. A **score out of 10** based on:
  - Use of frameworks/libraries
  - Code architecture & modularity
  - Use of advanced concepts
  - Readability & maintainability

2. List detected **technologies/frameworks/libraries**.

3. Give **strengths**, **weaknesses**, and **improvements**.

4. Assess **hiring potential** of the developer based on these repositories.

Combined Project Summary:
${summary}
`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are a senior full-stack developer helping recruiters evaluate GitHub projects.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const aiResponse = chat.choices[0].message.content;

    // Parse the AI text response to structured JSON
    const parsedSummary = parseProjectSummary(aiResponse);

    res.status(201).json({ success: true, aiFeedback: parsedSummary });

  } catch (err) {
    console.error("AI Scoring error:", err);
    res.status(500).json({ success: false, error: "Failed to analyze repositories." });
  }
});

export default router;