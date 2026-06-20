import { i18nConfig, siteOrigin } from "./i18n.config.js";
import { caseStudyCatalog } from "./case-studies.js";

import esCaseStudies from "./translations/es/case-studies.json";
import enCaseStudies from "./translations/en/case-studies.json";
import esRuntime from "./translations/es/runtime.json";
import enRuntime from "./translations/en/runtime.json";

const localeResources = {
  es: {
    caseStudies: esCaseStudies,
    runtime: esRuntime
  },
  en: {
    caseStudies: enCaseStudies,
    runtime: enRuntime
  }
};

export { i18nConfig, siteOrigin };

export const getLocaleFromPathname = (pathname = "/") => {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  return i18nConfig.locales.includes(lastSegment) ? lastSegment : i18nConfig.defaultLocale;
};

export const stripLocaleFromPathname = (pathname = "/") => {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (i18nConfig.locales.includes(lastSegment)) {
    segments.pop();
  }

  return `/${segments.join("/")}${segments.length ? "/" : ""}`;
};

export const localizePath = (route, locale, options = {}) => {
  const currentLocale = i18nConfig.locales.includes(locale) ? locale : i18nConfig.defaultLocale;
  const [pathname, hash = ""] = route.split("#");
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
  const explicit = options.explicit === true;

  const localizedPath = currentLocale === i18nConfig.defaultLocale && !explicit
    ? `/${normalizedPath}${normalizedPath ? "/" : ""}`
    : `/${[normalizedPath, currentLocale].filter(Boolean).join("/")}/`;

  return hash ? `${localizedPath}#${hash}` : localizedPath;
};

export const normalizeContentPath = (pathname = "/") =>
  stripLocaleFromPathname(pathname).replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";

export const getRuntimeStrings = (locale) =>
  localeResources[locale]?.runtime ?? localeResources[i18nConfig.defaultLocale].runtime;

export const getCaseStudies = (locale) => {
  const translations = localeResources[locale]?.caseStudies ?? localeResources[i18nConfig.defaultLocale].caseStudies;

  return caseStudyCatalog.map((caseStudy) => ({
    ...caseStudy,
    ...translations[caseStudy.id],
    href: localizePath(caseStudy.route, locale)
  }));
};
