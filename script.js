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

const caseStudies = [
  {
    id: "amazon",
    href: "/casos/carrito-amazon.html",
    title: "Dise\u00f1ar la decisi\u00f3n de compra",
    kicker: "Pr\u00e1ctica profesional · Workshop",
    description: "Research, heur\u00edsticas y redise\u00f1o del flujo mobile de Amazon para acompa\u00f1ar mejor la decisi\u00f3n de compra.",
    imageSrc: "/case-assets/case-preview-carrito-amazon.png",
    imageAlt: "Preview visual del caso de carrito de Amazon",
    mediaClassName: "project-media-amazon",
    priority: "featured",
    tags: ["amazon", "featured", "research", "ux"]
  },
  {
    id: "banner-nubecommerce",
    href: "/casos/banner-nubecommerce.html",
    title: "M\u00e1s respuestas, menos fricci\u00f3n",
    kicker: "Tiendanube admin · Investigaci\u00f3n",
    description: "Iteraci\u00f3n de microcopy y comportamiento de un banner in-app para aumentar la participaci\u00f3n en una encuesta.",
    imageSrc: "/case-assets/case-preview-nubecommerce.jpg",
    imageAlt: "Preview visual del caso NubeCommerce",
    mediaClassName: "project-media-banner",
    priority: "featured",
    tags: ["tiendanube", "featured", "research", "product"]
  },
  {
    id: "cta-migrar-tienda",
    href: "/casos/cta-migrar-tienda.html",
    title: "CTA para migrar tiendas",
    kicker: "Tiendanube blog · Growth",
    description: "A/B test de contenido y jerarqu\u00eda para abrir un nuevo punto de conversi\u00f3n hacia una landing estrat\u00e9gica.",
    imageSrc: "/case-assets/case-preview-cta-migrar-tienda.jpg",
    imageAlt: "Preview visual del caso CTA para migrar tiendas",
    mediaClassName: "project-media-cta",
    priority: "featured",
    tags: ["tiendanube", "featured", "growth", "conversion"]
  },
  {
    id: "recursos-descargables",
    href: "/casos/recursos-descargables.html",
    title: "Recursos descargables",
    kicker: "Lead generation · SEO/GEO",
    description: "Informes, e-books, playbooks y landings como experiencias completas de generaci\u00f3n de leads.",
    imageSrc: "/case-assets/case-preview-recursos.jpg",
    imageAlt: "Preview visual del caso de recursos descargables",
    mediaClassName: "project-media-resource",
    priority: "standard",
    tags: ["lead-generation", "seo", "content"]
  },
  {
    id: "ristretto",
    href: "/casos/ristretto.html",
    title: "Ristretto, mi app de microficci\u00f3n",
    kicker: "Producto digital · UX/UI + IA",
    description: "De un problema de lectura cotidiana a una experiencia digital pensada, prototipada y construida con IA.",
    imageSrc: "/case-assets/case-preview-ristretto.jpg",
    imageAlt: "Pantallas del prototipo de Ristretto",
    mediaClassName: "project-media-ristretto",
    priority: "featured",
    tags: ["ristretto", "featured", "product", "ux"]
  }
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

const normalizePath = (value) => value.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";

const hashString = (value) => {
  let hash = 1779033703 ^ value.length;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return hash >>> 0;
};

const createSeededRandom = (seed) => {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const getRecommendationSeed = (currentCaseId) => {
  const dayKey = new Date().toISOString().slice(0, 10);
  return hashString(`${currentCaseId}:${dayKey}`);
};

const pickWeightedCase = (candidates, random, getWeight) => {
  const weightedCandidates = candidates.map((candidate) => ({
    candidate,
    weight: Math.max(0, getWeight(candidate))
  })).filter(({ weight }) => weight > 0);

  if (!weightedCandidates.length) return null;

  const totalWeight = weightedCandidates.reduce((sum, item) => sum + item.weight, 0);
  let threshold = random() * totalWeight;

  for (const item of weightedCandidates) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.candidate;
    }
  }

  return weightedCandidates[weightedCandidates.length - 1]?.candidate ?? null;
};

const shuffleWithSeed = (items, random) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const buildRelatedCaseCard = (caseStudy) => {
  const link = document.createElement("a");
  link.className = "related-case-card";
  link.href = caseStudy.href;

  const media = document.createElement("div");
  media.className = `project-media project-media-image ${caseStudy.mediaClassName}`;

  const image = document.createElement("img");
  image.src = caseStudy.imageSrc;
  image.alt = caseStudy.imageAlt;
  image.loading = "lazy";
  media.append(image);

  const content = document.createElement("div");

  const kicker = document.createElement("p");
  kicker.className = "project-kicker";
  kicker.textContent = caseStudy.kicker;

  const title = document.createElement("h3");
  title.textContent = caseStudy.title;

  const description = document.createElement("p");
  description.textContent = caseStudy.description;

  const cta = document.createElement("strong");
  cta.textContent = "Ver caso";

  content.append(kicker, title, description, cta);
  link.append(media, content);

  return link;
};

