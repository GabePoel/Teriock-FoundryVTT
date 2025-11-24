import { bindCommonActions } from "../../applications/shared/_module.mjs";

const { TooltipManager } = foundry.helpers.interaction;

/** @inheritDoc */
export default class TeriockTooltipManager extends TooltipManager {
  /** @inheritDoc */
  activate(element, options = {}) {
    super.activate(element, options);
    if (
      this.tooltip.firstElementChild &&
      this.tooltip.firstElementChild.classList.contains("teriock-panel")
    ) {
      this.tooltip.classList.toggle("teriock-rich-tooltip", true);
    }
    bindCommonActions(this.tooltip);
  }
}
