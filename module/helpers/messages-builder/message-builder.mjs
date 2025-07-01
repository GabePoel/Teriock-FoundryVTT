import { messageBlock, messageBar, messageBox, messageWrapper, messageHeader } from "./message-parts.mjs";

/**
 * Builds a complete message element from message parts.
 *
 * This function takes an object containing message parts (image, name, bars, blocks, font)
 * and constructs a complete DOM element with proper structure and styling.
 * @param {object} messageParts - Object containing the message parts.
 * @param {string} messageParts.image - The image URL for the message header.
 * @param {string} messageParts.name - The name/title for the message header.
 * @param {object[]} messageParts.bars - Array of bar objects with icon, label, and wrappers.
 * @param {object[]} messageParts.blocks - Array of block objects with title, text, italic, special, and elements.
 * @param {string} messageParts.font - Font class to apply to the message.
 * @returns {HTMLDivElement} The complete message element.
 */
export function buildMessage(messageParts) {
  const { image, name, bars, blocks, font } = messageParts;
  let fontClass = "tfont";
  if (font) {
    fontClass = "tfont-" + font;
  }

  const message = document.createElement("div");
  message.classList.add("tmessage");

  // Header
  const headerBox = messageBox();
  headerBox.classList.add("tmes-header-box");
  if (name) {
    messageHeader(headerBox, image, name, fontClass);
  }

  // Bars
  const barBox = messageBox();
  barBox.classList.add("tmes-bar-box");
  bars
    .filter((bar) => barLength(bar) > 0)
    .forEach((bar) => {
      const barElement = messageBar(barBox, bar.icon, bar.label);
      bar.wrappers.forEach((wrapper) => messageWrapper(barElement, wrapper));
    });

  // Blocks
  const blockBox = messageBox();
  blockBox.classList.add("tmes-block-box");
  blocks
    .filter((block) => block.text !== "")
    .forEach((block) => {
      messageBlock(blockBox, block.title, block.text, block.italic, block.special, block.elements);
    });

  // Append non-empty sections
  [headerBox, barBox, blockBox].forEach((box) => {
    if (box.childNodes.length > 0) message.appendChild(box);
  });

  return message;
}

/**
 * Calculates the effective length of a bar by filtering out empty wrappers.
 * @param {Object} bar - The bar object to calculate length for.
 * @param {string[]} bar.wrappers - Array of wrapper content strings.
 * @returns {number} The number of non-empty wrappers in the bar.
 */
function barLength(bar) {
  bar.wrappers = bar.wrappers.filter(
    (wrapper) => wrapper && typeof wrapper === "string" && wrapper.length > 0 && wrapper != "0",
  );
  const length = bar.wrappers.length;
  return length;
}
