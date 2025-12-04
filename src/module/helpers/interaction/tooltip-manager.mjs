import { bindCommonActions } from "../../applications/shared/_module.mjs";

const { TooltipManager } = foundry.helpers.interaction;

/** @inheritDoc */
export default class TeriockTooltipManager extends TooltipManager {
  /** @inheritDoc */
  activate(element, options = {}) {
    super.activate(element, options);
    bindCommonActions(this.tooltip);
  }
}
