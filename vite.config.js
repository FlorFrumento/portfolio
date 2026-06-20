import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { defineConfig } from "vite";

import { i18nConfig } from "./i18n.config.js";
import { generateLocalizedPages } from "./scripts/i18n/generate-localized-pages.mjs";
import { validateTranslations } from "./scripts/i18n/validate-translations.mjs";

const generatedRoot = ".i18n-build";
const generatedRootPath = resolve(__dirname, generatedRoot);

const toInputName = (pageId, locale) => `${pageId}-${locale}`;

const normalizeRoutePath = (route) => {
  const normalized = route === "/" ? "/" : `/${route.replace(/^\/|\/$/g, "")}/`;
  return normalized;
};

const toGeneratedRequestPath = (route, locale) => {
  const normalizedRoute = route === "/" ? "" : route.replace(/^\/|\/$/g, "");
  const localizedRoute = locale === i18nConfig.defaultLocale
    ? normalizedRoute
    : [normalizedRoute, locale].filter(Boolean).join("/");

  return `/${[generatedRoot, localizedRoute, "index.html"].filter(Boolean).join("/")}`;
};

const createDevRouteMap = () => {
  const routeMap = new Map();

  i18nConfig.pages.forEach((page) => {
    const baseRoute = normalizeRoutePath(page.route);

    i18nConfig.locales.forEach((locale) => {
      const generatedPath = toGeneratedRequestPath(page.route, locale);
      const localizedRoute = locale === i18nConfig.defaultLocale
        ? baseRoute
        : normalizeRoutePath(`${baseRoute}${locale}/`);

      routeMap.set(localizedRoute, generatedPath);

      if (locale === i18nConfig.defaultLocale) {
        routeMap.set(normalizeRoutePath(`${baseRoute}${locale}/`), generatedPath);
      }
    });
  });

  return routeMap;
};

const toInputPath = (route, locale) => {
  const normalizedRoute = route === "/" ? "" : route.replace(/^\/|\/$/g, "");
  const localizedRoute = locale === i18nConfig.defaultLocale
    ? normalizedRoute
    : [normalizedRoute, locale].filter(Boolean).join("/");

  return resolve(__dirname, generatedRoot, localizedRoute, "index.html");
};

const createI18nInputs = () =>
  Object.fromEntries(
    i18nConfig.pages.flatMap((page) =>
      i18nConfig.locales.map((locale) => [toInputName(page.id, locale), toInputPath(page.route, locale)])
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

const createI18nServePlugin = () => ({
  name: "portfolio-i18n-dev-server",
  apply: "serve",
  configureServer(server) {
    const devRouteMap = createDevRouteMap();
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
      const mappedPath = devRouteMap.get(normalizeRoutePath(requestUrl.pathname));

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

  return {
    plugins: [createI18nBuildPlugin(), createI18nServePlugin()],
    server: {
      watch: {
        ignored: [`**/${generatedRoot}/**`]
      }
    },
    build: {
      rollupOptions: {
        input: createI18nInputs()
      }
    }
  };
});
