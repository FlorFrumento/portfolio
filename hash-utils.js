export const defaultSectionHashes = {
  home: "inicio",
  cases: "casos",
  experience: "experiencia",
  approach: "enfoque",
  contact: "contacto"
};

const normalizeHash = (hash = "") => hash.replace(/^#/, "");

export const getSectionHashesForLocale = (locale, runtimeTranslations, defaultLocale) => ({
  ...defaultSectionHashes,
  ...(runtimeTranslations[defaultLocale]?.hashes ?? {}),
  ...(runtimeTranslations[locale]?.hashes ?? {})
});

export const getLocalizedHash = (sectionKey, locale, runtimeTranslations, defaultLocale) => {
  const hashes = getSectionHashesForLocale(locale, runtimeTranslations, defaultLocale);
  const value = hashes[sectionKey] ?? normalizeHash(sectionKey);

  return `#${value}`;
};

export const getSectionKeyFromHash = (hash, runtimeTranslations, defaultLocale) => {
  const normalizedHash = normalizeHash(hash);
  if (!normalizedHash) return null;

  const locales = Object.keys(runtimeTranslations);

  for (const locale of locales) {
    const hashes = getSectionHashesForLocale(locale, runtimeTranslations, defaultLocale);
    const match = Object.entries(hashes).find(([, value]) => value === normalizedHash);

    if (match) {
      return match[0];
    }
  }

  return Object.entries(defaultSectionHashes).find(([, value]) => value === normalizedHash)?.[0] ?? null;
};

export const translateHashForLocale = (hash, locale, runtimeTranslations, defaultLocale) => {
  if (!hash) return "";

  const sectionKey = getSectionKeyFromHash(hash, runtimeTranslations, defaultLocale);
  if (!sectionKey) {
    return hash.startsWith("#") ? hash : `#${hash}`;
  }

  return getLocalizedHash(sectionKey, locale, runtimeTranslations, defaultLocale);
};
