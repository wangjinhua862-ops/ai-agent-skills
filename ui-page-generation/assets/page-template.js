// {{TITLE}} —— 页面生成器（脚手架模板，按 ASCII 规范填内容）
// 规范见 references/design-system.md：中性色为主、无渐变/发光/阴影、纯中文

var {{ID}}_C = {
  bg: "#F8F9FA", side: "#FAFAFA", surface: "#FFFFFF",
  t1: "#18181B", t2: "#71717A", t3: "#A1A1AA",
  border: "#E4E4E7", divider: "#F0F0F2", sideLine: "#E5E7EB",
  brand: "#6366F1", brandSoft: "#F3F4FF", success: "#16A34A"
};

function {{ID}}Txt(chars, size, weight, color, extra) {
  var o = { size: size, weight: weight, color: color, lineHeight: Math.round(size * 1.5) };
  if (extra) for (var k in extra) o[k] = extra[k];
  return makeText(chars, o);
}

// 页面主结构：侧栏 + 主内容列
async function {{FUNC}}() {
  var W = 1440, H = 900, SIDE_W = 224, PAD_X = 56, PAD_TOP = 40, COL_W = 960;
  var C = {{ID}}_C;

  var root = makeFrame("{{TITLE}}", { w: W, h: H, fill: C.bg });
  root.x = nextFreeX();          // 放在已有内容右侧，避免重叠
  root.y = 0;
  figma.currentPage.appendChild(root);

  // ---- 侧栏
  var side = makeFrame("Sidebar", { w: SIDE_W, h: H, fill: C.side, x: 0, y: 0 });
  place(root, side);
  var sideLine = rect(1, H, C.sideLine);
  sideLine.x = SIDE_W - 1;
  sideLine.y = 0;
  place(root, sideLine);
  var sideTitle = await {{ID}}Txt("Agent 配置", 15, 600, C.t1);
  sideTitle.x = 16;
  sideTitle.y = 24;
  place(side, sideTitle);
  var menus = [["基础配置", false], ["系统连接", false], ["权限设置", false]];
  var mY = 24 + 22 + 28;
  for (var i = 0; i < menus.length; i++) {
    var active = menus[i][1];
    var item = makeFrame("菜单 / " + menus[i][0], {
      w: SIDE_W - 32, h: 40, fill: active ? C.brandSoft : null, radius: 6, x: 16, y: mY
    });
    place(side, item);
    if (active) {
      var bar = rect(2, 16, C.brand);
      bar.cornerRadius = 1;
      bar.x = 0;
      bar.y = 12;
      place(item, bar);
    }
    var label = await {{ID}}Txt(menus[i][0], 14, active ? 500 : 400, active ? C.brand : C.t1);
    label.x = 12;
    label.y = 9;
    place(item, label);
    mY += 40 + 4;
  }

  // ---- 主内容
  var cx = SIDE_W + PAD_X, cy = PAD_TOP;
  var title = await {{ID}}Txt("页面标题", 22, 600, C.t1);
  title.x = cx;
  title.y = cy;
  place(root, title);
  cy += 32 + 40;

  // TODO: 按 ASCII 继续：区块标题 / 说明 / 容器 / 行
  var block = await {{ID}}Txt("区块标题", 18, 600, C.t1);
  block.x = cx;
  block.y = cy;
  place(root, block);

  figma.viewport.scrollAndZoomIntoView([root]);
  return root;
}
