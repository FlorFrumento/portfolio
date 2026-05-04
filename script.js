const externalProjectLinks = document.querySelectorAll('.project-content a[href="#"]');

externalProjectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});
