const externalProjectLinks = document.querySelectorAll('.project-content a[href="#"]');
const siteHeader = document.querySelector(".site-header");

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

externalProjectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
