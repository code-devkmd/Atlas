const form = document.querySelector("#searchForm");
const compactForm = document.querySelector("#compactSearchForm");
const input = document.querySelector("#query");
const compactQuery = document.querySelector("#compactQuery");
const clearBtn = document.querySelector("#clearBtn");
const compactClearBtn = document.querySelector("#compactClearBtn");
const submitBtn = document.querySelector("#submitBtn");
const landing = document.querySelector("#landing");
const resultsSection = document.querySelector("#resultsSection");
const resultsEl = document.querySelector("#results");
const aiContent = document.querySelector("#aiContent");
const resultMeta = document.querySelector("#resultMeta");
const topProgress = document.querySelector("#topProgress");
const WIKI_API = "https://en.wikipedia.org/w/rest.php/v1/search/page";
const AI_ENDPOINT = "/api/summarize";

form.addEventListener("submit", (e) => {
	e.preventDefault();
	search(input.value.trim());
});
compactForm.addEventListener("submit", (e) => {
	e.preventDefault();
	search(compactQuery.value.trim());
});

input.addEventListener("input", () => {
	clearBtn.style.display = input.value ? "flex" : "none";
	submitBtn.disabled = !input.value.trim();
});
compactQuery.addEventListener("input", () => {
	compactClearBtn.classList.toggle("hidden", !compactQuery.value);
});

clearBtn.addEventListener("click", () => {
	input.value = "";
	clearBtn.style.display = "none";
	submitBtn.disabled = true;
	input.focus();
});
compactClearBtn.addEventListener("click", () => {
	compactQuery.value = "";
	compactClearBtn.classList.add("hidden");
	compactQuery.focus();
});

input.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		if (input.value) {
			input.value = "";
			clearBtn.style.display = "none";
			submitBtn.disabled = true;
		} else {
			input.blur();
		}
	}
});
compactQuery.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		if (compactQuery.value) {
			compactQuery.value = "";
			compactClearBtn.classList.add("hidden");
		} else {
			compactQuery.blur();
		}
	}
});

document
	.querySelectorAll("[data-query]")
	.forEach((btn) =>
		btn.addEventListener("click", () => search(btn.dataset.query)),
	);
document.querySelector("#resultsHomeBtn").addEventListener("click", goHome);

function goHome() {
	resultsSection.classList.add("hidden");
	landing.classList.remove("hidden");
	window.scrollTo({ top: 0, behavior: "smooth" });
	setTimeout(() => input.focus(), 220);
}

function setProgress(active) {
	topProgress.classList.toggle("active", active);
}

function skeletonResults(count) {
	let out = '<div class="skel-block">';
	for (let i = 0; i < count; i++) {
		out += `<div class="skel-result">
          <div class="skel-line w-short"></div>
          <div class="skel-line w-title"></div>
          <div class="skel-line w-full"></div>
          <div class="skel-line w-mid"></div>
        </div>`;
	}
	return out + "</div>";
}

function skeletonAI() {
	return `<div class="skel-block">
        <div class="skel-line w-full"></div>
        <div class="skel-line w-full"></div>
        <div class="skel-line w-mid"></div>
      </div>`;
}

function searchPulseIcon() {
	return `<span class="loading-row"><svg class="search-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><line x1="16" y1="16" x2="20.5" y2="20.5"></line></svg><span>Searching…</span></span>`;
}

async function search(query) {
	if (!query) return;
	input.value = query;
	clearBtn.style.display = "flex";
	submitBtn.disabled = false;
	landing.classList.add("hidden");
	resultsSection.classList.remove("hidden");
	compactQuery.value = query;
	compactClearBtn.classList.remove("hidden");
	resultMeta.innerHTML = searchPulseIcon();
	resultsEl.innerHTML = skeletonResults(4);
	aiContent.innerHTML = skeletonAI();
	setProgress(true);
	window.scrollTo({ top: 0, behavior: "smooth" });

	try {
		const response = await fetch(
			`${WIKI_API}?q=${encodeURIComponent(query)}&limit=8`,
		);
		if (!response.ok) throw new Error("Wikipedia search failed.");
		const data = await response.json();
		renderResults(data.pages || [], query);
		summarize(query, data.pages || []);
	} catch (error) {
		resultMeta.textContent = "";
		resultsEl.innerHTML = `<div class="state-panel is-error"><strong>Could not load results</strong>Check your connection and try again.</div>`;
		aiContent.innerHTML = `<div class="state-panel is-error" style="padding:24px 16px"><strong>Overview unavailable</strong>The search request failed.</div>`;
		setProgress(false);
	}
}

function renderResults(pages, query) {
	setProgress(false);
	resultMeta.textContent = pages.length
		? `${pages.length} results for "${query}"`
		: `No results for "${query}"`;
	if (!pages.length) {
		resultsEl.innerHTML = `<div class="state-panel"><strong>No results found</strong>Try a broader search or a different phrase.</div>`;
		return;
	}
	resultsEl.innerHTML = pages
		.map((page, index) => {
			const title = escapeHtml(page.title || "Untitled");
			const description = escapeHtml(page.description || "Wikipedia article");
			const excerpt = escapeHtml(
				page.excerpt || "Open the article to learn more.",
			);
			const key = page.key || page.title;
			const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
			return `<article class="result" style="animation-delay:${index * 35}ms">
          <div class="result-site">
            <span class="result-favicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18"/></svg></span>
            <span>wikipedia.org/wiki/${escapeHtml(key)}</span>
          </div>
          <a class="result-title" href="${wikiUrl}" target="_blank" rel="noopener">${title}</a>
          <p class="result-snippet"><strong>${description}</strong> — ${excerpt}</p>
        </article>`;
		})
		.join("");
}

async function summarize(query, pages) {
	if (!pages.length) {
		aiContent.innerHTML = "<p>There are no results to summarize.</p>";
		return;
	}
	const context = pages.slice(0, 5).map((p) => ({
		title: p.title,
		description: p.description,
		excerpt: p.excerpt,
		url: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.key || p.title).replace(/%2F/g, "/")}`,
	}));
	try {
		const response = await fetch(AI_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query, results: context }),
		});
		if (!response.ok) throw new Error("AI endpoint unavailable.");
		const data = await response.json();
		aiContent.innerHTML = formatAIText(data.summary || "No overview returned.");
		if (data.source)
			aiContent.insertAdjacentHTML(
				"beforeend",
				`<a class="source-chip" href="${escapeAttribute(data.source)}" target="_blank" rel="noopener">View source →</a>`,
			);
	} catch {
		aiContent.innerHTML =
			"<p><strong>AI overview unavailable.</strong></p><p>The search results are still ready to explore. Configure the Groq proxy in <code>server.js</code> to enable summaries.</p>";
	}
}

function formatAIText(text) {
	return text
		.split(/\n{2,}/)
		.map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
		.join("");
}
function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}
function escapeAttribute(value) {
	return escapeHtml(value).replaceAll("`", "&#096;");
}
