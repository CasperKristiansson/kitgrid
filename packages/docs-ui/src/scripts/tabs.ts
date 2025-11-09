function setupTabs() {
  const containers = document.querySelectorAll<HTMLElement>('[data-tabs]');
  containers.forEach((container) => {
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-tabs-trigger]'));
    const panels = Array.from(container.querySelectorAll<HTMLElement>('[data-tabs-panel]'));
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetIndex = button.dataset.tabsIndex;
        if (targetIndex === undefined) return;
        buttons.forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle('tab-active', isActive);
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
          btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        panels.forEach((panel, index) => {
          const isActive = index.toString() === targetIndex;
          panel.classList.toggle('is-active', isActive);
          panel.toggleAttribute('hidden', !isActive);
        });
        button.focus();
      });
    });

    container.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const activeIndex = buttons.findIndex((btn) => btn.getAttribute('aria-selected') === 'true');
      if (activeIndex === -1) return;
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (activeIndex + delta + buttons.length) % buttons.length;
      buttons[nextIndex]?.click();
    });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTabs);
  } else {
    setupTabs();
  }
}
