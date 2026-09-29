# 布局白名单（layouts）

> 来源：**ESTHER不二 / esther-design-system**（CC BY-NC-SA 4.0）的 16 种布局 → 按本站品牌基因筛成
> **9 种直接用 + 3 种改造后用 + 4 种禁用**。
> 用法：**每个 section 选一种，而且相邻两节不能是同一手法**（P0）。**不许自己发明布局。**

## A. 直接可用（9）

| # | 手法 | 适用 |
| --- | --- | --- |
| 01 | **非对称双栏**（文字 + 视觉，比例别做 50/50） | Hero、章节首屏 |
| 02 | **Sticky 侧栏 + 内容滚动** | 长内容分段、案例拆解 |
| 03 | **三等分卡片网格**（数量保持 3/6/9，不留孤儿） | 能力矩阵、并列要点 |
| 05 | **中轴时间线交错** | 经历、演进、对比 |
| 06 | **全宽深色面板**（全站最多一块） | 核心观点、打破节奏 |
| 10 | **自适应卡片网格**（`auto-fill` + `minmax`） | 数量不定的卡片集合 |
| 13 | **分栏对称**（左大字标题 / 右具体内容） | 问题 vs 方案 |
| 14 | **Tab 切换单栏** | 看板型、数据面板 |
| 16 | **Sticky 编号侧栏 + 大图杂志卡** | 步骤 5–10 个的长流程 |

约束速记：03 全站最多出现一次；06 全站最多出现一块；02 / 16 的 sticky 在 < 900px 变 static；
16 的每一步都要有一张满宽配图，编号不要三色轮换（本站不用多色）。

## B. 改造后可用（3）

**04 纵向 Step 流程线 → 去掉圆形编号**

```css
.steps{display:flex;flex-direction:column;gap:clamp(32px,4vw,56px);padding-left:56px;position:relative;}
.steps::before{content:"";position:absolute;left:17px;top:40px;bottom:40px;width:1px;background:var(--paper-d);}
.step-num{position:absolute;left:-56px;width:36px;text-align:right;
  font-family:var(--display);font-size:20px;color:var(--gold);}  /* 不用色块圆点 */
```

步骤不超过 5 个，超过就拆组；超过 4 步改用 16。

**11 全宽品牌色面板 → 换成 pine 深绿面板**

```css
.panel{background:var(--pine);color:var(--warm);padding:clamp(80px,12vh,160px) 0;position:relative;overflow:hidden;}
```

不用她的蓝色面板、不在品牌色面板上放同色系文字；一页最多 1–2 块（与 06 合计仍算「深色节奏」）。

**12 横向滚动时间线 → 去掉圆角与投影卡片**

```css
.rail{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:24px;}
.rail-card{flex:0 0 300px;scroll-snap-align:start;background:var(--paper);
  border:1px solid var(--paper-d);border-radius:2px;padding:clamp(24px,3vw,36px);} /* 2px 圆角、无投影 */
.rail-card .year{font-family:var(--display);font-size:28px;color:var(--gold);}
```

滚动条要自定义成纸感细线，别出现浏览器默认灰条。

## C. 禁用（4）

| # | 手法 | 为什么禁 |
| --- | --- | --- |
| 07 | 横向 Step 连接线 | 渐变连接线 = AI 落地页信号 |
| 08 | Hero 全屏居中的大圆角卡片 | 大圆角 + 柔和投影 = SaaS 卡片风（禁忌 6） |
| 09 | Hero 单栏纵向的中心圆头像 | 与「首屏不放照片」冲突 |
| 15 | 无限画布 Canvas | 需要拖拽缩放 JS，超出本站范围 |

## D. 本站已有手法池（品牌基因 §6）

非对称双栏、满宽图带、左窄右宽 4:8、叠层（小卡压大字上）、表格化、时间轴、单列大插图、词墙过场、sticky 顶栏。

**已经用掉的**（新页面不要重复）：

- `site/index.html` 首屏 = 不对称双栏（名字 1/7 列，右栏 9/13 列）+ sticky 顶栏
- `site/index.html` 第二屏 PHILOSOPHY = 左窄右宽 5:7 + 右侧竖环词墙
