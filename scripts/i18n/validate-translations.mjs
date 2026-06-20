import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { i18nConfig } from "../../i18n.config.js";

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const loadJsonTree = async (directoryPath) => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const pairs = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return [entry.name, await loadJsonTree(absolutePath)];
    }

    if (!entry.name.endsWith(".json")) {
      return null;
    }

    return [entry.name.replace(/\.json$/, ""), await loadJson(absolutePath)];
  }));

  return Object.fromEntries(pairs.filter(Boolean));
};

const describeType = (value) => {
  if (Array.isArray(value)) return "array";
  if (isObject(value)) return "object";
  return typeof value;
};

const htmlTagPattern = /<[^>]+>/;

const allowsHtml = (currentPath) => currentPath.includes("Html");

const compareNodes = (reference, candidate, currentPath, errors) => {
  if (candidate === undefined) {
    errors.push(`Missing key: ${currentPath}`);
    return;
  }

  const referenceType = describeType(reference);
  const candidateType = describeType(candidate);

  if (referenceType !== candidateType) {
    errors.push(`Type mismatch at ${currentPath}: expected ${referenceType}, got ${candidateType}`);
    return;
  }

  if (typeof reference === "string") {
    if (!candidate.trim()) {
      errors.push(`Empty string at ${currentPath}`);
    }

    if (!allowsHtml(currentPath) && htmlTagPattern.test(candidate)) {
      errors.push(`HTML is not allowed in plain-text translation field ${currentPath}`);
    }
    return;
  }

  if (Array.isArray(reference)) {
    if (reference.length !== candidate.length) {
      errors.push(`Array length mismatch at ${currentPath}: expected ${reference.length}, got ${candidate.length}`);
    }

    reference.forEach((item, index) => {
      compareNodes(item, candidate[index], `${currentPath}[${index}]`, errors);
    });
    return;
  }

  if (isObject(reference)) {
    Object.keys(reference).forEach((key) => {
      compareNodes(reference[key], candidate[key], `${currentPath}.${key}`, errors);
    });
  }
};

export const validateTranslations = async (rootDir) => {
  const referenceLocale = i18nConfig.defaultLocale;
  const localeRoots = Object.fromEntries(await Promise.all(
    i18nConfig.locales.map(async (locale) => [locale, await loadJsonTree(path.join(rootDir, "translations", locale))])
  ));

  const referenceTree = localeRoots[referenceLocale];
  const allErrors = [];

  i18nConfig.locales
    .filter((locale) => locale !== referenceLocale)
    .forEach((locale) => {
      compareNodes(referenceTree, localeRoots[locale], locale, allErrors);
    });

  if (allErrors.length) {
    throw new Error(`Translation validation failed:\n- ${allErrors.join("\n- ")}`);
  }
};
