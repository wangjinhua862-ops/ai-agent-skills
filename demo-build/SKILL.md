---
name: demo-build
description: 把已定稿的 Figma 原型 1:1 落成可运行网页 DEMO（原生 HTML/CSS/JS）：套用固定外壳尺寸与「100% 缩放 + 内容弹性」渲染规则、按原型数值核对、给出可验证的验收证据。用于 Order Agent 等 AI Agent 控制台 DEMO 的界面新增与改动。不用于在 Figma 里画原型（用 ui-page-generation），也不用于后端接口/连接器功能实现。
metadata:
  short-description: 原型 1:1 → 可运行网页 DEMO
---

# 原型 → 可运行网页 DEMO

## 定位

- **Figma 原型是唯一设计源**，网页 DEMO 是它的逐条翻译。字段、顺序、文案、字号、颜色一律照抄 `src/pages/*.js` 里写死的数值（文案在页面顶部的 `V3_LANG` / `W2_LANG` 两张语言表里）。
- 工程：`demo/po-agent-demo/`（`index.html`、`assets/tokens.css`、`assets/app.css`、`assets/app.js`）；页面清单与五屏流程见该目录 `实现清单.md`。
- 后端、连接器、导出等功能不在本 skill 范围。
- **术语（不要改回来）**：我方按模板生成的是 **PI**（Proforma Invoice），客户回签的是 **PO** —— 模板名 / PI 号 / PI 日期走 PI；`上传 PO`、`附件 · Customer PO`、`客户 PO` 走 PO。生成页顶栏页面名是「文档处理」（从工作台的「文档处理」任务进入），工作台侧栏第 1 步是「生成 PI」。
- **中英不是两套页面**：点顶栏地球图标即时切换（状态存 `S.lang`），链接带语言 `#gen`（中）/ `#en/gen`（英）。文案集中在 `T.cn.*` / `T.en.*`（直接取自原型的中英语言表），demo 自己加的字放 `U`（日志/抽屉/提示）；字段名与状态名内部保持中文键、渲染时用 `disp()` 按 `LABEL_EN` 翻译。新增文案时 **cn / en 两处都要补**。

## 渲染规则（🔒 用户 2026-09-20 最终确认并锁定：**不要再改**）

> **锁定声明**：这一节的 6 条是用户逐版比对后确认的最终形态（`v2026-09-20s34`，2026-09-20 用户看完"两条滚动条"那版后点头）。
> 任何"顺手优化尺寸/缩放"的改动都必须先问用户，**禁止自己改**。改尺寸前先把本节读一遍。

靠的是**外壳固定 + 内容弹性 + 恒 100%**；一屏装不下就滚，绝不缩。

1. **整页 `zoom` 一概不许用**（既不放大、也不缩小）。先把 `min(vw/1440, vh/900)` 放大试过（字体忽大忽小），又用"装不下缩到刚好一屏"兜底 —— 用户 2026-09-20 明确要求去掉这条兜底，原话："整页的滚动条是每一个页面都需要的"。因此**任何窗口尺寸下都是 100%**，CSS px = 原型 px。
   - `fitHeight()` 现在只清历史遗留值，不写任何缩放（`assets/app.js`，2026-09-20 s34 起）：
     ```js
     function fitHeight() {
       const app = document.querySelector(".app");
       if (!app) return;
       app.style.zoom = "";
       app.style.height = "";
     }
     ```
   - 验证口径：任何窗口尺寸（含 1366×520 这种极矮窗口）`app.style.zoom` 都必须是空；窗口矮了就是**出现整页滚动条**，不许缩。
   - 别再恢复"缩到刚好一屏"（用户已否），也别加"横向补偿"`app.style.width = vw / z`（更早否过一次）。
