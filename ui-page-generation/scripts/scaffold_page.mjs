#!/usr/bin/env node
// 在 Figma 插件工程里新增一个页面生成器：建文件 → 注册 build.mjs → 加 UI 按钮 → 加消息处理 → 构建 → 同步安装目录
// 用法：
//   node scaffold_page.mjs --src <项目镜像目录> --id <page-id> --title "<帧名>" --button "<按钮文案>" [--dest <安装目录>] [--dry-run]
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, "..", "assets", "page-template.js");

function arg(name, def) {
  const i = process.argv.indexOf("--" + name);
  return i > -1 ? process.argv[i + 1] : def;
}
const DRY = process.argv.includes("--dry-run");
const SRC = resolve(arg("src", "D:/3.AI assistant/1.Codex/1.Project_英语APP/交付/Figma插件/ai-agent-prototype-kit"));
const DEST = arg("dest", "");
const ID = arg("id", "");
const TITLE = arg("title", "");
const PREFIX = arg("prefix", TITLE);
const BUTTON = arg("button", "生成 " + TITLE);

if (!ID || !TITLE) {
  console.error("必须提供 --id 与 --title\n" +
    "例：node scaffold_page.mjs --id agent-config-v4 --title \"02-01 v4｜Agent 配置\" --button \"⑦ 生成 02-01 v4\"");
  process.exit(2);
}
const FUNC = "gen" + ID.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
const pagesDir = join(SRC, "src", "pages");
const pageFile = join(pagesDir, ID + ".js");
if (existsSync(pageFile)) {
  console.error("已存在：" + pageFile + "（请换 --id 或直接改该文件）");
  process.exit(2);
}
console.log("页面文件 :", pageFile);
console.log("生成函数 :", FUNC);
console.log("清理前缀 :", PREFIX);
if (DRY) { console.log("--dry-run：未写入任何文件"); process.exit(0); }

// 1) 页面生成器
mkdirSync(pagesDir, { recursive: true });
const tpl = readFileSync(TEMPLATE, "utf8")
  .replaceAll("{{ID}}", ID)
  .replaceAll("{{FUNC}}", FUNC)
  .replaceAll("{{TITLE}}", TITLE);
writeFileSync(pageFile, tpl, "utf8");

// 2) 注册到 build.mjs（插在 main.js 前）
const buildPath = join(SRC, "build.mjs");
let build = readFileSync(buildPath, "utf8");
const rel = `"src/pages/${ID}.js"`;
if (!build.includes(rel)) {
  build = build.replace(/\s*"src\/main\.js"/, `,\n               ${rel}, "src/main.js"`);
  writeFileSync(buildPath, build, "utf8");
}

// 3) UI 按钮
const uiPath = join(SRC, "ui.html");
let ui = readFileSync(uiPath, "utf8");
if (!ui.includes(`id="${ID}"`)) {
  ui = ui.replace(/(\s*)<div class="row">\s*\n(\s*)<button id="locateFinal"/,
    `$1<div class="row">\n$1  <button class="primary" id="${ID}">${BUTTON}</button>\n$1</div>$1<div class="row">\n$2<button id="locateFinal"`);
  ui = ui.replace(/(\s*)document\.getElementById\("locateFinal"\)/,
    `$1document.getElementById("${ID}").onclick = function () {\n` +
    `$1  logEl.textContent = "正在生成 ${TITLE}…";\n` +
    `$1  parent.postMessage({ pluginMessage: { type: "${ID}" } }, "*");\n$1};\n$1document.getElementById("locateFinal")`);
  writeFileSync(uiPath, ui, "utf8");
}

// 4) main.js 消息处理
const mainPath = join(SRC, "src", "main.js");
let main = readFileSync(mainPath, "utf8");
if (!main.includes(`msg.type === "${ID}"`)) {
  main = main.replace(/(\s*)\} else if \(msg\.type === "locateFinal"\)/,
    `$1} else if (msg.type === "${ID}") {\n` +
    `$1  var rm = removeGenerated("${PREFIX}");\n` +
    `$1  var f = await ${FUNC}();\n` +
    `$1  log("已生成：" + f.name + "（x=" + Math.round(f.x) + "）" + (rm ? "，已替换旧帧 " + rm + " 个" : ""));\n` +
    `$1} else if (msg.type === "locateFinal")`);
  writeFileSync(mainPath, main, "utf8");
}

// 5) 构建
execFileSync(process.execPath, ["build.mjs"], { cwd: SRC, stdio: "inherit" });
execFileSync(process.execPath, ["--check", "code.js"], { cwd: SRC, stdio: "inherit" });

// 6) 同步安装目录
if (DEST && existsSync(DEST)) {
  for (const f of ["code.js", "ui.html", "build.mjs"]) copyFileSync(join(SRC, f), join(DEST, f));
  cpSync(join(SRC, "src"), join(DEST, "src"), { recursive: true, force: true });
  console.log("已同步到：" + DEST);
} else if (DEST) {
  console.log("安装目录不存在，跳过同步：" + DEST);
}
console.log("完成。请让用户在 Figma 里关掉插件面板后重新打开，再点新按钮。");
