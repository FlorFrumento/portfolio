export const normalizeRoutePath = (route = "/") =>
  !route || route === "/" ? "/" : `/${route.replace(/^\/|\/$/g, "")}/`;

export const getLocaleFromPathnameForConfig = (pathname = "/", config) => {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments.at(0);

  return config.locales.includes(firstSegment) ? firstSegment : config.defaultLocale;
};

export const stripLocaleFromPathnameForConfig = (pathname = "/", config) => {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments.at(0);

  if (config.locales.includes(firstSegment)) {
    segments.shift();
  }

  return `/${segments.join("/")}${segments.length ? "/" : ""}`;
};

export const getRouteSlug = (routeId, locale, routeTranslations, config) =>
  routeTranslations[locale]?.[routeId] ?? routeTranslations[config.defaultLocale]?.[routeId] ?? "";

export const getLocalizedPagePath = (routeId, locale, routeTranslations, config, options = {}) => {
  const currentLocale = config.locales.includes(locale) ? locale : config.defaultLocale;
  const explicit = options.explicit === true;
  const slug = getRouteSlug(routeId, currentLocale, routeTranslations, config);

  if (currentLocale === config.defaultLocale && !explicit) {
    return normalizeRoutePath(slug ? `/${slug}/` : "/");
  }

  return normalizeRoutePath(`/${[currentLocale, slug].filter(Boolean).join("/")}/`);
};

export const getLocalizedHashPath = (hash = "", locale, routeTranslations, config, options = {}) => {
  const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;
  return `${getLocalizedPagePath("home", locale, routeTranslations, config, options)}${normalizedHash}`;
};

export const getPageByPathname = (pathname = "/", pages, routeTranslations, config) => {
  const locale = getLocaleFromPathnameForConfig(pathname, config);
  const strippedPath = normalizeRoutePath(stripLocaleFromPathnameForConfig(pathname, config));

  return pages.find((page) => normalizeRoutePath(getRouteSlug(page.id, locale, routeTranslations, config)) === strippedPath) ?? null;
};

export const getCanonicalPathname = (pathname = "/", pages, routeTranslations, config) => {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments.at(0);
  const hasExplicitLocale = config.locales.includes(firstSegment);
  const locale = hasExplicitLocale ? firstSegment : config.defaultLocale;
  const strippedPath = normalizeRoutePath(stripLocaleFromPathnameForConfig(pathname, config));

  const localizedRoutes = pages.map((page) => ({
    page,
    path: normalizeRoutePath(getRouteSlug(page.id, locale, routeTranslations, config))
  }));

  const exactMatch = localizedRoutes.find(({ path }) => path === strippedPath);

  if (exactMatch) {
    return getLocalizedPagePath(exactMatch.page.id, locale, routeTranslations, config, { explicit: hasExplicitLocale });
  }

  const nearestMatch = localizedRoutes
    .filter(({ path }) => path !== "/" && strippedPath.startsWith(path))
    .sort((left, right) => right.path.length - left.path.length)[0];

  if (nearestMatch) {
    return getLocalizedPagePath(nearestMatch.page.id, locale, routeTranslations, config, { explicit: hasExplicitLocale });
  }

  return getLocalizedPagePath("home", locale, routeTranslations, config, { explicit: hasExplicitLocale });
};
