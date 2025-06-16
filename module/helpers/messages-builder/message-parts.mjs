function createElement(tag, props = {}, ...children) {
  const el = Object.assign(document.createElement(tag), props);
  for (const child of children) el.append(child);
  return el;
}

export function messageBox() {
  return document.createElement('div');
}

export function messageBar(parent, icon = null) {
  const bar = createElement('div', { className: 'abm-bar' });
  const iconContainer = createElement('div', { className: 'abm-bar-icon' });
  const tagsContainer = createElement('div', { className: 'abm-bar-tags' });

  bar.append(iconContainer, tagsContainer);
  parent.appendChild(bar);

  if (icon) barIcon(bar, icon);

  return bar;
}

export function messageWrapper(parent, content) {
  if (!content) return;
  const wrapper = createElement('div', {
    className: 'abm-label',
    innerHTML: content
  });
  const container = parent.querySelector('.abm-bar-tags') || parent;
  container.appendChild(wrapper);
  return wrapper;
}

export function messageBlock(parent, title, text, italic = false, special = null, elements = null) {
  if (!text) return;

  const block = createElement('div', { className: 'abm-block' });
  const titleElement = createElement('div', {
    className: 'abm-block-title',
    innerHTML: special === 'ES' ? `With the Elder Sorcery of ${elements}...` : title
  });
  const textElement = createElement('div', {
    className: 'abm-block-text',
    innerHTML: text
  });

  if (special === 'ES') block.classList.add('abm-es-block');

  textElement.querySelectorAll('table').forEach(t => t.remove());
  if (italic) textElement.style.fontStyle = 'italic';

  block.append(titleElement, textElement);
  parent.appendChild(block);
  return block;
}

export function messageHeader(parent, image, text, fontClass = 'tfont') {
  const headerImage = createElement('img', {
    className: 'tmessage-header-image',
    src: image
  });
  const imageContainer = createElement('div', {
    className: 'tmessage-header-image-container timage'
  }, headerImage);
  imageContainer.setAttribute('data-tooltip', 'Open Image');
  imageContainer.setAttribute('data-src', image);
  const headerText = createElement('div', {
    className: `tmessage-header-text ${fontClass}`,
    innerHTML: text
  });

  const header = createElement('div', { className: 'tmessage-header' }, imageContainer, headerText);
  parent.appendChild(header);
  return header;
}

function barIcon(parent, iconClass, first = true) {
  const icon = createElement('i', {
    className: `fa-light ${iconClass}`,
    style: 'font-size: 1em;'
  });

  const wrapper = createElement('div', { className: 'abm-icon-wrapper' }, icon);
  const iconParent = parent.querySelector('.abm-bar-icon') || parent;

  first ? iconParent.prepend(wrapper) : iconParent.appendChild(wrapper);
  return wrapper;
}

function addEmbeddedBlock(entities, blocks, name, typeKey, iconFallback = 'hashtag') {
  const config = CONFIG.TERIOCK.abilityOptions.abilityType;
  const typeOrder = Object.keys(config);

  const filtered = (entities || [])
    .filter(e => e.type === typeKey)
    .sort((a, b) => {
      const typeA = a.system[`${typeKey}Type`] || '';
      const typeB = b.system[`${typeKey}Type`] || '';
      const indexA = typeOrder.indexOf(typeA);
      const indexB = typeOrder.indexOf(typeB);

      if (indexA !== indexB) return indexA - indexB;
      return (a.name || '').localeCompare(b.name || '');
    });

  if (!filtered.length) return;

  const listItems = filtered.map(e => {
    const { name, uuid, system } = e;
    const { color = '', icon = iconFallback } = config[system[`${typeKey}Type`]] || {};
    const quantity = system.quantity, maxQuantity = system.maxQuantity;

    const suffix = typeKey === 'resource' && quantity !== undefined
      ? `&nbsp;(${quantity}${maxQuantity ? `/${maxQuantity}` : ''})`
      : '';

    const type = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

    return `<li class="tmessage-embedded-li">
      <span class="tmes-emb-li-icon" style="color: ${color};">
        <i class="fa-solid fa-${icon} fa-fw"></i>
      </span>@UUID[${uuid}]{${name}}${suffix}
    </li>`;
  }).join('');

  blocks.push({
    title: name,
    text: `<ul class="tmessage-embedded-ul">${listItems}</ul>`,
  });
}

export function addAbilitiesBlock(abilities, blocks, name = 'Abilities') {
  addEmbeddedBlock(abilities, blocks, name, 'ability');
}

export function addPropertiesBlock(properties, blocks, name = 'Properties') {
  addEmbeddedBlock(properties, blocks, name, 'property');
}

export function addResourcesBlock(resources, blocks, name = 'Resources') {
  addEmbeddedBlock(resources, blocks, name, 'resource');
}
