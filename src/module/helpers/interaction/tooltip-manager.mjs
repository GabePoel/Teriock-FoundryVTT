import { bindCommonActions } from "../../applications/shared/_module.mjs";

const { TooltipManager } = foundry.helpers.interaction;

/** @inheritDoc */
export default class TeriockTooltipManager extends TooltipManager {
  /** @inheritDoc */
  activate(element, options = {}) {
    super.activate(element, options);
    if (
      element.getAttribute("data-tooltip-async") &&
      element.getAttribute("data-uuid")
    ) {
      this.tooltip.setAttribute(
        "data-linked-uuid",
        element.getAttribute("data-uuid"),
      );
    } else {
      this.tooltip.setAttribute("data-linked-uuid", "none");
    }
    bindCommonActions(this.tooltip);
  }
}
