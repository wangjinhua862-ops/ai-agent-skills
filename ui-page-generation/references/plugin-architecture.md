# 插件工程结构与常用助手

## 目录

```
ai-agent-prototype-kit/
|-- manifest.json        Figma 导入用（main=code.js, ui=ui.html）
|-- build.mjs            把 src/*.js 按顺序拼成 code.js（Figma 主线程不支持 import）
|-- code.js              构建产物，不要手改
|-- ui.html              插件面板（按钮 + 日志）
|-- src/
|   |-- tokens.js        设计 token（T.color / T.size / T.font …）
|   |-- lib.js           基础助手
|   |-- pages/*.js       页面生成器（当前只有 agent-config-v3.js）
|   `-- main.js          入口：showUI + onmessage 分发
```

## build.mjs 顺序

当前顺序：`tokens.js → lib.js → pages/agent-config-v3.js → main.js`。新增页面必须插到 `main.js` 之前（并同步改 `build.mjs` 的 `parts` 数组），否则入口调用不到生成函数。

## lib.js 可用助手

| 助手 | 用途 |
|---|---|
| `makeFrame(name, opts)` | 建帧。opts：`w/h/fill/gradient/radius/stroke/strokeWidth/dash/shadow/layout/gap/padX/padY/primarySizing/counterSizing/x/y`；`fill:null` 透明 |
| `makeText(chars, opts)` | 建文本（**内部先加载字体**）。opts：`size/weight/bold/color/lineHeight/spacing/mono/gradientText/width`；默认中文字体、拉丁字母段自动切 Inter |
| `rect(w,h,fill,stroke)` | 矩形 |
| `solid(color)` / `gradient(a,b,angle)` | 颜色与线性渐变（0=左→右，90=上→下，135=左上→右下） |
| `spacerIn(parent)` | 弹性占位（**先挂父级再设 layoutGrow**） |
| `gapBox(h,w)` | 固定间距占位 |
| `sparkle(size,a,b)` / `shield(size,a,b)` | 矢量星标 / 盾牌（失败自动回退字符） |
| `softShadow(node,cfg)` / `glow(node,color,alpha,blur,y)` | 阴影 / 光晕 |
| `nextFreeX()` | 计算页面已有内容右侧的空位，防重叠 |
| `removeGenerated(prefix)` | 按帧名前缀删除本插件生成过的帧 |

页面文件里通常会再包一层语义助手（如 `v3Txt` / `v3Row` / `v3StateMark`），复用即可。

> `nextFreeX()` 的**唯一实现放在 `lib.js`**（页面文件里不要再定义同名函数，否则会覆盖基础助手）。

## 面板按钮 ↔ 消息类型 ↔ 帧

| 按钮 | `msg.type` | 产出帧名 | 清理前缀 |
|---|---|---|---|
| ① 02-01 中文版（Agent 配置） | `agentConfigV3` | `02-01 重构｜…` | `02-01 重构｜` |
| ② 02-01 英文版 | `agentConfigEn` | `02-01 EN｜…` | `02-01 EN｜` |
| ③ 02-02 中文版（Agent 工作台） | `workspaceV3` | `02-02 重构｜…` | `02-02 重构｜` |
| ④ 02-02 英文版 | `workspaceEn` | `02-02 EN｜…` | `02-02 EN｜` |
| ⑤ 02-03 中文版（创建订单） | `orderCreate` | `02-03 重构｜…` | `02-03 重构｜` |
| ⑥ 02-03 英文版 | `orderCreateEn` | `02-03 EN｜…` | `02-03 EN｜` |
| ⑦ 02-04 中文版（信息解析） | `poParse` | `02-04 重构｜…` | `02-04 重构｜` |
| ⑧ 02-04 英文版 | `poParseEn` | `02-04 EN｜…` | `02-04 EN｜` |
| ⑨ 02-05 中文版（信息确认） | `orderConfirm` | `02-05 重构｜…` | `02-05 重构｜` |
| ⑩ 02-05 英文版 | `orderConfirmEn` | `02-05 EN｜…` | `02-05 EN｜` |
| ⑪ 定位全部原型帧 | `locateAll` | —（列出并缩放所有 `02-` 开头的帧） | — |
| 清理旧版本帧 | `clean` | —（只删 `02-01｜` v1 / `02-01 定稿` / DEMO，**不动中英主线四帧**） | — |
| 字体自检 / 建立文字样式 / 关闭 | `fontCheck` / `styles` / `close` | — | — |
| 自检：画一张 DEMO 帧 | `demo` | `AI Agent 工作台（DEMO / 自检）` | `AI Agent 工作台（DEMO` |

> 旧版本（v1 `02-01｜` 与定稿版 `02-01 定稿`）及其页面源文件 `src/pages/agent-config.js`、`src/pages/agent-config-final.js` **已按用户要求删除**；不要再新建 `agentConfig` / `agentConfigFinal` / `locateFinal` 分支。
> 清理按钮的前缀故意**不含** `02-01 重构` / `02-01 EN` / `02-02 重构` / `02-02 EN`，改这里时要重新核对，别把主线四帧一起删了。
> 每个页面的中英两版都要成对：生成英文版或重生成中文版后，都要把英文版对齐到中文版正下方（`alignPairBelow(中文前缀, 英文前缀)`）并把两帧一起放进视口（`showPair`）。

**中英成对规则**：⑦ 生成英文版后，以及 ⑥ 重新生成中文版后，都要调用 `alignEnglishUnder()` 把英文版贴到中文版正下方（同一 x、间隔 80），再用 `showPair()` / `scrollAndZoomIntoView([cn, en])` 把两帧一起放进视口。用户反馈过"只看到一版"的问题，这条不能省。

## 构建与同步

在**项目镜像**里编辑并构建，然后同步到安装目录：

```powershell
cd "<你的项目根>\交付\Figma插件\ai-agent-prototype-kit"
node build.mjs
node --check code.js
Copy-Item .\code.js,.\ui.html -Destination "<你的 Figma 插件目录>\ai-agent-prototype-kit" -Force
Copy-Item .\src -Destination "<你的 Figma 插件目录>\ai-agent-prototype-kit" -Recurse -Force
```

安装目录通常在项目目录之外，写入属于沙箱外操作，需要用户授权后执行。

## main.js 分发

每个页面按钮对应一个 `msg.type`，handler 里做三件事：

```js
} else if (msg.type === "<page>") {
  var removed = removeGenerated("<该页面前缀>");   // 只清自己
  var f = await gen<Page>();
  log("已生成：" + f.name + "（x=" + Math.round(f.x) + "）" + (removed ? "，已替换旧帧 " + removed + " 个" : ""));
}
```

UI 里加按钮与点击事件（`parent.postMessage({ pluginMessage: { type: "<page>" } }, "*")`）。
