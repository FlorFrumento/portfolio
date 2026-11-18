// Keep the sticky header readable while the rest of the page loads.
const siteHeader = document.querySelector("[data-site-header]");

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("pageshow", updateHeaderState);
window.addEventListener("load", updateHeaderState, { once: true });

const menuToggle = siteHeader?.querySelector(".menu-toggle");
const siteNavigation = siteHeader?.querySelector(".main-nav");

if (menuToggle && siteNavigation) {
  const mobileViewport = window.matchMedia("(max-width: 1000px)");
  siteHeader.classList.add("has-menu");

  const setMenuOpen = (open, restoreFocus = false) => {
    siteHeader.classList.toggle("is-menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open
      ? menuToggle.dataset.menuCloseLabel
      : menuToggle.dataset.menuOpenLabel);
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNavigation.addEventListener("click", (event) => {
    if (mobileViewport.matches && event.target.closest("a")) setMenuOpen(false, true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteHeader.classList.contains("is-menu-open")) {
      setMenuOpen(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteHeader.contains(event.target)) setMenuOpen(false);
  });

  siteHeader.addEventListener("focusout", (event) => {
    if (!siteHeader.contains(event.relatedTarget)) setMenuOpen(false);
  });

  mobileViewport.addEventListener("change", () => setMenuOpen(false));
  window.addEventListener("hashchange", () => setMenuOpen(false));
  window.addEventListener("pageshow", () => setMenuOpen(false));
}
