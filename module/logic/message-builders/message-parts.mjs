export function messageBox() {
  const box = document.createElement('div');
  box.classList.add('abm-box');
  box.style.width = '100%';
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.gap = '0.25em';
  return box;
}

export function messageBar(parent, icon = null) {
  const bar = Object.assign(document.createElement('div'), {
    className: 'abm-bar',
    style: `
      width: 100%;
      display: flex;
      flex-direction: row;
      gap: 0.25em;
      align-items: center;
    `
  });

  const barIconContainer = Object.assign(document.createElement('div'), {
    className: 'abm-bar-icon',
    style: `
      width: 1.5em;
      height: 1em;
      display: flex;
      align-items: flex-start;
      flex: 0 0 auto;
      place-self: flex-start;
      margin-top: 0.25em;
    `
  });

  const barTags = Object.assign(document.createElement('div'), {
    className: 'abm-bar-tags',
    style: `
      width: calc(100% - 1.5em);
      display: flex;
      flex-direction: row;
      gap: 0.25em;
      flex-wrap: wrap;
      align-items: center;
      flex: 1 1 auto;
    `
  });

  bar.append(barIconContainer, barTags);
  parent.appendChild(bar);

  if (icon) barIcon(bar, icon);

  return bar;
}

export function messageWrapper(parent, content) {
  if (!content) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'abm-label';
  Object.assign(wrapper.style, {
    paddingLeft: '0.25em',
    paddingRight: '0.25em',
    borderRadius: '0.25em',
    border: '1px solid rgba(0, 0, 0, 0.25)',
    maxWidth: 'fit-content'
  });
  wrapper.innerHTML = content;
  (parent.querySelector('.abm-bar-tags') || parent).appendChild(wrapper);
  return wrapper;
}

export function messageBlock(parent, title, text, italic = false) {
  if (!text) return;
  const block = Object.assign(document.createElement('div'), {
    className: 'abm-block',
    style: `
      width: 100%;
      display: flex;
      flex-direction: column;
      border-top: 1px solid rgba(0, 0, 0, 0.25);
      padding-top: 0.5em;
    `
  });

  const titleElement = Object.assign(document.createElement('div'), {
    className: 'abm-block-title',
    innerHTML: title,
    style: 'font-weight: bold;'
  });

  const textElement = Object.assign(document.createElement('div'), {
    className: 'abm-block-text',
    innerHTML: text
  });

  // Remove tables from textElement
  textElement.querySelectorAll('table').forEach(table => table.remove());

  if (italic) textElement.style.fontStyle = 'italic';

  // Remove margin/padding from paragraphs
  textElement.querySelectorAll('p').forEach(p => {
    p.style.margin = '0';
    p.style.padding = '0';
  });

  block.append(titleElement, textElement);
  parent.appendChild(block);
  return block;
}

export function messageHeader(parent, image, text, fontClass = 'tfont') {
  const header = Object.assign(document.createElement('div'), {
    className: 'tmessage-header',
    style: `
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
    `
  });

  const headerImageContainer = Object.assign(document.createElement('div'), {
    className: 'tmessage-header-image-container',
    style: `
      width: 2em;
      height: 2em;
      display: flex;
      align-items: center;
      justify-content: center;
    `
  });

  const headerImage = Object.assign(document.createElement('img'), {
    className: 'tmessage-header-image',
    src: image,
    style: `
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    `
  });

  headerImageContainer.appendChild(headerImage);
  header.appendChild(headerImageContainer);

  const headerText = Object.assign(document.createElement('div'), {
    className: `tmessage-header-text ${fontClass}`,
    innerHTML: text,
    style: `
      font-size: 1.25em;
      line-height: 1.25em;
      flex: 1 1 auto;
      text-align: left;
      margin-left: 0.5em;
    `
  });

  header.appendChild(headerText);
  parent.appendChild(header);
  return header;
}

function barIcon(parent, iconClass, first = true) {
  const icon = document.createElement('i');
  icon.className = `fa-light ${iconClass}`;
  icon.style.fontSize = '1em';

  const container = Object.assign(document.createElement('div'), {
    className: 'abm-icon-wrapper',
    style: `
      width: 2em;
      height: 1em;
      display: flex;
      align-items: center;
      justify-content: center;
    `
  });
  container.appendChild(icon);

  const iconParent = parent.querySelector('.abm-bar-icon') || parent;
  first ? iconParent.prepend(container) : iconParent.appendChild(container);

  return container;
}

export function addAbilitiesBlock(abilities, blocks, name = 'Abilities') {
  const filtered = abilities.filter(a => a.type !== 'passive');
  if (!filtered.length) return;

  const abilitiesText = filtered.map(ability => {
    const { name } = ability;
    const { color, icon } = CONFIG.TERIOCK.abilityOptions.abilityType[ability.system.abilityType] || {};
    return `<li style="list-style: none; display: flex; flex-direction: row; align-items: center;">
      <span style="margin-inline: 1em; font-size: 0.5em; color: ${color};">
        <i class="fa-solid fa-${icon} fa-fw"></i>
      </span>${name}
    </li>`;
  }).join('');

  blocks.push({
    title: name,
    text: `<ul style="padding: 0; margin: 0;">${abilitiesText}</ul>`,
  });
}