import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { i18nConfig, siteOrigin } from "../../i18n.config.js";

const generatedRoot = ".i18n-build";
const tokenPattern = /\{\{\s*([a-zA-Z0-9._-]+)\s*\}\}/g;

const deepMerge = (base, override) => {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override ?? base;
  }

  if (typeof base !== "object" || base === null) {
    return override ?? base;
  }

  if (typeof override !== "object" || override === null) {
    return override ?? base;
  }

  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  return Object.fromEntries(
    [...keys].map((key) => [key, deepMerge(base[key], override[key])])
  );
};

const getValue = (object, dottedPath) =>
  dottedPath.split(".").reduce((current, segment) => current?.[segment], object);

const serializeTokenValue = (value) => {
  if (Array.isArray(value)) {
    return value.join("");
  }

  if (value === undefined || value === null) {
    return value;
  }

  return String(value);
};

const loadJson = async (rootDir, relativePath) => {
  const fullPath = path.join(rootDir, relativePath);

  try {
    const content = await readFile(fullPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
};

const loadJsonTree = async (rootDir, relativePath) => {
  const absolutePath = path.join(rootDir, relativePath);

  try {
    const entries = await readdir(absolutePath, { withFileTypes: true });
    const pairs = await Promise.all(entries.map(async (entry) => {
      if (entry.isDirectory()) {
        return [entry.name, await loadJsonTree(rootDir, path.join(relativePath, entry.name))];
      }

      if (!entry.name.endsWith(".json")) {
        return null;
      }

      const key = entry.name.replace(/\.json$/, "");
      return [key, await loadJson(rootDir, path.join(relativePath, entry.name))];
    }));

    return Object.fromEntries(pairs.filter(Boolean));
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }

    throw error;
  }
};

const localizeRoute = (route, locale) => {
  const [pathname, hash = ""] = route.split("#");
  const normalized = pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
  const localizedPath = locale === i18nConfig.defaultLocale
    ? `/${normalized}${normalized ? "/" : ""}`
    : `/${[normalized, locale].filter(Boolean).join("/")}/`;

  return hash ? `${localizedPath}#${hash}` : localizedPath;
};

const buildAbsoluteUrl = (route, locale) => new URL(localizeRoute(route, locale), siteOrigin).toString();

const toGeneratedRelativePath = (route, locale) => {
  const localized = localizeRoute(route, locale);
  const trimmed = localized.replace(/^\/|\/$/g, "");
  return path.join(generatedRoot, trimmed, "index.html");
};

const buildAlternateLinks = (page) => {
  const alternates = i18nConfig.locales
    .map((locale) => `<link rel="alternate" hreflang="${locale}" href="${buildAbsoluteUrl(page.route, locale)}" />`)
    .join("\n    ");

  return `${alternates}\n    <link rel="alternate" hreflang="x-default" href="${buildAbsoluteUrl(page.route, i18nConfig.defaultLocale)}" />`;
};

const toLegacyRoutePath = (page) => {
  if (page.source === "index.html") return "/";
  if (page.source.endsWith("/index.html")) {
    return `/${page.source.replace(/\/index\.html$/, "/")}`;
  }

  return `/${page.source}`;
};

const buildHeaderMarkup = (dictionary, locale, page) => {
  const header = dictionary.shared.header;
  const navItems = [
    { href: localizeRoute("/#casos", locale), label: header.nav.cases },
    { href: localizeRoute("/#experiencia", locale), label: header.nav.experience },
    { href: localizeRoute("/#enfoque", locale), label: header.nav.approach, className: "desktop-only" },
    { href: localizeRoute("/#contacto", locale), label: header.nav.contact },
    { href: localizeRoute("/sobre-mi/", locale), label: header.nav.about, currentPage: "about" }
  ];

  const links = navItems.map((item) => {
    const className = item.className ? ` class="${item.className}"` : "";
    const ariaCurrent = item.currentPage && item.currentPage === page.pageKey ? ' aria-current="page"' : "";

    return `<a href="${item.href}"${className}${ariaCurrent}>${item.label}</a>`;
  }).join("");

  const localizedPageRoute = locale === i18nConfig.defaultLocale
    ? page.route
    : localizeRoute(page.route, locale);
  const explicitEsHref = localizeRoute(page.route, "es");
  const explicitEnHref = localizeRoute(page.route, "en");

  return `<div class="header-inner">
      <a class="brand" href="${localizeRoute("/#inicio", locale)}" aria-label="${header.brandAriaLabel}">
        <span>${header.brand}</span>
      </a>
      <div class="header-controls">
        <nav class="main-nav" aria-label="${header.navAriaLabel}">
          ${links}
        </nav>
        <div class="locale-switcher" aria-label="${header.localeSwitcherLabel}" data-locale-switcher data-page-route="${page.route}" data-current-path="${localizedPageRoute}">
          <a href="${explicitEsHref}" hreflang="es" lang="es" data-locale-link="es"${locale === "es" ? ' aria-current="true"' : ""}>${header.locales.es}</a>
          <a href="${explicitEnHref}" hreflang="en" lang="en" data-locale-link="en"${locale === "en" ? ' aria-current="true"' : ""}>${header.locales.en}</a>
        </div>
      </div>
    </div>`;
};

const replaceHeader = (html, dictionary, locale, page) =>
  html.replace(
    /<header([^>]*data-site-header[^>]*)>[\s\S]*?<\/header>/,
    `<header$1>${buildHeaderMarkup(dictionary, locale, page)}</header>`
  );

const replaceSeoTags = (html, page, locale) => {
  const localeMeta = i18nConfig.localeMeta[locale];
  const canonicalUrl = buildAbsoluteUrl(page.route, locale);
  let nextHtml = html.replace(/<html lang="[^"]+">/, `<html lang="${localeMeta.htmlLang}">`);

  nextHtml = nextHtml.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  nextHtml = nextHtml.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  nextHtml = nextHtml.replace(/<meta name="twitter:url" content="[^"]*" \/>/, `<meta name="twitter:url" content="${canonicalUrl}" />`);
  nextHtml = nextHtml.replace(/<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${localeMeta.ogLocale}" />`);

  if (!nextHtml.includes('rel="canonical"')) {
    nextHtml = nextHtml.replace("</head>", `    <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
  }

  if (!nextHtml.includes('hreflang="x-default"')) {
    nextHtml = nextHtml.replace("</head>", `    ${buildAlternateLinks(page)}\n  </head>`);
  }

  return nextHtml;
};

const replaceLocalizedRoutes = (html, locale) => {
  let nextHtml = html
    .replace(/href="\/#([^"]+)"/g, (_, hash) => `href="${localizeRoute(`/#${hash}`, locale)}"`)
    .replace(/href='\/#([^']+)'/g, (_, hash) => `href='${localizeRoute(`/#${hash}`, locale)}'`);

  for (const page of i18nConfig.pages) {
    const legacyPath = toLegacyRoutePath(page);
    const localizedPath = localizeRoute(page.route, locale);
    const absoluteLegacyPath = new URL(legacyPath, siteOrigin).toString();
    const absoluteLocalizedPath = buildAbsoluteUrl(page.route, locale);

    nextHtml = nextHtml.replaceAll(`href="${legacyPath}"`, `href="${localizedPath}"`);
    nextHtml = nextHtml.replaceAll(`href="${absoluteLegacyPath}"`, `href="${absoluteLocalizedPath}"`);
    nextHtml = nextHtml.replaceAll(`href='${legacyPath}'`, `href='${localizedPath}'`);
    nextHtml = nextHtml.replaceAll(`href='${absoluteLegacyPath}'`, `href='${absoluteLocalizedPath}'`);
  }

  return nextHtml;
};

const replaceTokens = (html, dictionary, page) =>
  html.replace(tokenPattern, (match, key) => {
    const scopedValue = getValue(dictionary, key);
    if (scopedValue !== undefined) {
      return serializeTokenValue(scopedValue);
    }

    const pageScope = getValue(dictionary.pages, page.pageKey);
    const pageValue = getValue(pageScope, key);
    if (pageValue !== undefined) {
      return serializeTokenValue(pageValue);
    }

    throw new Error(`Missing translation key "${key}" in page "${page.id}".`);
  });

const createDictionary = async (rootDir, locale) => {
  const [defaultShared, localeShared, defaultRuntime, localeRuntime, defaultCaseStudies, localeCaseStudies, defaultPages, localePages] = await Promise.all([
    loadJson(rootDir, `translations/${i18nConfig.defaultLocale}/shared.json`),
    loadJson(rootDir, `translations/${locale}/shared.json`),
    loadJson(rootDir, `translations/${i18nConfig.defaultLocale}/runtime.json`),
    loadJson(rootDir, `translations/${locale}/runtime.json`),
    loadJson(rootDir, `translations/${i18nConfig.defaultLocale}/case-studies.json`),
    loadJson(rootDir, `translations/${locale}/case-studies.json`),
    loadJsonTree(rootDir, `translations/${i18nConfig.defaultLocale}/pages`),
    loadJsonTree(rootDir, `translations/${locale}/pages`)
  ]);

  return {
    shared: deepMerge(defaultShared.shared ?? defaultShared, localeShared.shared ?? localeShared),
    runtime: deepMerge(defaultRuntime, localeRuntime),
    caseStudies: deepMerge(defaultCaseStudies, localeCaseStudies),
    pages: deepMerge(defaultPages, localePages)
  };
};

export const generateLocalizedPages = async (rootDir) => {
  const absoluteGeneratedRoot = path.join(rootDir, generatedRoot);
  await rm(absoluteGeneratedRoot, { force: true, recursive: true });
  await mkdir(path.join(rootDir, "public"), { recursive: true });
  await copyFile(path.join(rootDir, "styles.css"), path.join(rootDir, "public", "styles.css"));

  for (const locale of i18nConfig.locales) {
    const dictionary = await createDictionary(rootDir, locale);

    for (const page of i18nConfig.pages) {
      const sourcePath = path.join(rootDir, page.source);
      const outputPath = path.join(rootDir, toGeneratedRelativePath(page.route, locale));
      const sourceHtml = await readFile(sourcePath, "utf8");
      const withTokens = replaceTokens(sourceHtml, dictionary, page);
      const withLocalizedRoutes = replaceLocalizedRoutes(withTokens, locale);
      const withHeader = replaceHeader(withLocalizedRoutes, dictionary, locale, page);
      const withSeo = replaceSeoTags(withHeader, page, locale);
      const withStaticStyles = withSeo.replace(/href="\.\.\/styles\.css"|href="styles\.css"/g, 'href="/styles.css"');
      const finalHtml = withStaticStyles.replace(
        /<script type="module" src="([^"]*script\.js)"><\/script>/,
        `<script type="module" src="${page.scriptSrc}"></script>`
      );

      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, finalHtml);
    }
  }
};
