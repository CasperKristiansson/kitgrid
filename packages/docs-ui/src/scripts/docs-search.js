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

  const scriptId = 'kitgrid-pagefind-script';
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

    pagefindPromise = new Promise((resolve) => {
      const finalize = async () => {
        if (window.pagefindInit) {
          try {
            pagefindInstance = await window.pagefindInit();
            resolve(pagefindInstance);
          } catch (error) {
            console.warn('pagefind init failed', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      if (window.pagefindInit) {
        void finalize();
        return;
      }

      const sources = ['/pagefind/pagefind.js'];
      if (remoteSrc && !sources.includes(remoteSrc)) {
        sources.push(remoteSrc);
      }

      const loadFromSource = (index) => {
        const src = sources[index];
        if (!src) {
          resolve(null);
          return;
        }

        const existing = document.getElementById(scriptId);
        if (existing) {
          existing.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = src;
        script.defer = true;
        script.addEventListener('load', finalize, { once: true });
        script.addEventListener(
          'error',
          () => {
            script.remove();
            loadFromSource(index + 1);
          },
          { once: true },
        );
        document.head.appendChild(script);
      };

      loadFromSource(0);
    });

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
      const items = await Promise.all(search.results.slice(0, 5).map((result) => result.data()));
      if (!items.length) {
        clearResults();
        setStatus('No matches yet.');
        return;
      }

      resultsList.innerHTML = items
        .map((item) => {
          const title = item?.meta?.title ?? item?.url ?? 'Untitled';
          const url = item?.url ?? '#';
          return `<li><a href="${url}">${title}</a></li>`;
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
  window.addEventListener('keydown', handleShortcut);
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
