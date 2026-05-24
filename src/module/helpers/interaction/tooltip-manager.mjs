import TeriockTextEditor from "../../applications/ux/text-editor.mjs";

const { TooltipManager } = foundry.helpers.interaction;

/** @inheritDoc */
export default class TeriockTooltipManager extends TooltipManager {
  #RICH_TOOLTIP_WIDTH = 350;

  /**
   * Fetch a rich tooltip.
   * @param {HTMLElement} element
   */
  async #fetchRichTooltip(element) {
    const uuid = element.dataset.tooltipUuid || game.teriock.identifiers.get(element.dataset.tooltipIdentifier);
    if (!["ActiveEffect", "Actor", "Item", "JournalEntryPage"].includes(foundry.utils.parseUuid(uuid)?.type)) return;
    const doc = await fromUuid(uuid);
    if (doc && typeof doc.toTooltip === "function") {
      element.dataset.tooltipHtml = await doc.toTooltip();
      element.dataset.tooltipFetched = "true";
      if (element === this.element) this.activate(element);
    }
  }

  /**
   * Prepare tooltips to be fetched.
   * @param {PointerEvent} event
   */
  #onActivateRich(event) {
    const element = event.target;
    if ((element.dataset.tooltipUuid || element.dataset.tooltipIdentifier) && !element.dataset.tooltipFetched) {
      element.dataset.tooltipClass = "teriock-rich-tooltip";
      element.dataset.tooltipHtml = TeriockTextEditor.loadingPanelHTML;
      this.#fetchRichTooltip(element);
    }
  }

  /** @inheritdoc */
  _setAnchor(direction) {
    if (this.element.dataset.tooltipClass === "teriock-rich-tooltip") {
      if (!["LEFT", "RIGHT"].includes(direction)) direction = "RIGHT";
      const rect = this.element.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;
      if (direction === "LEFT" && leftSpace < this.#RICH_TOOLTIP_WIDTH) direction = "RIGHT";
      else if (direction === "RIGHT" && rightSpace < this.#RICH_TOOLTIP_WIDTH) direction = "LEFT";
    }
    super._setAnchor(direction);
  }

  /** @inheritDoc */
  activateListeners(document, { _deprecated = false } = {}) {
    document ??= window.document;
    document.body.addEventListener("pointerenter", this.#onActivateRich.bind(this), { capture: true, passive: true });
    super.activateListeners(document, { _deprecated });
  }

  /**
   * Reactivate the tooltip.
   * @param options
   */
  reactivate(options = {}) {
    if (this.element) this.activate(this.element, options);
  }
}
