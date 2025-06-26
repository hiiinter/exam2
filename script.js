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

// =============== 弹窗交互功能 ===============
// 1. 打开弹窗
const openModalBtn = document.getElementById('open-modal-btn');
const modalMask = document.getElementById('main-modal-mask');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal-btn');

if (openModalBtn && modalMask && closeModalBtn) {
  openModalBtn.addEventListener('click', () => {
    modalMask.classList.remove('hidden');
    renderThemeSelection();
  });
  closeModalBtn.addEventListener('click', () => {
    modalMask.classList.add('hidden');
    modalContent.innerHTML = '';
  });
  // 点击遮罩关闭
  modalMask.addEventListener('click', (e) => {
    if (e.target === modalMask) {
      modalMask.classList.add('hidden');
      modalContent.innerHTML = '';
    }
  });
}

// =============== 主题选择与组件生成交互 ===============
// 主题数据
const themes = [
  { key: 'cyberpunk', name: '赛博朋克' },
  { key: 'minimalist', name: '极简主义' },
  { key: 'y2k', name: '千禧复古Y2K' },
  { key: 'techwear', name: '都市机能风' },
  { key: 'creamy', name: '奶油慕斯' },
  { key: 'manifest', name: '显化应用' },
];

function renderThemeSelection() {
  let html = `<div class='p-8'><h2 class='text-2xl font-bold mb-6 text-blue-600'>选择一个主题风格</h2><div class='grid grid-cols-2 gap-4'>`;
  themes.forEach(theme => {
    html += `<div class='theme-card cursor-pointer border p-4 rounded-xl text-center hover:shadow-lg' data-theme='${theme.key}'>
      <div class='theme-title text-lg font-bold mb-2'>${theme.name}</div>
      <div class='text-xs text-gray-400'>${theme.key}</div>
    </div>`;
  });
  html += `</div></div>`;
  modalContent.innerHTML = html;
  // 绑定主题卡片点击
  modalContent.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      renderComponentGenerator(card.dataset.theme);
    });
  });
}

function renderComponentGenerator(themeKey) {
  const themeObj = themes.find(t => t.key === themeKey);
  let html = `<div class='p-8'>
    <button class='mb-4 text-blue-500 hover:underline' id='back-to-theme-select'><i class='fas fa-arrow-left mr-2'></i>返回主题选择</button>
    <h2 class='text-xl font-bold mb-4 text-blue-600'>${themeObj ? themeObj.name : themeKey} - 组件生成</h2>
    <textarea id='modal-component-desc' class='w-full border rounded-lg p-3 mb-4' rows='3' placeholder='请输入你想要的组件描述，如"登录按钮"...'></textarea>
    <div class='flex gap-2 mb-4'>
      <button class='quick-btn'>按钮</button>
      <button class='quick-btn'>卡片</button>
      <button class='quick-btn'>表单</button>
    </div>
    <div class='mb-4'>
      <div class='font-bold mb-1'>实时预览：</div>
      <div id='modal-component-preview' class='border rounded-lg p-4 min-h-[48px]'></div>
    </div>
    <div class='mb-4'>
      <div class='font-bold mb-1'>Prompt：</div>
      <div id='modal-generated-prompt' class='bg-gray-100 rounded p-2 mb-2'></div>
      <button id='modal-copy-prompt' class='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>复制Prompt</button>
    </div>
    <div>
      <div class='font-bold mb-1'>代码：</div>
      <pre id='modal-generated-code' class='bg-gray-900 text-white rounded p-3 mb-2 overflow-x-auto'></pre>
      <button id='modal-copy-code' class='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>复制代码</button>
    </div>
  </div>`;
  modalContent.innerHTML = html;
  // 绑定返回按钮
  modalContent.querySelector('#back-to-theme-select').onclick = renderThemeSelection;
  // 绑定输入与快捷按钮
  const descInput = modalContent.querySelector('#modal-component-desc');
  const previewArea = modalContent.querySelector('#modal-component-preview');
  const promptArea = modalContent.querySelector('#modal-generated-prompt');
  const codeArea = modalContent.querySelector('#modal-generated-code');
  const copyPromptBtn = modalContent.querySelector('#modal-copy-prompt');
  const copyCodeBtn = modalContent.querySelector('#modal-copy-code');
  modalContent.querySelectorAll('.quick-btn').forEach(btn => {
    btn.onclick = () => {
      descInput.value = btn.textContent;
      triggerModalInput();
    };
  });
  descInput.oninput = triggerModalInput;
  function triggerModalInput() {
    const input = descInput.value.trim();
    // 预览
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
    previewArea.innerHTML = previewHTML;
    // Prompt
    promptArea.textContent = generateCursorPrompt(input, themeObj ? themeObj.name : themeKey);
    // 代码
    codeArea.textContent = generateMockCode(input, themeObj ? themeObj.name : themeKey);
  }
  // 复制功能
  copyPromptBtn.onclick = () => {
    navigator.clipboard.writeText(promptArea.textContent).then(() => {
      copyPromptBtn.textContent = '已复制!';
      setTimeout(() => { copyPromptBtn.textContent = '复制Prompt'; }, 1200);
    });
  };
  copyCodeBtn.onclick = () => {
    navigator.clipboard.writeText(codeArea.textContent).then(() => {
      copyCodeBtn.textContent = '已复制!';
      setTimeout(() => { copyCodeBtn.textContent = '复制代码'; }, 1200);
    });
  };
}

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
    styleDesc = '"液体玻璃"风格，适用于"显化应用"，特点是深色星空背景、半透明玻璃质感、霓虹辉光效果，营造出神秘、梦幻的氛围';
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

