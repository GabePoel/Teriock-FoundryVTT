import { actionHandlers } from "../../helpers/interaction/_module.mjs";
import { TeriockContextMenu } from "../ux/_module.mjs";
import { imageContextMenuOptions, previewSheet } from "./_module.mjs";

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
  rootElement.querySelectorAll(".teriock-panel-association-card").forEach(
    /** @param {HTMLElement} el */ (el) => {
      el.addEventListener("mouseover", async (ev) => {
        const target = /** @type {HTMLElement} */ ev.currentTarget;
        const uuid = target.dataset.uuid;
        const fetched = target.dataset.tooltipFetched === "true";
        if (!fetched) {
          target.setAttribute("data-tooltip-fetched", "true");
          const doc = /** @type {TeriockChild} */ await fromUuid(uuid);
          if (doc && typeof doc.toTooltip === "function") {
            const tooltip = await doc.toTooltip();
            target.setAttribute("data-tooltip-html", tooltip);
            const tooltipManager = game.tooltip;
            tooltipManager.activate(target);
          }
        }
      });
      el.addEventListener("click", async (event) => {
        event.stopPropagation();
        const uuid =
          /** @type {Teriock.UUID<TeriockDocument>} */ el.dataset.uuid;
        if (!uuid) {
          return;
        }
        const doc = /** @type {TeriockDocument} */ await fromUuid(uuid);
        if (!doc) {
          return;
        }
        await previewSheet(doc);
      });
    },
  );
}