const selectRelatedCaseStudies = (currentCaseId, count = 3) => {
  const currentCase = caseStudies.find((caseStudy) => caseStudy.id === currentCaseId);
  if (!currentCase) return [];

  const random = createSeededRandom(getRecommendationSeed(currentCaseId));
  const candidates = caseStudies.filter((caseStudy) => caseStudy.id !== currentCaseId);
  const selected = [];
  const selectedIds = new Set();

  const addCase = (caseStudy) => {
    if (!caseStudy || selectedIds.has(caseStudy.id) || selected.length >= count) return;
    selected.push(caseStudy);
    selectedIds.add(caseStudy.id);
  };

  const getRemainingCandidates = (filter = () => true) => candidates.filter(
    (caseStudy) => !selectedIds.has(caseStudy.id) && filter(caseStudy)
  );

  addCase(
    pickWeightedCase(
      getRemainingCandidates((caseStudy) => caseStudy.tags.includes("tiendanube")),
      random,
      (caseStudy) => (caseStudy.priority === "featured" ? 4 : 2)
    )
  );

  addCase(
    pickWeightedCase(
      getRemainingCandidates((caseStudy) => caseStudy.id === "amazon" || caseStudy.id === "ristretto"),
      random,
      (caseStudy) => (caseStudy.priority === "featured" ? 4 : 2)
    )
  );

  while (selected.length < count) {
    const remaining = getRemainingCandidates();
    if (!remaining.length) break;

    addCase(
      pickWeightedCase(remaining, random, (caseStudy) => {
        let weight = caseStudy.priority === "featured" ? 3 : 2;

        if (caseStudy.tags.includes("tiendanube")) {
          weight += 1;
        }

        if (caseStudy.priority === "standard" && !selected.some((item) => item.priority === "standard")) {
          weight += 2;
        }

        return weight;
      })
    );
  }

  return shuffleWithSeed(selected, random).slice(0, count);
};

const renderRelatedCases = () => {
  const grid = document.querySelector(".related-cases-grid");
  if (!grid) return;

  const currentPath = normalizePath(window.location.pathname);
  const currentCase = caseStudies.find((caseStudy) => normalizePath(caseStudy.href) === currentPath);
  if (!currentCase) return;

  const relatedCaseStudies = selectRelatedCaseStudies(currentCase.id);
  grid.replaceChildren(...relatedCaseStudies.map(buildRelatedCaseCard));
};

renderRelatedCases();

const externalProjectLinks = document.querySelectorAll('.project-content a[href="#"]');
const siteHeader = document.querySelector(".site-header");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#contact-form-status");
const carousels = document.querySelectorAll("[data-carousel]");
const lightboxGalleries = document.querySelectorAll("[data-lightbox-gallery]");
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

const bindLightboxTriggers = (container, imageSelector) => {
  const lightboxTriggers = container.querySelectorAll("[data-lightbox-trigger]");

  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      const images = Array.from(container.querySelectorAll(imageSelector)).map((image) => ({
        alt: image.alt,
        src: image.currentSrc || image.src
      }));

      if (images.length) {
        openLightbox(images, index);
      }
    });
  });
};

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
});

carousels.forEach((carousel) => {
  bindLightboxTriggers(carousel, ".case-carousel-slide img");
});

lightboxGalleries.forEach((gallery) => {
  bindLightboxTriggers(gallery, "[data-lightbox-trigger] img");
});

const closeLightbox = () => {
  if (!activeLightbox) return;

  activeLightbox.element.remove();
  document.body.classList.remove("has-lightbox");
  activeLightbox = null;
};

const applyLightboxZoom = () => {
  if (!activeLightbox) return;

  const { image, viewport, zoom } = activeLightbox;
  const widthRatio = viewport.clientWidth / image.naturalWidth;
  const heightRatio = viewport.clientHeight / image.naturalHeight;
  const fitRatio = Math.min(widthRatio, heightRatio, 1);
  const baseWidth = Math.round(image.naturalWidth * fitRatio);
  const width = Math.round(baseWidth * zoom);

  image.style.width = `${width}px`;
  image.style.height = "auto";
  image.style.maxWidth = "none";
  image.style.maxHeight = "none";
  viewport.dataset.zoomed = zoom > 1 ? "true" : "false";
  activeLightbox.zoomOutButton.disabled = zoom <= 1;
  activeLightbox.zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
  activeLightbox.zoomResetButton.setAttribute(
    "aria-label",
    `Restablecer zoom. Zoom actual: ${Math.round(zoom * 100)} %`
  );
};

