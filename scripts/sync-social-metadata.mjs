import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { caseStudies, siteOrigin } from "../case-studies.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const SOCIAL_BLOCK_START = "<!-- Social metadata -->";
const SOCIAL_BLOCK_END = "<!-- /Social metadata -->";

const escapeAttribute = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("\"", "&quot;");

const buildSocialBlock = ({ description, pageTitle, pageUrl, caseStudy }) => {
  const imageUrl = new URL(caseStudy.imageSrc, siteOrigin).toString();

  return [
    `    ${SOCIAL_BLOCK_START}`,
    `    <link rel="canonical" href="${escapeAttribute(pageUrl)}" />`,
    '    <meta property="og:locale" content="es_AR" />',
    '    <meta property="og:type" content="article" />',
    '    <meta property="og:site_name" content="Florencia Frumento" />',
    `    <meta property="og:title" content="${escapeAttribute(pageTitle)}" />`,
    `    <meta property="og:description" content="${escapeAttribute(description)}" />`,
    `    <meta property="og:url" content="${escapeAttribute(pageUrl)}" />`,
    `    <meta property="og:image" content="${escapeAttribute(imageUrl)}" />`,
    `    <meta property="og:image:secure_url" content="${escapeAttribute(imageUrl)}" />`,
    `    <meta property="og:image:type" content="${caseStudy.imageType}" />`,
    `    <meta property="og:image:width" content="${caseStudy.imageWidth}" />`,
    `    <meta property="og:image:height" content="${caseStudy.imageHeight}" />`,
    `    <meta property="og:image:alt" content="${escapeAttribute(caseStudy.imageAlt)}" />`,
    '    <meta name="twitter:card" content="summary_large_image" />',
    `    <meta name="twitter:title" content="${escapeAttribute(pageTitle)}" />`,
    `    <meta name="twitter:description" content="${escapeAttribute(description)}" />`,
    `    <meta name="twitter:image" content="${escapeAttribute(imageUrl)}" />`,
    `    <meta name="twitter:image:alt" content="${escapeAttribute(caseStudy.imageAlt)}" />`,
    `    ${SOCIAL_BLOCK_END}`
  ].join("\n");
};

const upsertSocialMetadata = async (caseStudy) => {
  const filePath = resolve(projectRoot, `.${caseStudy.href}`);
  const html = await readFile(filePath, "utf8");
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i);

  if (!titleMatch || !descriptionMatch) {
    throw new Error(`Missing title or description metadata in ${caseStudy.href}`);
  }

  const pageTitle = titleMatch[1];
  const description = descriptionMatch[1];
  const pageUrl = new URL(caseStudy.href, siteOrigin).toString();
  const socialBlock = buildSocialBlock({ description, pageTitle, pageUrl, caseStudy });

  const existingBlockPattern = new RegExp(
    `\\s*${SOCIAL_BLOCK_START}[\\s\\S]*?${SOCIAL_BLOCK_END}`,
    "m"
  );

  const nextHtml = existingBlockPattern.test(html)
    ? html.replace(existingBlockPattern, `\n${socialBlock}`)
    : html.replace(descriptionMatch[0], `${descriptionMatch[0]}\n${socialBlock}`);

  if (nextHtml !== html) {
    await writeFile(filePath, nextHtml);
  }
};

await Promise.all(caseStudies.map(upsertSocialMetadata));
