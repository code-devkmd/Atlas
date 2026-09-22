# Atlas

> **An independent search engine built from scratch.**

Atlas is an experimental search engine focused on understanding how modern search systems work from the ground up.

Instead of depending entirely on an existing search provider, Atlas is being developed as its own search pipeline:

```text
        Web
         │
         ▼
      Crawler
         │
         ▼
       Parser
         │
         ▼
       Indexer
         │
         ▼
    Search Index
         │
         ▼
      Ranking
         │
         ▼
     Search API
         │
         ▼
      Atlas UI
```

The project is currently in its early stage. The existing interface provides a clean search experience using Wikipedia/Wikimedia data, while the long-term goal is to replace the external search dependency with Atlas's own crawler, index, ranking system, and search API.

---

## Vision

Atlas aims to become a small, independent, transparent search engine.

The goal isn't to immediately crawl the entire internet. Instead, Atlas will be built incrementally, starting with a small collection of documents and gradually developing the fundamental components required for a real search engine.

### Core goals

* Build a web crawler from scratch
* Extract and clean useful content from web pages
* Build an inverted search index
* Develop a ranking algorithm
* Create a dedicated search API
* Support fast and relevant search
* Add autocomplete and spelling correction
* Experiment with link-based ranking
* Eventually support semantic and hybrid search
* Add AI-generated answers grounded in retrieved sources

---

## Current Status

**Early MVP — Search interface and external retrieval**

The current version can:

* Search Wikipedia through the Wikimedia REST API
* Display results in a clean, responsive interface
* Generate optional AI-powered overviews
* Keep the AI API key on the server
* Work without AI configuration as a normal Wikipedia search interface

The next major milestone is to make Atlas search its **own index** instead of relying on Wikimedia for retrieval.

---

## Architecture

### Current MVP

```text
┌──────────────┐
│   Browser    │
│  Atlas UI    │
└──────┬───────┘
       │
       ├──────────────► Wikimedia REST API
       │                       │
       │                       ▼
       │                  Search Results
       │
       └──────────────► /api/summarize
                              │
                              ▼
                         Node.js Server
                              │
                              ▼
                           Groq API
```

### Planned Architecture

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │    Crawler    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     Parser    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Indexer    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Search Index  │
                    └───────┬───────┘
                            │
                       Search Query
                            │
                            ▼
                    ┌───────────────┐
                    │ Query Parser  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Ranker     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Search API   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Atlas Web   │
                    └───────────────┘
```

---

# Roadmap

Atlas will be developed in stages rather than attempting to build a full-scale search engine immediately.

## Phase 1 — MVP

* [x] Search interface
* [x] Responsive UI
* [x] Wikipedia search
* [x] Server-side AI proxy
* [x] Basic AI overview
* [ ] Better loading and error states
* [ ] Search history
* [ ] Keyboard navigation
* [ ] URL-based search queries
* [ ] Automated tests

## Phase 2 — Atlas Search API

Build an internal search API that provides a consistent interface regardless of where the data comes from.

* [ ] `GET /api/search?q=...`
* [ ] Query validation
* [ ] Standard result format
* [ ] Request limits
* [ ] Caching
* [ ] Structured logging
* [ ] Search analytics

Example:

```http
GET /api/search?q=quantum+computing
```

Response:

```json
{
  "query": "quantum computing",
  "results": [
    {
      "title": "Quantum computing",
      "url": "...",
      "score": 12.42,
      "snippet": "..."
    }
  ]
}
```

---

## Phase 3 — Build the Crawler

Atlas will eventually discover and download pages independently.

The crawler will need to handle:

* URL discovery
* Crawl queues
* Duplicate URLs
* Canonical URLs
* Retry handling
* Request throttling
* Concurrency limits
* `robots.txt`
* HTTP errors
* Redirects
* Content types
* Crawl depth
* Polite crawling

The initial crawler will operate on a small, controlled collection of websites rather than attempting to crawl the entire web.

---

## Phase 4 — Build the Index

Raw HTML is not enough for efficient search.

Atlas will extract information such as:

```text
URL
Title
Headings
Main content
Links
Language
Metadata
Last crawled time
```

The first search index will focus on an **inverted index**.

Conceptually:

```text
"javascript"
    ├── document_12
    ├── document_37
    └── document_91

"react"
    ├── document_12
    ├── document_42
    └── document_91
