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
    const bar = document.createElement('div');
    bar.classList.add('abm-bar');
    bar.style.width = '100%';
    bar.style.display = 'flex';
    bar.style.flexDirection = 'row';
    bar.style.gap = '0.25em';
    bar.style.alignItems = 'center';
    const barIconContainer = document.createElement('div');
    barIconContainer.classList.add('abm-bar-icon');
    barIconContainer.style.width = '1.5em';
    barIconContainer.style.height = '1em';
    barIconContainer.style.display = 'flex';
    barIconContainer.style.alignItems = 'top';
    barIconContainer.style.flex = '0 0 auto';
    barIconContainer.style.placeSelf = 'flex-start';
    barIconContainer.style.marginTop = '0.25em';
    bar.appendChild(barIconContainer);
    const barTags = document.createElement('div');
    barTags.classList.add('abm-bar-tags');
    barTags.style.width = 'calc(100% - 1.5em)';
    barTags.style.display = 'flex';
    barTags.style.flexDirection = 'row';
    barTags.style.gap = '0.25em';
    barTags.style.flexWrap = 'wrap';
    barTags.style.alignItems = 'center';
    barTags.style.flex = '1 1 auto';
    bar.appendChild(barTags);
    parent.appendChild(bar);
    if (icon) {
        barIcon(bar, icon);
    }
    return bar;
}

export function messageWrapper(parent, content) {
    if (!content) {
        return;
    }
    if (content == '') {
        return;
    }
    const wrapper = document.createElement('div');
    wrapper.classList.add('abm-label');
    wrapper.style.paddingLeft = '0.25em';
    wrapper.style.paddingRight = '0.25em';
    wrapper.style.borderRadius = '0.25em';
    wrapper.style.border = '1px solid rgba(0, 0, 0, 0.25)';
    wrapper.style.maxWidth = 'fit-content';
    wrapper.innerHTML = content;
    if (parent.querySelector('.abm-bar-tags')) {
        parent.querySelector('.abm-bar-tags').appendChild(wrapper);
    } else {
        parent.appendChild(wrapper);
    }
    return wrapper;
}

export function messageBlock(parent, title, text, italic = false) {
    if (!text) {
        return;
    }
    const block = document.createElement('div');
    block.classList.add('abm-block');
    block.style.width = '100%';
    block.style.display = 'flex';
    block.style.flexDirection = 'column';
    block.style.borderTop = '1px solid rgba(0, 0, 0, 0.25)';
    block.style.paddingTop = '0.5em';
    // block.style.marginTop = '0.25em';
    const titleElement = document.createElement('div');
    titleElement.classList.add('abm-block-title');
    titleElement.innerHTML = title;
    titleElement.style.fontWeight = 'bold';
    block.appendChild(titleElement);
    const textElement = document.createElement('div');
    textElement.classList.add('abm-block-text');
    textElement.innerHTML = text;
    const tables = textElement.querySelectorAll('table');
    tables.forEach(table => table.remove());
    block.appendChild(textElement);
    parent.appendChild(block);
    if (italic) {
        textElement.style.fontStyle = 'italic';
    }
    const paragraphs = block.querySelectorAll('p');
    paragraphs.forEach(paragraph => {
        paragraph.style.margin = '0';
        paragraph.style.padding = '0';
    });
    return block;
}

export function messageHeader(parent, image, text) {
    const header = document.createElement('div');
    header.classList.add('tmessage-header');
    header.style.width = '100%';
    header.style.display = 'flex';
    header.style.flexDirection = 'row';
    header.style.alignItems = 'center';
    header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.25)';
    header.style.paddingBottom = '0.5em';
    const headerImageContainer = document.createElement('div');
    headerImageContainer.classList.add('tmessage-header-image-container');
    headerImageContainer.style.width = '2em';
    headerImageContainer.style.height = '2em';
    headerImageContainer.style.display = 'flex';
    headerImageContainer.style.alignItems = 'center';
    headerImageContainer.style.justifyContent = 'center';
    const headerImage = document.createElement('img');
    headerImage.classList.add('tmessage-header-image');
    headerImage.src = image;
    headerImage.style.width = '100%';
    headerImage.style.height = '100%';
    headerImage.style.objectFit = 'cover',
    headerImage.style.objectPosition = 'center';
    headerImageContainer.appendChild(headerImage);
    header.appendChild(headerImageContainer);
    const headerText = document.createElement('div');
    headerText.classList.add('tmessage-header-text');
    headerText.innerHTML = text;
    headerText.style.fontSize = '1.25em';
    headerText.style.lineHeight = '1.25em';
    headerText.style.flex = '1 1 auto';
    headerText.style.textAlign = 'left';
    headerText.style.marginLeft = '0.5em';
    header.appendChild(headerText);
    parent.appendChild(header);
}

function barIcon(parent, iconClass, first = true) {
    const container = document.createElement('div');
    container.classList.add('abm-icon-wrapper');
    container.style.width = '1.5em';
    container.style.height = '1em';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    const icon = document.createElement('i');
    icon.classList.add('fa-light', iconClass);
    icon.style.fontSize = '1em';
    container.appendChild(icon);
    if (parent.querySelector('.abm-bar-icon')) {
        console.log(parent.querySelector('.abm-bar-icon'));
        parent.querySelector('.abm-bar-icon').appendChild(container);
    } else {
        if (first) {
            parent.prepend(container);
        } else {
            parent.appendChild(container);
        }
    }
    return container;
}