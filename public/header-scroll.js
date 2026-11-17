// Keep the sticky header readable while the rest of the page loads.
const siteHeader = document.querySelector("[data-site-header]");

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("pageshow", updateHeaderState);
window.addEventListener("load", updateHeaderState, { once: true });
