import { messageBlock, messageBar, messageBox, messageWrapper, messageHeader } from "./message-parts.mjs";
import { buildAbilityMessage } from "./build-ability-message.mjs";
import { buildEquipmentMessage, buildSecretEquipmentMessage } from "./build-equipment-message.mjs";
import { buildPowerMessage } from "./build-power-message.mjs";
import { buildRankMessage } from "./build-rank-message.mjs";
import { buildFluencyMessage } from "./build-fluency-message.mjs";
import { buildResourceMessage } from "./build-resource-message.mjs";

export function buildMessage(document, options = {}) {
  const secret = options.secret || false;
  let content = {
    bars: [],
    blocks: []
  }
  if (document.type == 'ability') {
    content = buildAbilityMessage(document);
  }
  if (document.type == 'equipment') {
    if (secret) {
      content = buildSecretEquipmentMessage(document);
    }
    else {
      content = buildEquipmentMessage(document);
    }
  }
  if (document.type == 'power') {
    content = buildPowerMessage(document);
  }
  if (document.type == 'rank') {
    content = buildRankMessage(document);
  }
  if (document.type == 'fluency') {
    content = buildFluencyMessage(document);
  }
  if (document.type == 'resource') {
    content = buildResourceMessage(document);
  }
  let fontClass = 'tfont';
  if (document.system.font) {
    fontClass = 'tfont-' + document.system.font;
  }
  if (secret) {
    return buildMessageHelper("systems/teriock/assets/uncertainty.svg", document.system.equipmentType, content.bars, content.blocks, 'tfont');
  }
  return buildMessageHelper(document.img, document.name, content.bars, content.blocks, fontClass);
}

function buildMessageHelper(image, name, bars, blocks, fontClass) {
  const message = document.createElement('div');
  message.classList.add('tmessage');
  message.style.display = 'flex';
  message.style.flexDirection = 'column';

  // Header
  const headerBox = messageBox();
  headerBox.classList.add('tmes-header-box');
  messageHeader(headerBox, image, name, fontClass);

  // Bars
  const barBox = messageBox();
  barBox.classList.add('tmes-bar-box');
  barBox.style.cssText += 'border-top:1px solid rgba(0,0,0,0.25);padding-top:0.5em;margin-top:0.25em;';
  bars.filter(bar => barLength(bar) > 0).forEach(bar => {
    const barElement = messageBar(barBox, bar.icon);
    bar.wrappers.forEach(wrapper => messageWrapper(barElement, wrapper));
  });

  // Blocks
  const blockBox = messageBox();
  blockBox.classList.add('tmes-block-box');
  blockBox.style.marginTop = '0.5em';
  blocks.filter(block => block.text !== '').forEach(block => {
    messageBlock(blockBox, block.title, block.text, block.italic, block.special, block.elements);
  });

  // Append non-empty sections
  [headerBox, barBox, blockBox].forEach(box => {
    if (box.childNodes.length > 0) message.appendChild(box);
  });

  return message;
}

function barLength(bar) {
  bar.wrappers = bar.wrappers.filter(wrapper => wrapper && typeof wrapper === 'string' && wrapper.length > 0 && wrapper != '0');
  const length = bar.wrappers.length;
  return length;
}