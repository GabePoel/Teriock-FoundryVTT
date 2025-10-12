import { actionHandlers } from "../../helpers/interaction/_module.mjs";
import { imageContextMenuOptions } from "./_module.mjs";

const { ContextMenu } = foundry.applications.ux;

/**
 * Bind common actions to some element.
 * @param {HTMLElement} rootElement
 */
export default function bindCommonActions(rootElement) {
  new ContextMenu(rootElement, "img", imageContextMenuOptions, {
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
}