2. **顶栏必须通栏**：`grid-template-areas: "top top top" / "rail side content"`。写成 `"rail top top"` 会把 Logo 顶到 x=72，原型是 x=16。
3. **三列宽度** `grid-template-columns: 56px 256px 1fr`：侧栏列 256 = 32 间距 + 224 卡片，内容列因此正好落在原型 `CX = 344`。
4. **内容区弹性**：`.content{display:flex; overflow-y:auto}` → `.content-inner{display:flex;flex-direction:column;gap:20px}` → `.view{flex:1;flex-direction:column;gap:20px}` → `.view > .card:last-child{flex:1 1 auto}`。卡片保持原型高度，富余高度全给最后一张卡：屏幕高就撑开、下半屏不空荡；屏幕矮也不裁切，改由内容区滚动。
5. **每个页面都要有整页滚动条**（用户 2026-09-20 明确）。滚动容器是 `.content`：`padding:0`、`overflow-y:auto`、`overflow-x:hidden`，条子贴内容区最右（留白交给里面的 `.content-inner`）。全站统一 8px、圆角 4px、拇指 `#C9CDD4`（hover `#A9AFB8`）、轨道透明。
   - 放得下时不出现滚动条（正常）；放不下时出现，靠滚、不缩、不裁切。
   - 窗口宽度 < 900px（手机布局）时 `.content` 改 `overflow:visible`，由浏览器窗口滚。
6. **对话框自己还有第二条滚动条**（用户要求"和 ChatGPT 一样，两条"）。生成 PI 页那张卡：
   - `.card.genchat{display:flex;flex-direction:column;min-height:0}`；对话区 `.chatlog{flex:1 1 auto;min-height:0;overflow-y:auto}` → 消息多了**只在这块滚**，条子长在对话区右边缘，样式同上（8px 圆角灰）。
   - 消息**往上累加、不覆盖**：你说的话右对齐（黑底白字气泡），Agent 回话左对齐（`#F7F8F9` 浅灰气泡），最新那条带「撤销」；新消息 `scrollTop = scrollHeight` 自动滚到底。
   - 记录存 `S.chat`（localStorage），刷新/重开还在；「重置示例数据」一起清空。
   - 输入面板 `.panel.ask-panel` 永远沉在卡片底部（`margin-top:20px`）；`导出` 与「信息确认」页的「确认无误」同位置同尺寸（120×40 黑底），下拉用 `.exp.up` **向上**展开（面板贴卡底，向下会被裁）。
   - 对话里也要能改模板：「模板/模版/template」+ `标准|standard` / `客户|customer|\bal\b` / `样品|sample` → 切对应下拉并回一条 Agent 消息；说了模板才认，避免「客户改成 X」误判。

## 逐项核对表（以原型 H=900 为基准；改完必须量）

| 元素 | 期望值 |
|---|---|
| 顶栏 | 通栏 h=72；Logo x=16；工作台名 x=80；页面名 ≈x=232 |
| 顶栏右端 | 自右向左：头像 x=W−24−28 → 主题 → 通知 → 语言 → 帮助，间距 16，图标 18px |
| 导航条 | 宽 56；首项 y=88，行距 48；设置固定在 y=H−100；用户缩写方块 28×28 于 y=H−44 |
| 侧栏卡 | x=88、y=88、224×(H−108)，对应 CSS `height: calc(100% - 20px)` |
| 内容列 | 起点 x=344，上留白 16、下留白 20、卡间距 20 |

## 验收方法（本环境特有，别踩）

- `file:` 协议被浏览器工具禁用：先起本地服务 `Start-Process -WindowStyle Hidden python -m http.server 8787 --bind 127.0.0.1`，再开 `http://127.0.0.1:8787/index.html`。
- Playwright MCP 里 **`setViewportSize` 的入参 ×4 = 真实 CSS 视口**（设 480×250 → 实际 1920×1000）。别用截图目测，用 `browser_snapshot(boxes=true)` 读真实坐标，与上表逐行对。
- Playwright MCP 挂了（报 `Transport closed`）时的替代：本机无头 Edge 截图（沙箱内会被拒，要放行；用临时 profile 免得抢用户正在开的 Edge）：
  ```powershell
  & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --no-sandbox --disable-crash-reporter `
    --user-data-dir="$env:TEMP\eprof_x" --window-size=1366,520 --virtual-time-budget=9000 `
    --screenshot="...\_preview\xx.png" "http://127.0.0.1:8787/index.html#gen"
  ```
  想看"有对话气泡/有状态"的样子，就在站点根目录临时放一个 `_seed_preview.html`：写 `localStorage.setItem("po_demo_v1", JSON.stringify(S))` 再 `location.replace("index.html#gen")`，截完立刻删掉。
