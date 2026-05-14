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
const externalProjectLinks = document.querySelectorAll('.project-content a[href="#"]');
const siteHeader = document.querySelector(".site-header");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#contact-form-status");

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
