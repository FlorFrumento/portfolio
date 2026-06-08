import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjOPddXrcn-py4PRrQvXOoz3HhN4_toFk",
  authDomain: "florencia-frumento.firebaseapp.com",
  projectId: "florencia-frumento",
  storageBucket: "florencia-frumento.firebasestorage.app",
  messagingSenderId: "914854241829",
  appId: "1:914854241829:web:1d58c9a454fd9462bec1cc",
  measurementId: "G-WFMZ4DVP69"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const headerNavItems = [
  { href: "/#casos", label: "Casos" },
  { href: "/#experiencia", label: "Experiencia" },
  { className: "desktop-only", href: "/#enfoque", label: "Enfoque" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/sobre-mi/", label: "Sobre GiraFlor", page: "about" }
];

const renderSiteHeader = () => {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const currentPage = header.dataset.currentPage;
  const inner = document.createElement("div");
  inner.className = "header-inner";

  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "/#inicio";
  brand.setAttribute("aria-label", "Ir al inicio");

  const brandText = document.createElement("span");
  brandText.textContent = "Florencia Frumento";
  brand.append(brandText);

  const nav = document.createElement("nav");
  nav.className = "main-nav";
  nav.setAttribute("aria-label", "Navegacion principal");

  headerNavItems.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;

    if (item.className) {
      link.className = item.className;
    }

    if (item.page && item.page === currentPage) {
      link.setAttribute("aria-current", "page");
    }

    nav.append(link);
  });

  inner.append(brand, nav);
  header.replaceChildren(inner);
};

renderSiteHeader();

const externalProjectLinks = document.querySelectorAll('.project-content a[href="#"]');
const siteHeader = document.querySelector(".site-header");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#contact-form-status");
const carousels = document.querySelectorAll("[data-carousel]");
let activeLightbox = null;

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const setFormStatus = (message, type = "") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove("is-error", "is-success");
  if (type) {
    formStatus.classList.add(type);
  }
};

externalProjectLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

carousels.forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");

  if (!track || !previousButton || !nextButton) return;

  const getSlides = () => Array.from(track.querySelectorAll(".carousel-slide"));

  const getCurrentIndex = () => {
    const slides = getSlides();
    if (!slides.length) return 0;

    return slides.reduce((closestIndex, slide, index) => {
      const currentDistance = Math.abs(slide.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(slides[closestIndex].offsetLeft - track.scrollLeft);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);
  };

  const scrollToSlide = (index) => {
    const slides = getSlides();
    if (!slides.length) return;

    track.scrollTo({
      left: slides[index].offsetLeft,
      behavior: "smooth"
    });
  };

  const moveCarousel = (direction) => {
    const slides = getSlides();
    if (!slides.length) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const edgeTolerance = 4;

    if (direction > 0 && track.scrollLeft >= maxScroll - edgeTolerance) {
      scrollToSlide(0);
      return;
    }

    if (direction < 0 && track.scrollLeft <= edgeTolerance) {
      scrollToSlide(slides.length - 1);
      return;
    }

    const currentIndex = getCurrentIndex();
    const nextIndex = (currentIndex + direction + slides.length) % slides.length;
    scrollToSlide(nextIndex);
  };

  previousButton.addEventListener("click", () => moveCarousel(-1));
  nextButton.addEventListener("click", () => moveCarousel(1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCarousel(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCarousel(1);
    }
  });

  const lightboxTriggers = carousel.querySelectorAll("[data-lightbox-trigger]");

  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      const images = Array.from(carousel.querySelectorAll(".case-carousel-slide img")).map((image) => ({
        alt: image.alt,
        src: image.currentSrc || image.src
      }));

      if (images.length) {
        openLightbox(images, index);
      }
    });
  });
});

const closeLightbox = () => {
  if (!activeLightbox) return;

  activeLightbox.element.remove();
  document.body.classList.remove("has-lightbox");
  activeLightbox = null;
};

const updateLightbox = () => {
  if (!activeLightbox) return;

  const item = activeLightbox.items[activeLightbox.index];
  activeLightbox.image.src = item.src;
  activeLightbox.image.alt = item.alt;
  activeLightbox.caption.textContent = item.alt;
};

const moveLightbox = (direction) => {
  if (!activeLightbox) return;

  activeLightbox.index =
    (activeLightbox.index + direction + activeLightbox.items.length) % activeLightbox.items.length;
  updateLightbox();
};

function openLightbox(items, startIndex) {
  closeLightbox();

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Vista ampliada de páginas del informe");
  lightbox.innerHTML = `
    <button class="lightbox-button lightbox-close" type="button" aria-label="Cerrar vista ampliada">×</button>
    <button class="lightbox-button lightbox-prev" type="button" aria-label="Ver imagen anterior">←</button>
    <figure class="lightbox-figure">
      <img class="lightbox-image" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-button lightbox-next" type="button" aria-label="Ver imagen siguiente">→</button>
  `;

  document.body.append(lightbox);
  document.body.classList.add("has-lightbox");

  activeLightbox = {
    caption: lightbox.querySelector(".lightbox-caption"),
    element: lightbox,
    image: lightbox.querySelector(".lightbox-image"),
    index: startIndex,
    items
  };

  lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => moveLightbox(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  updateLightbox();
  lightbox.querySelector(".lightbox-close")?.focus();
}

window.addEventListener("keydown", (event) => {
  if (!activeLightbox) return;

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  }

  if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector(".submit-button");
  const formData = new FormData(form);
  const honeypot = String(formData.get("company") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (honeypot) {
    setFormStatus("No se pudo enviar el mensaje.", "is-error");
    return;
  }

  if (!name || !email || !message) {
    setFormStatus("Completá nombre, correo y mensaje para enviar.", "is-error");
    return;
  }

  submitButton?.setAttribute("disabled", "true");
  setFormStatus("Enviando mensaje...");

  try {
    await addDoc(collection(firestore, "contactMessages"), {
      name,
      email,
      message,
      source: window.location.href,
      createdAt: serverTimestamp()
    });

    form.reset();
    setFormStatus("Mensaje enviado. Gracias por escribirme.", "is-success");
  } catch (error) {
    console.error("Error saving contact form:", error);
    setFormStatus(
      "No pude enviar el mensaje. Revisamos juntos la configuración de Firebase en el siguiente paso.",
      "is-error"
    );
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
