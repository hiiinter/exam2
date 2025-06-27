// script.js
// =============== 脚本功能分区说明 ===============
// 1. DOM 元素获取
// 2. 视图切换逻辑（主题选择 <-> 组件生成）
// 3. 主题切换与样式应用
// 4. 组件描述输入与快捷按钮逻辑
// 5. 实时预览渲染
// 6. Prompt 生成与复制
// 7. 代码生成与复制
// 8. 其他辅助功能
// ===============================================

// 1. DOM 元素获取
const themeSelectionView = document.getElementById('theme-selection-view');
const generatorView = document.getElementById('generator-view');
const themeGrid = document.getElementById('theme-grid');
const backToThemesBtn = document.getElementById('back-to-themes');
const selectedThemeName = document.getElementById('selected-theme-name').querySelector('span');
const componentDesc = document.getElementById('component-desc');
const quickComponents = document.getElementById('quick-components');
const previewArea = document.getElementById('component-preview');
const generatedPrompt = document.getElementById('generated-prompt');
const copyPromptBtn = document.getElementById('copy-prompt');
const generatedCode = document.getElementById('generated-code');
const copyCodeBtn = document.getElementById('copy-code');

// 2. 事件监听设置

document.addEventListener('DOMContentLoaded', () => {
  // 主题卡片点击（事件委托）
  themeGrid.addEventListener('click', function(e) {
    let card = e.target.closest('.theme-card');
    if (card) {
      const themeClass = 'theme-' + card.dataset.theme;
      const themeName = card.querySelector('.theme-title')?.textContent || card.dataset.theme;
      showGeneratorView(themeClass, themeName);
    }
  });

  // 返回按钮点击
  if (backToThemesBtn) {
    backToThemesBtn.addEventListener('click', showThemeSelectionView);
  }

  // 组件描述输入监听
  componentDesc.addEventListener('input', handleInputChange);

  // 快捷按钮点击填充输入框
  quickComponents.addEventListener('click', function(e) {
    if (e.target.classList.contains('quick-btn')) {
      componentDesc.value = e.target.textContent;
      handleInputChange();
    }
  });

  // 一键复制 Prompt
  copyPromptBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(generatedPrompt.textContent)
      .then(() => {
        copyPromptBtn.textContent = '已复制!';
        setTimeout(() => { copyPromptBtn.textContent = '一键复制 Prompt'; }, 1200);
      });
  });

  // 一键复制代码
  copyCodeBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(generatedCode.textContent)
      .then(() => {
        copyCodeBtn.textContent = '已复制!';
        setTimeout(() => { copyCodeBtn.textContent = '一键复制代码'; }, 1200);
      });
  });
});

// 3. 视图切换逻辑
function showGeneratorView(themeClass, themeName) {
  // 隐藏主题选择，显示生成器
  themeSelectionView.classList.add('hidden');
  generatorView.classList.remove('hidden');
  // 切换 body 的主题 class
  document.body.classList.remove('theme-cyberpunk', 'theme-minimalist', 'theme-y2k', 'theme-techwear', 'theme-creamy', 'theme-manifest');
  document.body.classList.add(themeClass);
  // 预览区也同步主题 class
  previewArea.className = themeClass;
  // 更新生成器视图中的主题名称
  selectedThemeName.textContent = themeName;
  // 清空输入和预览
  componentDesc.value = '';
  previewArea.innerHTML = '';
  generatedPrompt.textContent = '';
  generatedCode.textContent = '';
}

function showThemeSelectionView() {
  // 显示主题选择，隐藏生成器
  themeSelectionView.classList.remove('hidden');
  generatorView.classList.add('hidden');
  // 移除 body 上的主题 class
  document.body.classList.remove('theme-cyberpunk', 'theme-minimalist', 'theme-y2k', 'theme-techwear', 'theme-creamy', 'theme-manifest');
  // 预览区移除主题 class
  previewArea.className = '';
  // 清空生成器视图中的主题名称
  selectedThemeName.textContent = '';
}

// 4. 组件描述输入与快捷按钮逻辑
// 已在 DOMContentLoaded 事件中实现

// 5. 实时预览渲染 & 6. Prompt 生成与复制 & 7. 代码生成与复制
function handleInputChange() {
  const input = componentDesc.value.trim();
  const themeName = selectedThemeName.textContent;
  // 获取当前主题 class
  const themeClass = previewArea.className;
  // a. 模拟实时预览
  let previewHTML = '';
  if (/按钮|button/i.test(input)) {
    previewHTML = '<button style="font-size:1.1rem;padding:0.7em 2em;">示例按钮</button>';
  } else if (/卡片|card/i.test(input)) {
    previewHTML = '<div style="padding:1.5em 1em;border-radius:0.8em;box-shadow:0 2px 8px rgba(0,0,0,0.08);background:var(--card-bg);">示例卡片内容</div>';
  } else if (/表单|form/i.test(input)) {
    previewHTML = '<form><input type="text" placeholder="输入内容" style="margin-bottom:0.5em;"><br><button type="submit">提交</button></form>';
  } else if (input) {
    previewHTML = '<div style="padding:1em;">' + input + '</div>';
  } else {
    previewHTML = '';
  }
  // 预览内容包裹主题 class
  previewArea.innerHTML = `<div class="${themeClass}">${previewHTML}</div>`;

  // b. 生成 Cursor Prompt
  const prompt = generateCursorPrompt(input, themeName);
  generatedPrompt.textContent = prompt;

  // c. 模拟代码生成
  const code = generateMockCode(input, themeName);
  generatedCode.textContent = code;
}

