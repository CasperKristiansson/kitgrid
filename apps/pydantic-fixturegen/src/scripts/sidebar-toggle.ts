const root = document.documentElement;

const closeSidebar = () => {
  root.classList.remove('pf-sidebar-open');
};

const handleClick = (event: Event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  if (target.closest('[data-sidebar-toggle]')) {
    event.preventDefault();
    root.classList.toggle('pf-sidebar-open');
    return;
  }
  if (target.closest('[data-sidebar-dismiss]')) {
    event.preventDefault();
    closeSidebar();
  }
};

document.addEventListener('click', handleClick);
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    closeSidebar();
  }
});
