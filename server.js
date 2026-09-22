/*
  Optional tiny backend for the Groq AI summary.

  Install:
    npm init -y
    npm install express cors dotenv

  Create .env:
    GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE

  Run:
    node server.js

  Then open:
    http://localhost:4000

  IMPORTANT:
  Keep GROQ_API_KEY on the server. Never place the real key in index.html.
*/

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.post("/api/summarize", async (req, res) => {
  const { query, results } = req.body;

  if (!query || !Array.isArray(results)) {
    return res.status(400).json({ error: "query and results are required" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "Missing GROQ_API_KEY. Add it to .env on the server."
    });
  }

  const context = results
    .map((item, index) =>
      `[${index + 1}] ${item.title}\n${item.description || ""}\n${item.excerpt || ""}\nSource: ${item.url}`
    )
    .join("\n\n");

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        // GROQ MODEL:
        // Replace this with a currently available Groq model if needed.
        model: "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a concise research assistant. Summarize only what can be supported by the supplied Wikipedia search results. Do not invent facts. Mention uncertainty when the snippets are insufficient. Write 2-4 short paragraphs."
          },
          {
            role: "user",
            content:
              `User searched for: "${query}"\n\nWikipedia results:\n${context}\n\nGive the user a clear, useful overview of the topic.`
          }
        ]
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq error:", data);
      return res.status(groqResponse.status).json({
        error: data?.error?.message || "Groq request failed"
      });
    }

    const summary = data?.choices?.[0]?.message?.content || "No summary returned.";

    res.json({
      summary,
      source: results[0]?.url || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not reach Groq." });
  }
});

app.listen(PORT, () => {
  console.log(`Atlas running at http://localhost:${PORT}`);
});
