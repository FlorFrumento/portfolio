import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { defineConfig } from "vite";

import { i18nConfig } from "./i18n.config.js";
import { getCanonicalPathname, getLocalizedPagePath, normalizeRoutePath } from "./route-utils.js";
import { generateLocalizedPages } from "./scripts/i18n/generate-localized-pages.mjs";
import { validateTranslations } from "./scripts/i18n/validate-translations.mjs";

const generatedRoot = ".i18n-build";
const generatedRootPath = resolve(__dirname, generatedRoot);

const toInputName = (pageId, locale) => `${pageId}-${locale}`;
const loadJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const toGeneratedRequestPath = (pageId, locale, routeTranslations, options = {}) => {
  const localizedRoute = getLocalizedPagePath(pageId, locale, routeTranslations, i18nConfig, options)
    .replace(/^\/|\/$/g, "");

  return `/${[generatedRoot, localizedRoute, "index.html"].filter(Boolean).join("/")}`;
};

const createDevRouteMap = (routeTranslations) => {
  const routeMap = new Map();

  i18nConfig.pages.forEach((page) => {
    i18nConfig.locales.forEach((locale) => {
      const explicitVariants = locale === i18nConfig.defaultLocale ? [false, true] : [true];

      explicitVariants.forEach((explicit) => {
        routeMap.set(
          normalizeRoutePath(getLocalizedPagePath(page.id, locale, routeTranslations, i18nConfig, { explicit })),
          toGeneratedRequestPath(page.id, locale, routeTranslations, { explicit })
        );
      });
    });
  });

  return routeMap;
};

const toInputPath = (pageId, locale, routeTranslations, options = {}) => {
  const localizedRoute = getLocalizedPagePath(pageId, locale, routeTranslations, i18nConfig, options)
    .replace(/^\/|\/$/g, "");

  return resolve(__dirname, generatedRoot, localizedRoute, "index.html");
};

const createI18nInputs = (routeTranslations) =>
  Object.fromEntries(
    i18nConfig.pages.flatMap((page) =>
      i18nConfig.locales.flatMap((locale) => {
        const explicitVariants = locale === i18nConfig.defaultLocale ? [false, true] : [true];

        return explicitVariants.map((explicit) => [
          `${toInputName(page.id, locale)}${explicit ? "-explicit" : "-default"}`,
          toInputPath(page.id, locale, routeTranslations, { explicit })
        ]);
      })
    )
  );

const createI18nBuildPlugin = () => ({
  name: "portfolio-i18n-generator",
  apply: "build",
  async buildStart() {
    await validateTranslations(__dirname);
    await generateLocalizedPages(__dirname);
  }
});

const createI18nServePlugin = (routeTranslations) => ({
  name: "portfolio-i18n-dev-server",
  apply: "serve",
  configureServer(server) {
    const devRouteMap = createDevRouteMap(routeTranslations);
    let regeneration = Promise.resolve();

    const regenerate = async () => {
      regeneration = regeneration.then(async () => {
        await validateTranslations(__dirname);
        await generateLocalizedPages(__dirname);
        server.ws.send({ type: "full-reload" });
      });

      return regeneration;
    };

    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.headers.accept?.includes("text/html")) {
        next();
        return;
      }

      const requestUrl = new URL(req.url, "http://localhost");
      const canonicalPath = getCanonicalPathname(requestUrl.pathname, i18nConfig.pages, routeTranslations, i18nConfig);

      if (canonicalPath !== requestUrl.pathname) {
        res.statusCode = 302;
        res.setHeader("Location", `${canonicalPath}${requestUrl.search}${requestUrl.hash}`);
        res.end();
        return;
      }

      const mappedPath = devRouteMap.get(normalizeRoutePath(canonicalPath));

      if (!mappedPath) {
        next();
        return;
      }

      try {
        const filePath = resolve(__dirname, `.${mappedPath}`);
        const html = await readFile(filePath, "utf8");
        const transformedHtml = await server.transformIndexHtml(requestUrl.pathname, html, req.originalUrl);

        res.setHeader("Content-Type", "text/html");
        res.end(transformedHtml);
      } catch (error) {
        next(error);
      }
    });

    const watchedGlobs = [
      "translations/**/*.json",
      "casos/**/*.html",
      "sobre-mi/**/*.html",
      "index.html",
      "i18n.config.js"
    ];

    watchedGlobs.forEach((glob) => server.watcher.add(resolve(__dirname, glob)));
    server.watcher.on("change", async (changedFile) => {
      if (changedFile.startsWith(generatedRootPath)) {
        return;
      }

      if (
        changedFile.includes(`${resolve(__dirname, "translations")}`) ||
        changedFile.endsWith(".html") ||
        changedFile.endsWith("i18n.config.js")
      ) {
        server.config.logger.info(`[i18n] regenerated after ${relative(__dirname, changedFile)}`, {
          clear: false,
          timestamp: true
        });
        await regenerate();
      }
    });
  }
});

export default defineConfig(async () => {
  await validateTranslations(__dirname);
  await generateLocalizedPages(__dirname);
  const routeTranslations = Object.fromEntries(await Promise.all(
    i18nConfig.locales.map(async (locale) => [
      locale,
      await loadJson(resolve(__dirname, "translations", locale, "routes.json"))
    ])
  ));

  return {
    plugins: [createI18nBuildPlugin(), createI18nServePlugin(routeTranslations)],
    server: {
      watch: {
        ignored: [`**/${generatedRoot}/**`]
      }
    },
    build: {
      rollupOptions: {
        input: createI18nInputs(routeTranslations)
      }
    }
  };
});
