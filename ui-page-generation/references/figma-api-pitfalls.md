# Figma Plugin API 已知坑（本工程踩过）

1. **字体必须先加载**
   直接 `figma.createText()` 然后 `node.fontName = {family, style}` 指到未加载字体会抛错。
   统一用 `makeText()`（内部会对候选字体逐个 `loadFontAsync`，并支持中英分段设字体）。
   字体链：中文 `PingFang SC → HarmonyOS Sans → Microsoft YaHei UI → Microsoft YaHei`；拉丁 `Inter → Helvetica Neue → Arial`；等宽 `SF Mono → JetBrains Mono → Consolas`（macOS 没有的字体在 Windows 会自动落到下一个候选）。

2. **`layoutGrow` / `layoutAlign` / `layoutPositioning` 只能用在 auto-layout 的子节点**
   在普通帧（非 auto layout）的子节点上设置会直接抛错，导致"只画出一个标题、其余空白"。
   规则：**先 `appendChild`，再设这两个属性**（用 `spacerIn(parent)` 而不是自己 `createFrame` 后立即设 `layoutGrow`）。

3. **auto-layout 帧的 `resize()`**
   当 `primaryAxisSizingMode = "AUTO"` 时对主轴 `resize()` 会抛错。要么先设 sizing 模式再 resize，要么用 `layoutAlign="STRETCH"` / 固定 `counterAxisSizingMode` 让父级决定尺寸。

4. **`vectorPaths` 只支持 `M / L / C / Q / Z`，不支持 `H` / `V` 简写**（2026-09-18 连踩两次）
   写 `"M 8.5 3 V 8 L 4.5 15.5 H 15.5 ..."` 这种带 `H`/`V` 的路径时，Figma **既不报错也不渲染**，整条矢量直接消失。
   现象：02-02「样品申请」卡片前面空白（它是 6 个图标里唯一整条靠矢量画的）；导航条「设置」齿轮只画出圆环和中心点、8 根齿没了（齿用了 `H`/`V`）。
   **规则：路径数据里只用 `M` 和 `L`（曲线用 `C`），把 `H y` 写成 `L x y`、`V x` 写成 `L x y`。**
   ```js
   function ln(pts) {                       // 由点串生成 M/L 路径，天然不会用到 H/V
     var data = "M " + pts[0][0] + " " + pts[0][1];
     for (var i = 1; i < pts.length; i++) data += " L " + pts[i][0] + " " + pts[i][1];
     var v = figma.createVector();
     v.vectorPaths = [{ windingRule: "NONE", data: data }];
     v.fills = []; v.strokes = [solid(color)];
     v.strokeWeight = 1.5; v.strokeCap = "ROUND"; v.strokeJoin = "ROUND";
     wrap.appendChild(v);
   }
   ```

4b. **不要用"旋转细矩形"代替画线**
   试过用 `rect.rotation` 拼折线（想绕开矢量问题），结果旋转轴心与预期不一致：打钩被挪歪、箭头只剩一根竖线（像没画完）。
   斜线一律走 `ln()` / `vectorPaths`（只含 M/L/C），不要用旋转矩形拼。

4c. **提交前跑一次路径自查**
   `Select-String -Pattern '"M [^"]*\b[HV]\b'` 扫一遍 `src/*.js`，必须为零命中。

4d. **加了新图标要出预览图再交**
   用 `tools/preview_task_icons.py` 按同一套坐标渲染 PNG（PIL），自己看一眼再同步 —— 图标问题已经出现过两次。

4b. **加了新图标要出预览图再交**
   用 `tools/preview_task_icons.py` 按同一套坐标渲染 PNG（PIL），自己看一眼再同步 —— 图标问题已经出现过两次。

5. **图层重叠会产生"残影"错觉**
   多个生成帧都放在 `(0,0)` 会叠在一起，看起来像标题重影。新帧一律 `root.x = nextFreeX()`；重跑同一页面时先 `removeGenerated("<本页前缀>")`。
   清理前缀必须够独特，例如 `"02-01 重构"` 而不是 `"02-01"`，否则会连旧版一起删掉。

6. **纯中文文本的字体策略**
   现在是纯中文界面：基础字体取中文字体，再用 `setRangeFontName` 把 `[A-Za-z0-9]` 段切成 Inter（数字/代号也可整段用等宽）。
   全角标点（：、·）属于中文段，不要切。

7. **静态帧表达不了的行为**
   Hover（位移/描边/阴影变化）、CSS 动画（呼吸、箭头位移）在静态 Figma 页面上只能画"静止态"。若用户要真交互，方案是"组件 + 两个变体 + Smart Animate"，需要单独确认，不要偷偷加假状态。

8. **同步安装目录可能需授权**
   项目镜像在工作盘（可用 apply_patch 编辑），Figma 实际加载目录在别处（如 `E:\<你的插件目录>\...`），复制过去属于沙箱外操作，需用户授权后执行。
