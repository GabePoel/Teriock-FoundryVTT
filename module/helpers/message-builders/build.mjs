import { messageBlock, messageBar, messageBox, messageWrapper, messageHeader } from "./message-parts.mjs";
import { buildAbilityMessage } from "./build-ability-message.mjs";
import { buildEquipmentMessage } from "./build-equipment-message.mjs";

export function buildMessage(document) {
    let content = {
        bars: [],
        blocks: []
    }
    if (document.type == 'ability') {
        content = buildAbilityMessage(document);
    }
    if (document.type == 'equipment') {
        content = buildEquipmentMessage(document);
    }
    return buildMessageHelper(document.img, document.name, content.bars, content.blocks);
}

function buildMessageHelper(image, name, bars, blocks) {
    const message = document.createElement('div');
    message.classList.add('tmessage');
    message.style.display = 'flex';
    message.style.flexDirection = 'column';
    message.style.gap = '0.5em';
    const headerBox = messageBox();
    headerBox.classList.add('tmes-header-box');
    message.appendChild(headerBox);
    messageHeader(headerBox, image, name);
    const barBox = messageBox();
    barBox.classList.add('tmes-bar-box');
    message.appendChild(barBox);
    const blockBox = messageBox();
    blockBox.classList.add('tmes-block-box');
    message.appendChild(blockBox);
    for (const bar of bars) {
        if (barLength(bar) == 0) {
            continue;
        }
        const barElement = messageBar(barBox, bar.icon);
        for (const wrapper of bar.wrappers) {
            messageWrapper(barElement, wrapper);
        }
    }
    for (const block of blocks) {
        if (block.text == '') {
            continue;
        }
        messageBlock(blockBox, block.title, block.text, block.italic);
    }
    return message;
}

function barLength(bar) {
    bar.wrappers = bar.wrappers.filter(wrapper => wrapper && typeof wrapper === 'string' && wrapper.length > 0 && wrapper != '0');
    const length = bar.wrappers.length;
    return length;
}