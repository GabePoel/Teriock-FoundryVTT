import { makeIconClass } from "../utils.mjs";

/**
 * Creates a DOM element with specified properties and children.
 * @param {string} tag - The HTML tag name for the element.
 * @param {object} props - Properties to assign to the element.
 * @param {...any} children - Child elements or text to append.
 * @returns {HTMLElement} The created DOM element.
 */
function createElement(tag, props = {}, ...children) {
  const el = Object.assign(document.createElement(tag), props);
  for (const child of children) {
    el.append(child);
  }
  return el;
}

/**
 * Creates a message box container element.
 * @returns {HTMLDivElement} A div element for containing message content.
 */
export function messageBox() {
  return document.createElement("div");
}

/**
 * Creates a message bar with icon and label containers.
 * @param {HTMLElement} parent - The parent element to append the bar to.
 * @param {string|null} icon - Optional icon class for the bar.
 * @param {string|null} label - Optional label text for the bar.
 * @returns {HTMLDivElement} The created message bar element.
 */
export function messageBar(parent, icon = null, label = null) {
  const bar = createElement("div", { className: "abm-bar" });
  const iconContainer = createElement("div", { className: "abm-bar-icon" });
  const tagsContainer = createElement("div", { className: "abm-bar-tags" });

  bar.append(iconContainer, tagsContainer);
  parent.appendChild(bar);

  if (icon) {
    barIcon(bar, icon, label);
  }

  return bar;
}

/**
 * Creates a message wrapper with content and appends it to a parent element.
 * @param {HTMLElement} parent - The parent element to append the wrapper to.
 * @param {string} content - The HTML content for the wrapper.
 * @returns {HTMLDivElement|null} The created wrapper element, or null if no content provided.
 */
export function messageWrapper(parent, content) {
  if (!content) {
    return null;
  }
  const wrapper = createElement("div", {
    className: "abm-label tsubtle",
    innerHTML: content,
  });
  const container = parent.querySelector(".abm-bar-tags") || parent;
  container.appendChild(wrapper);
  return wrapper;
}

/**
 * Creates a message block with title and text content.
 * @param {HTMLElement} parent - The parent element to append the block to.
 * @param {string} title - The title for the block.
 * @param {string} text - The text content for the block.
 * @param {boolean} italic - Whether to apply italic styling to the text.
 * @param {string|null} special - Special formatting type (e.g., "ES" for Elder Sorcery).
 * @param {string|null} elements - Additional elements for special formatting.
 * @returns {HTMLDivElement|null} The created block element, or null if no text provided.
 */
export function messageBlock(
  parent,
  title,
  text,
  italic = false,
  special = null,
  elements = null,
) {
  if (!text) {
    return null;
  }

  const block = createElement("div", { className: "abm-block" });
  const titleElement = createElement("div", {
    className: "abm-block-title",
    innerHTML:
      special === "ES" ? `With the Elder Sorcery of ${elements}...` : title,
  });
  const textElement = createElement("div", {
    className: "abm-block-text",
    innerHTML: text,
  });

  if (special === "ES") {
    block.classList.add("abm-es-block");
  }
  if (special === "embedded-block") {
    block.classList.add("abm-embedded-block");
  }

  textElement.querySelectorAll("table").forEach((t) => t.remove());
  if (italic) {
    textElement.style.fontStyle = "italic";
  }

  block.append(titleElement, textElement);
  parent.appendChild(block);
  return block;
}

/**
 * Creates a message header with image and text.
 * @param {HTMLElement} parent - The parent element to append the header to.
 * @param {string} image - The image URL for the header.
 * @param {string} text - The text content for the header.
 * @param {string} icon - Font Awesome icon.
 * @param {string} label - Label displayed when hovering over icon.
 * @param {string} fontClass - CSS class for font styling. Defaults to "tfont".
 * @returns {HTMLDivElement} The created header element.
 */
export function messageHeader(
  parent,
  image,
  text,
  icon,
  label,
  fontClass = "tfont",
) {
  const headerImage = createElement("img", {
    className: "tmessage-header-image",
    src: image,
  });
  const imageContainer = createElement(
    "div",
    {
      className: "tmessage-header-image-container timage",
    },
    headerImage,
  );
  imageContainer.setAttribute("data-tooltip", "Open Image");
  imageContainer.setAttribute("data-src", image);
  const headerText = createElement("div", {
    className: `tmessage-header-text ${fontClass}`,
    innerHTML: text,
  });

  const header = createElement(
    "div",
    { className: "tmessage-header" },
    imageContainer,
    headerText,
  );

  if (icon) {
    const headerIcon = createElement("i", {
      className: makeIconClass(icon, "thin", "fullWidth"),
    });
    const iconContainer = createElement(
      "div",
      {
        className: "tmessage-header-icon",
      },
      headerIcon,
    );
    if (label) {
      iconContainer.setAttribute("data-tooltip", label);
      iconContainer.setAttribute("data-tooltip-direction", "LEFT");
    }
    header.appendChild(iconContainer);
  }
  parent.appendChild(header);
  return header;
}

/**
 * Adds an icon to a message bar.
 * @param {HTMLElement} parent - The parent bar element.
 * @param {string} iconClass - The CSS class for the icon.
 * @param {string} label - Optional tooltip label for the icon.
 * @param {boolean} first - Whether to prepend the icon (true) or append it (false).
 * @returns {HTMLDivElement} The created icon wrapper element.
 */
function barIcon(parent, iconClass, label, first = true) {
  const icon = createElement("i", {
    className: `fa-light ${iconClass}`,
    style: "font-size: 1em;",
  });

  const wrapper = createElement(
    "div",
    { className: "abm-icon-wrapper tsubtle" },
    icon,
  );
  if (label) {
    wrapper.setAttribute("data-tooltip", label);
    wrapper.setAttribute("data-tooltip-direction", "LEFT");
  }
  const iconParent = parent.querySelector(".abm-bar-icon") || parent;

  if (first) {
    iconParent.prepend(wrapper);
  } else {
    iconParent.appendChild(wrapper);
  }
  return wrapper;
}