```

This allows Atlas to find documents containing query terms without scanning every document for every search.

---

## Phase 5 — Ranking

The first ranking system will prioritize traditional information-retrieval techniques.

Potential signals include:

* Term frequency
* Inverse document frequency
* BM25
* Title matches
* Heading matches
* Phrase matches
* Document length
* Link structure
* Freshness
* Domain authority

Later, Atlas can experiment with link-based algorithms such as PageRank.

The ranking system will be evaluated using a small manually labeled dataset before adding increasingly complex signals.

---

## Phase 6 — Search Experience

Once Atlas has its own index, the frontend can evolve beyond a simple search box.

Planned features:

* Autocomplete
* Search suggestions
* Spelling correction
* Search filters
* Pagination
* Related searches
* Highlighted matching text
* Fast keyboard navigation
* Search operators
* Result explanations

The interface will remain intentionally simple.

---

## Phase 7 — AI Search

AI will be added **on top of retrieval**, not used as a replacement for it.

The planned pipeline is:

```text
User Query
     │
     ▼
Search
     │
     ▼
Retrieve Relevant Documents
     │
     ▼
Rank Documents
     │
     ▼
AI Context
     │
     ▼
Generated Answer
     │
     ▼
Citations
```

AI features may include:

* Concise search summaries
* Question answering
* Source-grounded explanations
* Related questions
* Document summarization
* Semantic search

Atlas should always retain the underlying sources so users can inspect where an answer came from.

---

# Technology

The current MVP uses:

* HTML
* CSS
* JavaScript
* Node.js
* Wikimedia REST API
* Groq API

The technology stack may change as the search infrastructure develops.

Potential future technologies include:

* PostgreSQL
* SQLite
* Redis
* Meilisearch
* Typesense
* OpenSearch
* Elasticsearch
* Vector databases
* Embedding models

The project will prioritize understanding the underlying systems before introducing additional infrastructure.

---

# Project Structure

The current MVP is intentionally small:

```text
atlas/
├── index.html
├── style.css
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

As the project grows, it may evolve toward:

```text
atlas/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── search-core/
│   ├── crawler/
│   ├── indexer/
│   └── config/
│
├── data/
│   └── seeds/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── docs/
│   ├── architecture.md
│   ├── crawling-policy.md
│   └── ranking.md
│
├── scripts/
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

This structure is planned rather than required. The project will only be split into separate packages when the complexity justifies it.

---

# Getting Started

## Requirements

* Node.js 18+
* npm
* Groq API key — optional

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/atlas.git
cd atlas
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Add your configuration:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=4000
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:4000
```

---

# API

## `POST /api/summarize`

Generates an AI overview using the supplied search results.

### Request

```json
{
  "query": "quantum computing",
  "results": [
    {
      "title": "Quantum computing",
      "description": "A form of computation...",
      "excerpt": "...",
      "url": "https://en.wikipedia.org/wiki/Quantum_computing"
    }
  ]
}
```

The endpoint requires `GROQ_API_KEY`.

The Wikimedia search API does not require an API key.

---

# Search Engine Principles

Atlas is being built around a few principles:

### Retrieval before generation

AI should work with retrieved information rather than inventing the information it presents.

### Sources matter

Search results should remain traceable to their original documents.

### Relevance over complexity

A simple ranking algorithm that can be measured and understood is more useful than a complicated system that cannot be evaluated.

### Build incrementally

Atlas will start with a small corpus and gradually increase its capabilities.

### Understand the system

The project is not only about creating a search website. It is also an attempt to understand the systems behind search engines: crawling, indexing, information retrieval, ranking, distributed systems, and information extraction.

---

# Responsible Crawling

When Atlas begins crawling external websites, it will respect:

* `robots.txt`
* Reasonable request rates
* Crawl delays where applicable
* Server capacity
* HTTP caching headers where appropriate
* Content removal requests
* Clear crawler identification

Atlas will begin with controlled crawl targets before expanding its crawler.

---

# Contributing

Atlas is currently primarily a learning and experimental project.

As the search infrastructure becomes more mature, contribution guidelines, issue templates, development documentation, and architecture documentation will be expanded.

Potential areas for contribution include:

* Crawling
* Parsing
* Indexing
* Ranking
* Search UI
* Performance
* Testing
* Documentation
* Search evaluation

---

# License

Atlas is licensed under the [MIT License](LICENSE).

---

## Status

**Atlas is actively being built.**

The current version is only the beginning.

```text
Wikipedia Search
       ↓
Atlas Search API
       ↓
Atlas Index
       ↓
Atlas Crawler
       ↓
Atlas Ranking
       ↓
Atlas Search Engine
```

The goal is simple:

**Build the search engine, one layer at a time.**
