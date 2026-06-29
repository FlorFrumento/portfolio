import { i18nConfig, siteOrigin } from "./i18n.config.js";
import { getLocalizedHash, translateHashForLocale } from "./hash-utils.js";
import {
  getCanonicalPathname,
  getLocaleFromPathnameForConfig,
  getLocalizedHashPath,
  getLocalizedPagePath,
  getPageByPathname,
  stripLocaleFromPathnameForConfig
} from "./route-utils.js";
import { caseStudyCatalog } from "./case-studies.js";

import esCaseStudies from "./translations/es/case-studies.json";
import enCaseStudies from "./translations/en/case-studies.json";
import esRoutes from "./translations/es/routes.json";
import enRoutes from "./translations/en/routes.json";
import esRuntime from "./translations/es/runtime.json";
import enRuntime from "./translations/en/runtime.json";

const localeResources = {
  es: {
    caseStudies: esCaseStudies,
    routes: esRoutes,
    runtime: esRuntime
  },
  en: {
    caseStudies: enCaseStudies,
    routes: enRoutes,
    runtime: enRuntime
  }
};

const routeTranslations = {
  es: esRoutes,
  en: enRoutes
};

const runtimeTranslations = {
  es: esRuntime,
  en: enRuntime
};

export { i18nConfig, siteOrigin };

export const getLocaleFromPathname = (pathname = "/") =>
  getLocaleFromPathnameForConfig(pathname, i18nConfig);

export const stripLocaleFromPathname = (pathname = "/") =>
  stripLocaleFromPathnameForConfig(pathname, i18nConfig);

export const localizePath = (route, locale, options = {}) => {
  const currentLocale = i18nConfig.locales.includes(locale) ? locale : i18nConfig.defaultLocale;
  const [pathname, hash = ""] = route.split("#");
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/^\/|\/$/g, "");
  const explicit = options.explicit === true;

  const localizedPath = currentLocale === i18nConfig.defaultLocale && !explicit
    ? `/${normalizedPath}${normalizedPath ? "/" : ""}`
    : `/${[currentLocale, normalizedPath].filter(Boolean).join("/")}/`;

  return hash ? `${localizedPath}#${hash}` : localizedPath;
};

export const normalizeContentPath = (pathname = "/") =>
  stripLocaleFromPathname(pathname).replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";

export const getLocalizedRoute = (routeId, locale, options = {}) =>
  getLocalizedPagePath(routeId, locale, routeTranslations, i18nConfig, options);

export const getLocalizedHomeHash = (sectionKey, locale, options = {}) =>
  getLocalizedHashPath(
    getLocalizedHash(sectionKey, locale, runtimeTranslations, i18nConfig.defaultLocale),
    locale,
    routeTranslations,
    i18nConfig,
    options
  );

export const localizeHash = (hash, locale) =>
  translateHashForLocale(hash, locale, runtimeTranslations, i18nConfig.defaultLocale);

export const getPageIdFromPathname = (pathname = "/") =>
  getPageByPathname(pathname, i18nConfig.pages, routeTranslations, i18nConfig)?.id ?? null;

export const getCanonicalPagePath = (pathname = "/") =>
  getCanonicalPathname(pathname, i18nConfig.pages, routeTranslations, i18nConfig);

export const getRuntimeStrings = (locale) =>
  localeResources[locale]?.runtime ?? localeResources[i18nConfig.defaultLocale].runtime;

export const getCaseStudies = (locale) => {
  const translations = localeResources[locale]?.caseStudies ?? localeResources[i18nConfig.defaultLocale].caseStudies;

  return caseStudyCatalog.map((caseStudy) => ({
    ...caseStudy,
    ...translations[caseStudy.id],
    href: getLocalizedRoute(caseStudy.routeId, locale)
  }));
};
