import { actionHandlers } from "../../helpers/interaction/_module.mjs";
import { TeriockContextMenu } from "../ux/_module.mjs";
import {
  imageContextMenuOptions,
  previewSheet,
  wikiContextMenuOptions,
} from "./_module.mjs";

/**
 * Bind common actions to some element.
 * @param {HTMLElement} rootElement
 */
export default function bindCommonActions(rootElement) {
  new TeriockContextMenu(rootElement, "img", imageContextMenuOptions, {
    eventName: "contextmenu",
    jQuery: false,
    fixed: true,
  });
  new TeriockContextMenu(
    rootElement,
    "[data-wiki-context]",
    wikiContextMenuOptions,
    {
      eventName: "contextmenu",
      jQuery: false,
      fixed: true,
    },
  );
  const actionElements = rootElement.querySelectorAll("[data-action]");
  for (const /** @type {HTMLElement} */ element of actionElements) {
    const action = element.dataset.action;
    const HandlerClass = Object.values(actionHandlers).find(
      (Handler) => Handler.ACTION === action,
    );
    if (!HandlerClass) {
      continue;
    }
    element.addEventListener("click", async (event) => {
      const handler = new HandlerClass(event, element);
      await handler.primaryAction();
    });
    element.addEventListener("contextmenu", async (event) => {
      event.preventDefault();
      const handler = new HandlerClass(event, element);
      await handler.secondaryAction();
    });
  }
  queryAll(rootElement, "[data-teriock-content-link]").forEach(
    /** @param {HTMLLinkElement} el */ (el) => {
      if (game.settings.get("teriock", "systemLinks")) {
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
      if (!game.settings.get("teriock", "systemTooltips")) {
        el.removeAttribute("data-make-tooltip");
        el.removeAttribute("data-tooltip-html");
      }
    },
  );
  queryAll(rootElement, "[data-make-tooltip], [data-rich-tooltip]").forEach(
    /** @param {HTMLElement} el */ (el) => {
      if (!(el.dataset.tooltip || el.dataset.tooltipHtml) && el.dataset.uuid) {
        el.dataset.tooltipHtml = TERIOCK.display.panel.loading;
      }
      // Determine tooltip direction and style
      el.addEventListener("pointerenter", (ev) => {
        el.dataset.tooltipClass = "teriock-rich-tooltip";
        const rect = el.getBoundingClientRect();
        const leftSpace = rect.left;
        const rightSpace = window.innerWidth - rect.right;
        if (el.dataset.tooltipLeft) {
          if (leftSpace >= 350) {
            el.dataset.tooltipDirection = "LEFT";
          } else {
            el.dataset.tooltipDirection =
              rightSpace > leftSpace ? "RIGHT" : "LEFT";
          }
        } else {
          if (rightSpace >= 350) {
            el.dataset.tooltipDirection = "RIGHT";
          } else {
            el.dataset.tooltipDirection =
              leftSpace > rightSpace ? "LEFT" : "RIGHT";
          }
        }
        const target = /** @type {HTMLElement} */ ev.currentTarget;
        if (target.dataset.tooltip || target.dataset.tooltipHtml) {
          game.tooltip.activate(target);
        }
      });
    },
  );
  queryAll(rootElement, "[data-make-tooltip]").forEach(
    /** @param {HTMLElement} el */ (el) => {
      // Add tooltip listener
      el.addEventListener("pointerenter", async (ev) => {
        const target = /** @type {HTMLElement} */ ev.currentTarget;
        const uuid = /** @type {UUID<TeriockChild>} */ target.dataset.uuid;
        const fetched = target.dataset.tooltipFetched;
        if (!fetched) {
          target.setAttribute("data-tooltip-fetched", "true");
          const doc = await fromUuid(uuid);
          if (doc && typeof doc.toTooltip === "function") {
            const tooltip = await doc.toTooltip();
            target.setAttribute("data-tooltip-html", tooltip);
            if (target === game.tooltip.element) game.tooltip.activate(target);
          }
        }
      });
    },
  );
  rootElement
    .querySelectorAll(".teriock-panel-association-card[data-make-tooltip]")
    .forEach(
      /** @param {HTMLElement} el */ (el) => {
        // Add preview listener
        el.addEventListener("click", async (event) => {
          event.stopPropagation();
          const uuid = /** @type {UUID<TeriockChild>} */ el.dataset.uuid;
          if (!uuid) return;
          const doc = await fromUuid(uuid);
          if (!doc) return;
          await previewSheet(doc);
        });
      },
    );
}

/**
 * Like querySelectorAll, but includes the root element if it matches.
 * @param {HTMLElement} root
 * @param {string} selector
 * @returns {HTMLElement[]} An array of matching elements (root and descendants).
 */
export function queryAll(root, selector) {
  const result = [];
  if (root.matches(selector)) {
    result.push(root);
  }
  result.push(...root.querySelectorAll(selector));
  return result;
}
