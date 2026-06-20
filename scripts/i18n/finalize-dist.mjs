import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { i18nConfig } from "../../i18n.config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const distRoot = resolve(projectRoot, "dist");
const generatedRoot = resolve(distRoot, ".i18n-build");
const generatedSourceRoot = resolve(projectRoot, ".i18n-build");

const toRouteDir = (route, locale) => {
  const normalizedRoute = route === "/" ? "" : route.replace(/^\/|\/$/g, "");
  return resolve(
    distRoot,
    ...[normalizedRoute, locale].filter(Boolean).join("/").split("/").filter(Boolean)
  );
};

try {
  const entries = await readdir(generatedRoot, { withFileTypes: true });

  await Promise.all(entries.map((entry) => {
    const source = resolve(generatedRoot, entry.name);
    const target = resolve(distRoot, entry.name);
    return cp(source, target, { recursive: true, force: true });
  }));

  await rm(generatedRoot, { recursive: true, force: true });

  await Promise.all(i18nConfig.pages.map(async (page) => {
    const defaultRouteDir = toRouteDir(page.route, "");
    const explicitDefaultLocaleDir = toRouteDir(page.route, i18nConfig.defaultLocale);
    await mkdir(explicitDefaultLocaleDir, { recursive: true });

    return cp(
      resolve(defaultRouteDir, "index.html"),
      resolve(explicitDefaultLocaleDir, "index.html"),
      { force: true }
    );
  }));

  await rm(generatedSourceRoot, { recursive: true, force: true });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
