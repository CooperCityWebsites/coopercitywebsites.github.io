import fs from "node:fs";
import path from "node:path";

const src = "C:/Users/finle/OneDrive/Mods ALL/NeoForge 1.21.1";
const dest = "C:/Users/finle/Projects/game-of-websites/downloads";
const skip = new Set([
  "Create 6.0.10.jar",
  "create-aeronautics-bundled-1.21.1-1.3.2.jar",
  "DistantHorizons-3.3.3-1.21.1-fabric-neoforge.jar",
  "iris-flywheel-compat-NeoForge-2.4.0.jar",
  "iris-neoforge-1.8.14-beta.1+mc1.21.1.jar",
  "sable-neoforge-1.21.1-2.0.6.jar",
  "yappyap-1.0.0.jar"
]);

fs.mkdirSync(dest, { recursive: true });
const mods = [];

for (const name of fs.readdirSync(src)) {
  if (!name.endsWith(".jar") || skip.has(name)) continue;
  const match = name.match(/^(.*)\s+(\d+\.\d+\.\d+)\.jar$/);
  if (!match) continue;
  const from = path.join(src, name);
  fs.copyFileSync(from, path.join(dest, name));
  mods.push({
    name: match[1],
    version: match[2],
    file: name,
    bytes: fs.statSync(from).size
  });
}

mods.sort((a, b) => a.name.localeCompare(b.name, "en"));
fs.writeFileSync(
  "C:/Users/finle/Projects/game-of-websites/mods.json",
  JSON.stringify(mods, null, 2) + "\n"
);
console.log(mods.map((mod) => mod.file).join("\n"));
console.log(mods.length);