// 辅助函数：生成高质量风格化 Prompt
function generateCursorPrompt(input, themeName) {
  if (!input) return '';
  let styleDesc = '';
  if (/赛博|cyberpunk/i.test(themeName)) {
    styleDesc = '赛博朋克霓虹风格，深色背景，明亮霓虹高光，未来感强烈';
  } else if (/极简|minimal/i.test(themeName)) {
    styleDesc = '极简主义风格，明亮、留白、柔和绿色点缀，干净线条';
  } else if (/显化/i.test(themeName)) {
    styleDesc = '“液体玻璃”风格，适用于“显化应用”，特点是深色星空背景、半透明玻璃质感、霓虹辉光效果，营造出神秘、梦幻的氛围';
  } else {
    styleDesc = '现代简洁风格';
  }
  return `请为我创建一个${styleDesc}的${input}，要求视觉风格突出，代码结构清晰，适合直接用于网页前端。`;
}

// 辅助函数：模拟代码生成
function generateMockCode(input, themeName) {
  if (!input) return '';
  if (/按钮|button/i.test(input)) {
    if (/赛博|cyberpunk/i.test(themeName)) {
      return `<button style="background:linear-gradient(90deg,#00fff7,#ff00ea);color:#fff;border:none;border-radius:0.7em;box-shadow:0 0 12px #00fff7,0 0 24px #ff00ea;font-family:'Orbitron',sans-serif;padding:0.7em 2em;">赛博朋克按钮</button>`;
    } else if (/极简|minimal/i.test(themeName)) {
      return `<button style="background:#7ed957;color:#222;border:none;border-radius:0.7em;font-family:'Lato',sans-serif;padding:0.7em 2em;">极简按钮</button>`;
    } else if (/显化/i.test(themeName)) {
      return `<button style="background:rgba(26, 22, 54, 0.4); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:999px; color:#fff; padding:0.7em 2em; text-shadow: 0 0 10px #a77eff;">液体玻璃按钮</button>`;
    }
    return `<button>普通按钮</button>`;
  }
  if (/卡片|card/i.test(input)) {
    if (/赛博|cyberpunk/i.test(themeName)) {
      return `<div style="background:#23234d;color:#fff;border-radius:1em;box-shadow:0 0 12px #00fff7,0 0 24px #ff00ea;padding:1.5em 1em;font-family:'Orbitron',sans-serif;">赛博朋克卡片内容</div>`;
    } else if (/极简|minimal/i.test(themeName)) {
      return `<div style="background:#f8fdf7;color:#222;border-radius:1em;box-shadow:0 2px 12px #7ed95722;padding:1.5em 1em;font-family:'Lato',sans-serif;">极简卡片内容</div>`;
    } else if (/显化/i.test(themeName)) {
      return `<div style="background:rgba(26, 22, 54, 0.4); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.15); border-radius:24px; color:#fff; padding:1.5em 1em; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">液体玻璃卡片</div>`;
    }
    return `<div>普通卡片内容</div>`;
  }
  if (/表单|form/i.test(input)) {
    if (/赛博|cyberpunk/i.test(themeName)) {
      return `<form style="background:#23234d;padding:1em;border-radius:1em;box-shadow:0 0 12px #00fff7;"><input type='text' placeholder='输入内容' style='margin-bottom:0.5em;border-radius:0.5em;padding:0.5em;'><br><button style='background:linear-gradient(90deg,#00fff7,#ff00ea);color:#fff;border:none;border-radius:0.7em;padding:0.7em 2em;'>提交</button></form>`;
    } else if (/极简|minimal/i.test(themeName)) {
      return `<form style="background:#f8fdf7;padding:1em;border-radius:1em;box-shadow:0 2px 12px #7ed95722;"><input type='text' placeholder='输入内容' style='margin-bottom:0.5em;border-radius:0.5em;padding:0.5em;'><br><button style='background:#7ed957;color:#222;border:none;border-radius:0.7em;padding:0.7em 2em;'>提交</button></form>`;
    }
    return `<form><input type='text' placeholder='输入内容'><br><button>提交</button></form>`;
  }
  // 其他类型
  return `<!-- 这里可以根据描述自定义生成代码 -->`;
}

// 8. 其他辅助功能

// =============================================== 