const resetLightboxZoom = (applySize = true) => {
  if (!activeLightbox) return;

  activeLightbox.zoom = 1;
  activeLightbox.viewport.scrollTop = 0;
  activeLightbox.viewport.scrollLeft = 0;
  activeLightbox.viewport.dataset.zoomed = "false";
  activeLightbox.zoomOutButton.disabled = true;
  activeLightbox.zoomResetButton.textContent = "100%";
  activeLightbox.zoomResetButton.setAttribute("aria-label", "Restablecer zoom. Zoom actual: 100 %");

  if (!applySize) {
    activeLightbox.image.style.width = "";
    activeLightbox.image.style.height = "";
    activeLightbox.image.style.maxWidth = "";
    activeLightbox.image.style.maxHeight = "";
    return;
  }

  if (activeLightbox.image.complete && activeLightbox.image.naturalWidth) {
    applyLightboxZoom();
  }
};

const changeLightboxZoom = (delta) => {
  if (!activeLightbox || !activeLightbox.image.naturalWidth) return;

  const nextZoom = Math.max(1, Math.min(4, Number((activeLightbox.zoom + delta).toFixed(2))));

  if (nextZoom === activeLightbox.zoom) return;

  activeLightbox.zoom = nextZoom;
  applyLightboxZoom();
};

const startLightboxDrag = (event) => {
  if (!activeLightbox || activeLightbox.zoom <= 1 || event.button !== 0) return;

  const { viewport } = activeLightbox;
  const startX = event.clientX;
  const startY = event.clientY;
  const startScrollLeft = viewport.scrollLeft;
  const startScrollTop = viewport.scrollTop;

  viewport.dataset.dragging = "true";
  viewport.setPointerCapture(event.pointerId);

  const move = (moveEvent) => {
    viewport.scrollLeft = startScrollLeft - (moveEvent.clientX - startX);
    viewport.scrollTop = startScrollTop - (moveEvent.clientY - startY);
  };

  const stop = () => {
    viewport.dataset.dragging = "false";
    viewport.removeEventListener("pointermove", move);
    viewport.removeEventListener("pointerup", stop);
    viewport.removeEventListener("pointercancel", stop);
  };

  viewport.addEventListener("pointermove", move);
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);
};

const updateLightbox = () => {
  if (!activeLightbox) return;

  const item = activeLightbox.items[activeLightbox.index];
  resetLightboxZoom(false);
  activeLightbox.image.alt = item.alt;
  activeLightbox.caption.textContent = item.alt;
  activeLightbox.image.src = item.src;

  if (activeLightbox.image.complete && activeLightbox.image.naturalWidth) {
    applyLightboxZoom();
  }
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
  lightbox.classList.toggle("is-single", items.length === 1);
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Vista ampliada de páginas del informe");
  lightbox.innerHTML = `
    <button class="lightbox-button lightbox-close" type="button" aria-label="Cerrar vista ampliada">×</button>
    <button class="lightbox-button lightbox-prev" type="button" aria-label="Ver imagen anterior">←</button>
    <figure class="lightbox-figure">
      <div class="lightbox-toolbar" aria-label="Controles de zoom">
        <button class="lightbox-button lightbox-zoom" type="button" aria-label="Alejar imagen" data-lightbox-zoom-out>−</button>
        <button class="lightbox-button lightbox-zoom" type="button" aria-label="Restablecer zoom" data-lightbox-zoom-reset>100%</button>
        <button class="lightbox-button lightbox-zoom" type="button" aria-label="Acercar imagen" data-lightbox-zoom-in>+</button>
      </div>
      <div class="lightbox-viewport">
        <img class="lightbox-image" alt="" draggable="false" />
      </div>
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
    items,
    viewport: lightbox.querySelector(".lightbox-viewport"),
    zoom: 1,
    zoomOutButton: lightbox.querySelector("[data-lightbox-zoom-out]"),
    zoomResetButton: lightbox.querySelector("[data-lightbox-zoom-reset]")
  };

  lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => moveLightbox(-1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => moveLightbox(1));
  lightbox.querySelector("[data-lightbox-zoom-in]")?.addEventListener("click", () => changeLightboxZoom(0.5));
  lightbox.querySelector("[data-lightbox-zoom-out]")?.addEventListener("click", () => changeLightboxZoom(-0.5));
  lightbox.querySelector("[data-lightbox-zoom-reset]")?.addEventListener("click", resetLightboxZoom);
  activeLightbox.viewport.addEventListener("pointerdown", startLightboxDrag);

  activeLightbox.image.addEventListener("load", () => {
    if (!activeLightbox) return;
    applyLightboxZoom();
  });

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

  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    changeLightboxZoom(0.5);
  }

  if (event.key === "-") {
    event.preventDefault();
    changeLightboxZoom(-0.5);
  }

  if (event.key === "0") {
    event.preventDefault();
    resetLightboxZoom();
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