// =============== 顶部导航和卡片弹窗介绍功能 ===============
const modalIntroData = {
  theme: {
    title: '主题库',
    icon: '<i class="fas fa-palette"></i>',
    desc: '浏览、筛选、收藏多种UI主题，查看风格预览、设计灵感、典型配色与组件案例。支持主题详情弹窗、标签管理。',
    btn: '进入主题库'
  },
  market: {
    title: '组件市场',
    icon: '<i class="fas fa-th-large"></i>',
    desc: '内置丰富UI组件模板库，支持浏览、搜索、筛选、预览、一键插入、拖拽排序。',
    btn: '浏览组件市场'
  },
  prompt: {
    title: 'Prompt编辑器',
    icon: '<i class="fas fa-magic"></i>',
    desc: '可视化编辑Prompt，支持自动补全、风格建议、语法高亮、历史版本回溯与一键美化。',
    btn: '体验Prompt编辑器'
  },
  preview: {
    title: '实时预览',
    icon: '<i class="fas fa-desktop"></i>',
    desc: '支持桌面/移动端实时切换预览，导出多种格式（HTML/CSS/JS/图片/代码片段）。',
    btn: '进入实时预览'
  },
  motion: {
    title: '动效生成',
    icon: '<i class="fas fa-wave-square"></i>',
    desc: '内置动效库，支持为组件添加悬停、点击、进场等动效，生成对应CSS/JS代码。',
    btn: '体验动效生成'
  },
  team: {
    title: '团队协作',
    icon: '<i class="fas fa-users-cog"></i>',
    desc: '支持团队空间，成员可共享主题、组件、Prompt，AI协作建议，评论、@成员、任务分配等功能。',
    btn: '进入团队空间'
  },
  growth: {
    title: '成长体系',
    icon: '<i class="fas fa-seedling"></i>',
    desc: '用户主页，记录生成历史、收藏、成就、积分等，积分可兑换主题/组件/AI算力等。',
    btn: '查看成长体系'
  }
};

function showIntroModal(key) {
  const data = modalIntroData[key];
  if (!data) return;
  modalContent.innerHTML = `
    <div class='p-8 text-center'>
      <div class='text-4xl mb-4 text-blue-500'>${data.icon}</div>
      <div class='text-2xl font-bold mb-2'>${data.title}</div>
      <div class='text-lg text-gray-700 mb-6'>${data.desc}</div>
      <button class='px-6 py-2 bg-blue-500 text-white rounded-xl text-lg font-semibold hover:bg-blue-600 transition'>${data.btn}</button>
    </div>
  `;
  modalMask.classList.remove('hidden');
}

// 绑定导航栏点击
Array.from(document.querySelectorAll('.nav-link')).forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showIntroModal(link.dataset.modal);
  });
});
// 绑定卡片点击
Array.from(document.querySelectorAll('.bento-card[data-modal]')).forEach(card => {
  card.addEventListener('click', () => {
    showIntroModal(card.dataset.modal);
  });
});

// =============================================== 