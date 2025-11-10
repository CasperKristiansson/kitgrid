const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDocLabel = (url = '') => {
  if (!url) return 'Docs';
  try {
    const parsed = new URL(url, window.location.origin);
    const pathname = parsed.pathname.replace(/\/+$/, '');
    return pathname || '/';
  } catch {
    return url;
  }
};

/**
 * @param {HTMLElement} block
 */
async function initSearch(block) {
  const input = block.querySelector('[data-docs-search-input]');
  const resultsContainer = block.querySelector('[data-docs-search-results]');
  const resultsList = resultsContainer?.querySelector('ul');
  const status = block.querySelector('[data-docs-search-status]');
  const shortcut = block.querySelector('[data-docs-search-shortcut]');
  const remoteSrc = block.dataset.docsSearchRemote;
  if (!input || !resultsContainer || !resultsList || !status) return;

  const isMac = navigator.userAgent.includes('Mac');
  if (shortcut) {
    shortcut.textContent = isMac ? '⌘ K' : 'Ctrl K';
  }

  let pagefindPromise = null;
  let pagefindInstance;

  function setStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  function clearResults() {
    resultsList.innerHTML = '';
    resultsContainer.hidden = true;
  }

  async function ensurePagefind() {
    if (pagefindInstance) return pagefindInstance;
    if (pagefindPromise) return pagefindPromise;

    pagefindPromise = (async () => {
      const sources = ['/pagefind/pagefind.js'];
      if (remoteSrc && !sources.includes(remoteSrc)) {
        sources.push(remoteSrc);
      }

      const computeBasePath = (src) => {
        try {
          const url = new URL(src, window.location.origin);
          const path = url.pathname.replace(/pagefind\.js.*$/, '');
          const base = `${url.origin}${path}`;
          return base.endsWith('/') ? base : `${base}/`;
        } catch {
          return '/pagefind/';
        }
      };

      const importFromSource = async (src) => {
        try {
          const response = await fetch(src, { credentials: 'omit' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const code = await response.text();
          const blob = new Blob([code], { type: 'text/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          const basePath = computeBasePath(src);
          try {
            const module = await import(/* @vite-ignore */ blobUrl);
            return { module, basePath };
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        } catch (error) {
          throw new Error(`Failed to load Pagefind script from ${src}: ${error instanceof Error ? error.message : error}`);
        }
      };

      for (const src of sources) {
        try {
          const imported = await importFromSource(src);
          if (imported?.module) {
            try {
              await imported.module.options?.({ basePath: imported.basePath });
            } catch (error) {
              console.warn('Failed to configure Pagefind basePath', error);
            }
            pagefindInstance = imported.module;
            return imported.module;
          }
        } catch (error) {
          console.warn(error);
        }
      }

      return null;
    })();

    return pagefindPromise;
  }

  async function handleSearch() {
    const query = input.value.trim();
    if (!query) {
      clearResults();
      setStatus('');
      return;
    }

    setStatus('Searching…');
    const pagefind = await ensurePagefind();
    if (!pagefind) {
      setStatus('Search unavailable in preview builds.');
      clearResults();
      return;
    }

    try {
      const search = await pagefind.search(query);
      const enriched = await Promise.all(
        search.results.slice(0, 25).map(async (result) => {
          const data = await result.data();
          const metaTitle = data?.meta?.title ?? '';
          const rawUrl = data?.raw_url ?? data?.url ?? '';
          const normalizedQuery = query.toLowerCase();
          const titleMatch =
            metaTitle.toLowerCase() === normalizedQuery ? 2 : metaTitle.toLowerCase().includes(normalizedQuery) ? 1 : 0;
          const slugMatch = rawUrl.toLowerCase().includes(normalizedQuery) ? 1 : 0;
          const score = (titleMatch + slugMatch) * 100 + (data?.meta?.score ?? 0);
          return { score, data };
        }),
      );
      const items = enriched
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map(({ data }) => data);
      if (!items.length) {
        clearResults();
        setStatus('');
        return;
      }

      resultsList.innerHTML = items
        .map((item) => {
          const title = escapeHtml(item?.meta?.title ?? item?.url ?? 'Untitled');
          const url = escapeHtml(item?.url ?? '#');
          const label = escapeHtml(formatDocLabel(item?.raw_url ?? item?.url));
          const rawFallback = (item?.content ?? '').slice(0, 200);
          const excerpt = item?.excerpt ?? (rawFallback ? escapeHtml(rawFallback) : '');
          const excerptMarkup = excerpt
            ? `<span class="docs-search__result-excerpt">${excerpt}</span>`
            : '';
          return `<li><a href="${url}"><span class="docs-search__result-title">${title}</span><span class="docs-search__result-label">${label}</span>${excerptMarkup}</a></li>`;
        })
        .join('');

      resultsContainer.hidden = false;
      setStatus('');
    } catch (error) {
      console.warn('pagefind search failed', error);
      setStatus('Search failed. Try again later.');
      clearResults();
    }
  }

  function handleShortcut(event) {
    if ((isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
      input.select();
    }
  }

  input.addEventListener('focus', () => void ensurePagefind(), { once: true });
  input.addEventListener('input', handleSearch);
  function handleEscape(event) {
    if (event.key === 'Escape') {
      input.blur();
      resultsContainer.hidden = true;
      clearResults();
      setStatus('');
    }
  }

  window.addEventListener('keydown', handleShortcut);
  window.addEventListener('keydown', handleEscape);
}

function bootstrapSearch() {
  const blocks = document.querySelectorAll('[data-docs-search]');
  blocks.forEach((block) => {
    void initSearch(block);
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapSearch);
  } else {
    bootstrapSearch();
  }
}