- **IndexedDB 必须有兜底**：`DOC_STORE` 的 `open()` 要带 `onblocked` + 800ms 超时。浏览器禁本地存储时 `indexedDB.open` 会一直不返回 → 首屏全白（2026-09-20 实测踩到，也是靠它才让无头截图能渲染）。
- 交付前自查：① 恒 100%（`app.style.zoom` 为空）、超出靠滚、不裁切 ② 顶栏图标顺序与坐标对得上 ③ 无旧版残留按钮/文案 ④ 中英版文案都取自语言表。

## 文件"预览"（🔒 2026-09-20 定稿：**一切都走"PDF + 同一个文档查看器"**）

用户给的参照是豆包 / ChatGPT / WorkBuddy 打开文件的样子。**最终定稿只有一套做法**：

> **任何文件先变成 PDF，再交给同一个「文档查看器」显示。** 模板（Excel / Word）用 Office 导出 PDF；客户 PO 本身就是 PDF。

两处的区别只有"怎么弹出来"：

| 场景 | 弹出形态 | 数据来源 |
|---|---|---|
| **生成 PI 页 → 点内置模板** | **弹出一个"框框"**：`.zoom.boxed{inset:40px;border-radius:16px;box-shadow:…}` | `samples/templates/*.pdf`（Excel 原样导出，`python tools/build_tpl_pdf.py` 一键重导） |
| **解析页 → 上传的 PO** | **铺满整页**（用户认可的形态，`.zoom{inset:0}`） | 用户上传的 PDF 字节 |
| 用户自己拖进来的模板 | **不预览**（他知道自己传了什么），文件行显示「已上传：文件名」；未选时「尚未选择文件」 | — |

**走过的四条错路（别再走）**：

1. **HTML 重画 Excel** → "乱码的""你做的方式是不对的"
2. **导出的 PDF 丢给浏览器自带阅读器** → "像打印的效果一样""字特别大""上面还显示了一串数字"（那是 blob URL 文件名）
3. **纯数据表、不带文件样式** → "乱糟糟的，和原来的不一样"
4. **自建"在线表格编辑器"（列标 + 公式栏 + 可编辑单元格）** → 看着像重画的，用户仍要"和原文件一模一样"

**模板 PDF 的维护**：`tools/build_tpl_pdf.py`（Excel COM，只读模板）把 `samples/templates/*.xlsx` 全部导出同名 PDF；换了模板或新增"样品PI模版"后跑一次。打包脚本要把这些 PDF 一起带上：`build_pages.py` 的 FILES 里已列、`build_single_file.py` 会内嵌成 `window.__TPL_PDF_B64`。

### 上传件（PDF）预览 = 自建「文档查看器」（🔒 2026-09-20 用户确认"真的改好了"）

用户给的参照是 **豆包 / WorkBuddy / ChatGPT 打开文件**的样子。要点（照抄即可）：

1. **面板自带工具条**（不是"点一下弹全屏"）：页码 `1 / N`、缩放方式下拉（自动缩放 / 适合页高 / 适合页宽 / 实际大小）、放大、缩小、截图、下载原文件、全屏（`element.requestFullscreen()`）。按钮上**不要**放 `title` 提示文字（用户明确说不要）。
2. **页面区在面板内滚动**（像豆包）：外层 `.pv` 列布局 + `.pv-body{overflow:auto}`；容器高度要被约束住（`.card.col/…` 补 `min-height:0`，必要时给 `.pv-body` 一个 `max-height: calc(100dvh - 420px)` 兜底），否则内容会把整页撑高、滚动条跑到页面上。
3. **渲染**：pdf.js 逐页画到 canvas，按 `devicePixelRatio × 2`（上限 3）画 → 放大不糊；`resize`（浏览器缩放会触发）防抖 250ms 后按新尺寸重画。pdf.js 不可用（离线单文件版没带 worker）时回落到浏览器原生阅读器兜底。
4. **放大/缩小要"就地"**：先记下面板正中对应的文档坐标 `fx/fy`，画完用
   `scrollTop += (cvTop - bodyTop) + fy*cvH - bodyH/2`（横向同理）把同一处对准回正中。只按比例还原 `scrollTop` 会让人感觉"跳"。
