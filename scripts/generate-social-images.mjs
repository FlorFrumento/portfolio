import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { caseStudies } from "../case-studies.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const runConvert = (args) => {
  const result = spawnSync("convert", args, {
    cwd: projectRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || `convert failed with status ${result.status}`);
  }
};

const ensureParentDir = (filePath) => {
  mkdirSync(dirname(filePath), { recursive: true });
};

for (const caseStudy of caseStudies) {
  if (!caseStudy.socialImageSrc) continue;

  const sourcePath = resolve(projectRoot, `public${caseStudy.imageSrc}`);
  const targetPath = resolve(projectRoot, `public${caseStudy.socialImageSrc}`);

  ensureParentDir(targetPath);

  runConvert([
    sourcePath,
    "-resize",
    "1200x630",
    "-background",
    "#f7f1e8",
    "-gravity",
    "center",
    "-extent",
    "1200x630",
    "-strip",
    "-interlace",
    "Plane",
    "-sampling-factor",
    "4:2:0",
    "-quality",
    "88",
    targetPath
  ]);
}
