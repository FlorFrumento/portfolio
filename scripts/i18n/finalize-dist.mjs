import { cp, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const distRoot = resolve(projectRoot, "dist");
const generatedRoot = resolve(distRoot, ".i18n-build");
const generatedSourceRoot = resolve(projectRoot, ".i18n-build");

try {
  const entries = await readdir(generatedRoot, { withFileTypes: true });

  await Promise.all(entries.map((entry) => {
    const source = resolve(generatedRoot, entry.name);
    const target = resolve(distRoot, entry.name);
    return cp(source, target, { recursive: true, force: true });
  }));

  await rm(generatedRoot, { recursive: true, force: true });

  await rm(generatedSourceRoot, { recursive: true, force: true });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