5. **截图 = 拖拽框选 + 复制**：点截图 → 十字光标层 → 拖出选区 → 选区下方浮出小工具条 `✕ / 复制 / 问问 Agent`；按 Esc 取消。
   - **复制**：`canvas.toDataURL()` **同步**取 base64 → 立刻 `new ClipboardItem({ "image/png": blob, "text/html": blobWithImg })` → `navigator.clipboard.write([...])`。
     ⚠️ 不能用 `toBlob()` + `await`：异步等待后用户手势失效，Chrome 直接拒绝，表现为"点了复制没反应"。同时放 `text/html` 是为了微信/飞书/Word 能粘贴。
   - **问问 Agent**：把裁好的图贴到工作台输入框上方（可 ✕ 移除）。

**三个必须记住的坑**

1. **预览容器上绝不能挂 `onclick = 弹全屏`**：面板工具条的点击会冒泡到容器 → 每次点放大都弹出全屏（用户描述为"一点就跳转"），而且那层会盖住选区 → 复制永远失败。2026-09-20 两个问题其实是同一个原因。
2. 工具条按钮要能"就地"操作，不要为了放大再跳一个页面/弹层。
3. 写剪贴板必须同步（见上）。

### 接真模型（用户 2026-09-20 已在本地接通）

- 代码读的是环境变量：本地 `tools/dev_server.py` 读 `ZHIPU_API_KEY`（可选 `ZHIPU_MODEL`）；线上 Cloudflare 的 `_worker.js` 读 Pages 项目的 Variables and Secrets。
- 本地三步：`cd demo/po-agent-demo` → `$env:ZHIPU_API_KEY="…"` → `python tools\dev_server.py 8787`；然后开 `/api/health`，看 `has_key` / `model_ok`（模型链 `glm-4.7-flash → glm-4-flash → glm-4-flash-250414` 会自动降级，本次实际跑在 `glm-4-flash`）。
- ⚠️ **端口占用会让用户那条命令静默失败**：起自己的服务前先确认 8787 上没有旧进程（Agent 自己起的服务记得关掉）。
- 线上：Cloudflare Pages → Settings → Variables and Secrets 加 `ZHIPU_API_KEY`（Secret）→ **重新部署一次**才生效。

问用户时给方向而不是空问，例如：① 要"在线 Excel"那样带行列号的真实网格 ② 要"一份单据"的版面观感 ③ 干脆不预览、只给「下载/用 Excel 打开」。用户提到过豆包 / ChatGPT 的做法可以照做，但**要让他确认具体要哪一种**。

## 协作规则（🔒 用户 2026-09-20 明确要求）

- **改一版 → 问一次**：每改完一版就停下让用户确认，**不要连着改第二版**。用户原话："你变动一版就问我行不行""不要一直跳"。
- **改完直接打开给用户看**：`Start-Process "http://127.0.0.1:8787/index.html#gen"`，比自检截图快。
- **改完必须提版本号**（`index.html` 的 `?v=` 与头像菜单里的「构建版本」同步改），用户靠它判断看到的是不是新版；号对不上会直接引发"你到底改了没"。
- 用户说"恢复成昨天那版"时：**不要凭记忆重写**，先从交接文档/`_preview` 截图里找出那版的实测数值，量准了再改；没有备份就如实说明没有备份。

## 不要做

- 不重画一套 UI，不"顺便"改用户没点名的页面。
- 不发明原型里没有的字段、按钮、指标。
- 顶栏只放人像头像图标，不写人名；用户缩写只出现在导航条底部。
- **别把选中的模板文件名写进下拉按钮**（用户 2026-09-20 明确否过）：三个下拉永远显示分类名（标准/客户/样品），选中只看蓝框高亮；要知道"选了哪个"就看对话区那条 Agent 消息。
- **别用千分位逗号当句子分隔符**：`"数量改成 2,000，客户改成 X"` 这类要先保护 `(\d),(?=\d)`，否则会被切成 `...2` + `000`，数字变成 2。
- **别用 `alert()` 做对话反馈**：听不懂、缺文件这类都在对话区回一条 Agent 消息，不弹窗。

---

## 来源与许可

- **来源**：AI Agent Console Skills by **Hua** —— https://github.com/wangjinhua862-ops/ai-agent-skills
- **许可**：CC BY-NC-SA 4.0（署名 · **禁止商用** · 修改后须以相同协议分享）。
- **二次发布 / 分发 / 改编必须注明来源**（保留上面那条链接与本段），不得用于商业目的。
