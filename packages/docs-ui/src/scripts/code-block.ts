function setupCodeBlocks() {
  const blocks = document.querySelectorAll<HTMLElement>('[data-code-block]');
  blocks.forEach((block) => {
    const button = block.querySelector<HTMLButtonElement>('[data-code-copy]');
    const target = block.querySelector<HTMLElement>('[data-code-target]');
    if (!button || !target) return;

    button.addEventListener('click', async () => {
      try {
        const text = target.innerText.trim();
        await navigator.clipboard.writeText(text);
        const original = button.textContent ?? 'Copy';
        button.textContent = 'Copied';
        button.setAttribute('aria-live', 'polite');
        setTimeout(() => {
          button.textContent = original;
          button.removeAttribute('aria-live');
        }, 1400);
      } catch (error) {
        console.warn('Copy failed', error);
      }
    });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCodeBlocks);
  } else {
    setupCodeBlocks();
  }
}
