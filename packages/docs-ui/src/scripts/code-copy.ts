const COPY_RESET_DELAY = 1500;

function getBlockText(block: HTMLElement) {
  const nodes = Array.from(block.querySelectorAll('pre code'));
  return nodes.map((node) => node.textContent ?? '').join('\n').trimEnd();
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.top = '0';
  textarea.style.left = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function copyText(text: string) {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  fallbackCopy(text);
}

function bindCopyHandlers() {
  const blocks = document.querySelectorAll<HTMLElement>('[data-code-block]');
  blocks.forEach((block) => {
    const button = block.querySelector<HTMLButtonElement>('[data-code-copy]');
    if (!button) return;
    button.addEventListener('click', async () => {
      const code = getBlockText(block);
      if (!code) return;
      try {
        await copyText(code);
        button.dataset.copyState = 'copied';
      } catch {
        button.dataset.copyState = 'error';
      }
      setTimeout(() => {
        delete button.dataset.copyState;
      }, COPY_RESET_DELAY);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCopyHandlers, { once: true });
} else {
  bindCopyHandlers();
}
