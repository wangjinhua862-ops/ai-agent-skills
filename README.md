# AI Agent Console Skills

三个可以独立安装的 Agent Skill，连起来是一条完整的交付链路：

**在 Figma 里画高保真原型 → 落成可运行的网页 DEMO → 构建自己的个人作品集站。**

| Skill | 一句话 | 你说什么触发它 |
| --- | --- | --- |
| `ui-page-generation` | 给 AI Agent 控制台画 Figma 高保真原型页（原生图层，可继续编辑） | 「在插件工程里加一页『XX』，内容有……」 |
| `demo-build` | 把定稿原型 1:1 翻成可运行网页 DEMO（原生 HTML/CSS/JS） | 「把这页原型落成 demo」 |
| `portfolio-site-build` | 增量维护个人作品集站，改完量像素 + 截图验收 | 「更新我的网站：……」 |

面向中文工作流写成，规则、话术、验收口径都是中文。

---

> **开源的是什么**：这套方法论、工作流、规范与模板本身。
>
> **请替换成你自己的信息**：姓名、头像、Logo、品牌与配色全用你自己的——本仓库只给方法，
> 不给任何人的品牌资产。`portfolio-site-build/references/brand-dna.md` 是**占位骨架**，请填你自己的值。
>
> **署名 ≠ 身份授权**：按协议署名只表示「内容来自这里」，
> 不等于可以使用作者的姓名、头像、Logo 或品牌标识。

---

## 1. `ui-page-generation` —— Figma 原型页生成

**做什么**：吃进 ASCII 线框图 + 文字设计规范（字号 / 颜色 / 间距 / 组件），
产出**在 Figma 里点一下按钮就能生成的、可继续编辑的原生图层**——不是图片。

**里面的东西**：

- 6 步工作流：读需求 → 定位工程 → 判新页/改页 → 按规范写 → 构建 → 同步安装目录
- 固定外壳逐像素照抄，新页面只允许改「顶栏页面名 + 主区内容 + 问候卡副标题那一句」
- `scripts/scaffold_page.mjs` 脚手架、设计系统速查（色板 / 字阶 / 组件配方）、Figma API 踩坑清单

## 2. `demo-build` —— 原型 → 可运行 DEMO

**做什么**：把**已定稿**的 Figma 原型逐条翻译成可运行网页，字段、字号、颜色一律照抄原型数值。

**核心硬规则**：外壳固定 + 内容弹性 + **恒 100% 缩放**（不缩、不裁，装不下就滚）。
改完必须按原型数值**逐项量**，附截图证据。

**里面还包含**：文件预览（PDF 文档查看器）、对话区双滚动条、本地开发服务与部署这三类具体坑。

## 3. `portfolio-site-build` —— 个人作品集站

**做什么**：增量维护自己的个人作品集站——改首屏 / 作品 / 经历 / 页脚、加板块、调版式、修对齐。

**默认结构**：一页五屏 —— 首屏 / PHILOSOPHY / 作品 / JOURNEY / QUEST LOG，最后是页脚。

**做法固定**：先读项目里的品牌基因文件与布局白名单 → 从手法池选一个没用过的布局 →
在既有 `site/` 上增量改动 → **量像素 + 截图留证据**。

> **注意**：这份 skill 里的 `references/brand-dna.md` 是**通用占位骨架**，
> 色板 / 字体 / 语气都由**你自己项目的品牌基因文件覆盖**（默认 `docs/品牌基因.md`）。
> 它不会把任何人的配色和品牌强加给你。

---

## 安装

把想要的 skill 目录整个复制到你 Agent 的 skills 目录：

| Agent | 目标目录 |
| --- | --- |
| Codex | `$CODEX_HOME/skills/` |
| Claude Code | `~/.claude/skills/` |
| 其它 | 各自的 skills 目录（能识别 `SKILL.md` 的都行） |

```bash
cp -r ui-page-generation demo-build portfolio-site-build <你的 skills 目录>/
```

装完不用记命令，直接用自然语言说上面表里的话就行。

## 目录结构

```
ui-page-generation/
  SKILL.md                  工作流、固定外壳规则、中英双版规则
  agents/openai.yaml        默认提示词
  assets/page-template.js   页面模板
  references/               设计系统速查 / 页面目录 / 插件架构 / Figma API 踩坑 / 需求模板
  scripts/scaffold_page.mjs 新页面脚手架

demo-build/
  SKILL.md                  渲染规则（锁定）、逐项核对表、验收方法、文件预览

portfolio-site-build/
  SKILL.md                  6 步工作流、硬约束、Definition of Done
  references/brand-dna.md   品牌基因通用骨架（用你项目的值覆盖）
  references/layouts.md     布局白名单：9 用 + 3 改造 + 4 禁用
  references/checklist.md   P0 / P1 / P2 交付自检
```

## Credits

- `portfolio-site-build` 的**流程骨架、布局库结构与自检表骨架**改编自
  **ESTHER不二 (esthersjw)** 的 [esther-design-system](https://github.com/esthersjw/esther-design-system)（CC BY-NC-SA 4.0）。
- 感谢所有把工作方法写成可复用规范、并公开出来的人。

## License

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

本仓库的方法论、工作流、规范、模板与文档，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。
详见 [LICENSE](LICENSE)。

- ✅ 可以学习、使用、修改、分享
- ✅ 必须注明来源：AI Agent Console Skills by **Hua** —— https://github.com/wangjinhua862-ops/ai-agent-skills
- ❌ 禁止将本仓库内容用于商业用途
- 🔄 修改后必须以相同协议分享

### Name, Image and IP Notice

本仓库授权的是方法论、规范、流程、模板与文档本身。
「Hua」（以及与本仓库相关的头像、Logo、品牌标识、账号标识、本人形象）**不在这份授权范围内**。

你可以按协议要求做事实性来源署名，但不能把这些标识用作自己的账号名、用户名、头像、品牌名、
角色名或产品名，也不要让人误以为本仓库作者参与、授权或背书了你的账号、作品、产品、课程或服务。
