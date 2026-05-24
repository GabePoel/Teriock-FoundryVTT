import { TeriockContextMenu } from "../ux/_module.mjs";
import { imageContextMenuOptions, wikiContextMenuOptions } from "./_module.mjs";

/**
 * Bind common actions to some element.
 * @param {HTMLElement} rootElement
 */
export default function bindCommonActions(rootElement) {
  new TeriockContextMenu(rootElement, "img", imageContextMenuOptions, {
    eventName: "contextmenu",
    fixed: true,
    jQuery: false,
  });
  new TeriockContextMenu(rootElement, "[data-wiki-context]", wikiContextMenuOptions, {
    eventName: "contextmenu",
    fixed: true,
    jQuery: false,
  });
}
