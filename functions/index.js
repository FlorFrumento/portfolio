import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

initializeApp();

const firestore = getFirestore();

const jsonResponse = (response, status, payload) => {
  response.status(status).json(payload);
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const contactForm = onRequest({ cors: false }, async (request, response) => {
  if (request.method !== "POST") {
    response.set("Allow", "POST");
    return jsonResponse(response, 405, { error: "method-not-allowed" });
  }

  const contentType = request.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return jsonResponse(response, 415, { error: "unsupported-media-type" });
  }

  const payload = request.body && typeof request.body === "object" ? request.body : {};
  const honeypot = String(payload.company || "").trim();
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const message = String(payload.message || "").trim();
  const source = String(payload.source || "").trim();

  if (honeypot) {
    return jsonResponse(response, 202, { ok: true });
  }

  if (!name || name.length < 2 || name.length > 100) {
    return jsonResponse(response, 400, { error: "invalid-name" });
  }

  if (!isValidEmail(email) || email.length > 200) {
    return jsonResponse(response, 400, { error: "invalid-email" });
  }

  if (!message || message.length < 10 || message.length > 4000) {
    return jsonResponse(response, 400, { error: "invalid-message" });
  }

  if (!source || source.length > 500) {
    return jsonResponse(response, 400, { error: "invalid-source" });
  }

  try {
    await firestore.collection("contactMessages").add({
      createdAt: FieldValue.serverTimestamp(),
      email,
      message,
      name,
      source
    });

    return jsonResponse(response, 201, { ok: true });
  } catch (error) {
    logger.error("Error saving contact message", error);
    return jsonResponse(response, 500, { error: "internal" });
  }
});
