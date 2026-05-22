import { queryAll } from "../../helpers/html.mjs";
import { TeriockContextMenu, TeriockTextEditor } from "../ux/_module.mjs";
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
  queryAll(rootElement, ".content-link[data-uuid]").forEach(el => {
    if (game.teriock.getSetting("contentLinkTooltips")) {
      const cls = /** @type {TeriockDocument} */ foundry.utils.getDocumentClass(el.dataset.type);
      if (cls?.documentMetadata?.tooltip) el.dataset.makeTooltip = "true";
    }
  });
  queryAll(rootElement, "[data-teriock-content-link]").forEach(/** @param {HTMLLinkElement} el */ el => {
    if (game.teriock.getSetting("systemLinks")) {
      el.dataset.makeTooltip = "true";
      el.classList.add("teriock-content-link");
      el.classList.remove("teriock-not-content-link");
      el.addEventListener("click", async () => {
        const uuid = el.dataset.uuid;
        const doc = await fromUuid(uuid);
        if (doc) {
          if (doc.documentName === "JournalEntryPage") {
            const journalEntry = doc.parent;
            await journalEntry.sheet.render(true);
            journalEntry.sheet.goToPage(doc.id);
          } else {
            await doc.sheet.render(true);
          }
        }
      });
    } else {
      el.classList.remove("teriock-content-link");
      el.classList.add("teriock-not-content-link");
      el.href = el.dataset.wikiAddress;
    }
    if (!game.teriock.getSetting("systemTooltips")) {
      el.removeAttribute("data-make-tooltip");
      el.removeAttribute("data-tooltip-html");
    }
  });
  queryAll(rootElement, "[data-make-tooltip], [data-rich-tooltip]").forEach(/** @param {HTMLElement} el */ el => {
    if (!(el.dataset.tooltip || el.dataset.tooltipHtml) && el.dataset.uuid) {
      const resolvedUuid = foundry.utils.parseUuid(el.dataset.uuid);
      const documentClass = foundry.utils.getDocumentClass(resolvedUuid?.type).implementation;
      if (documentClass?.documentMetadata?.tooltip) {
        el.dataset.tooltipClass = "teriock-rich-tooltip";
        el.dataset.tooltipHtml = TeriockTextEditor.loadingPanelHTML;
      }
    }
    // Determine tooltip direction and style
    el.addEventListener("pointerenter", ev => {
      const rect = el.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;
      if (el.dataset.tooltipLeft) {
        if (leftSpace >= 350) el.dataset.tooltipDirection = "LEFT";
        else el.dataset.tooltipDirection = rightSpace > leftSpace ? "RIGHT" : "LEFT";
      } else {
        if (rightSpace >= 350) el.dataset.tooltipDirection = "RIGHT";
        else el.dataset.tooltipDirection = leftSpace > rightSpace ? "LEFT" : "RIGHT";
      }
      const target = /** @type {HTMLElement} */ ev.currentTarget;
      if (target.dataset.tooltipHtml) el.dataset.tooltipClass = "teriock-rich-tooltip";
      if (target.dataset.tooltip || target.dataset.tooltipHtml) game.tooltip.activate(target);
    });
  });
  queryAll(rootElement, "[data-make-tooltip]").forEach(/** @param {HTMLElement} el */ el => {
    // Add tooltip listener
    el.addEventListener("pointerenter", async ev => {
      const target = /** @type {HTMLElement} */ ev.currentTarget;
      const uuid = /** @type {UUID<AnyChildDocument>} */ target.dataset.uuid;
      const fetched = target.dataset.tooltipFetched;
      if (!fetched) {
        target.setAttribute("data-tooltip-fetched", "true");
        const doc = await fromUuid(uuid);
        if (doc && typeof doc.toTooltip === "function") {
          const tooltip = await doc.toTooltip();
          target.setAttribute("data-tooltip-html", tooltip);
          target.setAttribute("data-tooltip-class", "teriock-rich-tooltip");
          if (target === game.tooltip.element) game.tooltip.activate(target);
        }
      }
    });
  });
  rootElement.querySelectorAll(".teriock-panel-association-card[data-make-tooltip]").forEach(
    /** @param {HTMLElement} el */ el => {
      // Add preview listener
      el.addEventListener("click", async event => {
        event.stopPropagation();
        const uuid = /** @type {UUID<AnyChildDocument>} */ el.dataset.uuid;
        if (!uuid) return;
        const doc = await fromUuid(uuid);
        if (!doc) return;
        await doc.sheet.render(true);
      });
    },
  );
}
