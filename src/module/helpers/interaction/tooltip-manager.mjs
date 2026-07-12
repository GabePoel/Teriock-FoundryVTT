import TeriockTextEditor from "../../applications/ux/text-editor.mjs";

const { TooltipManager } = foundry.helpers.interaction;

/** @inheritDoc */
export default class TeriockTooltipManager extends TooltipManager {
  /**
   * A custom CSS class which has different padding and other styling for rich document tooltips.
   * @type {string}
   */
  static RICH_TOOLTIP_CLASS = "teriock-rich-tooltip";

  /**
   * All rich document tooltips have the same specified width to fit with reasonable panel dimensions.
   * @type {number}
   */
  static RICH_TOOLTIP_WIDTH = 350;

  /**
   * Internal cache of allowed document names.
   * @type {Set<string>}
   */
  #allowedDocumentNames;

  /**
   * Fetch a rich tooltip.
   * @param {HTMLElement} element
   */
  async #fetchRichTooltip(element) {
    const uuid = element.dataset.tooltipUuid || game.teriock.identifiers.get(element.dataset.tooltipIdentifier);
    if (!this.#validateUuid(uuid)) { return; }
    const doc = await fromUuid(uuid);
    if (doc && typeof doc.toTooltip === "function") {
      if (doc.isViewer) { element.dataset.tooltipHtml = await doc.toTooltip(); }
      else {
        delete element.dataset.tooltipClass;
        delete element.dataset.tooltipHtml;
      }
      element.dataset.tooltipFetched = "true";
      if (element === this.element) { this.activate(element); }
    }
  }

  /**
   * Prepare tooltips to be fetched.
   * @param {PointerEvent} event
   */
  #onActivateRich(event) {
    /** @type {HTMLElement} */
    const element = event.target;
    if ((element.dataset.tooltipUuid || element.dataset.tooltipIdentifier) && !element.dataset.tooltipFetched) {
      const uuid = element.dataset.tooltipUuid || game.teriock.identifiers.get(element.dataset.tooltipIdentifier);
      if (!this.#validateUuid(uuid)) { return; }
      element.dataset.tooltipClass = TeriockTooltipManager.RICH_TOOLTIP_CLASS;
      element.dataset.tooltipHtml = TeriockTextEditor.loadingPanelHTML;
      this.#fetchRichTooltip(element);
    }
  }

  /**
   * Check if a UUID can have a rich tooltip. Only certain documents allow them.
   * @param {UUID<TeriockDocument>} uuid
   * @returns {boolean}
   */
  #validateUuid(uuid) {
    if (!uuid) { return false; }
    if (!this.#allowedDocumentNames) { this.#allowedDocumentNames = game.settings.get(
        "teriock",
        "documentTooltips",
      ); }
    const documentName = foundry.utils.parseUuid(uuid)?.type;
    return this.#allowedDocumentNames.has(documentName);
  }

  /** @inheritdoc */
  _setAnchor(direction) {
    const DIRECTIONS = TeriockTooltipManager.TOOLTIP_DIRECTIONS;
    if (this.element.dataset.tooltipClass === TeriockTooltipManager.RICH_TOOLTIP_CLASS) {
      if (![DIRECTIONS.LEFT, DIRECTIONS.RIGHT].includes(direction)) { direction = DIRECTIONS.RIGHT; }
      const rect = this.element.getBoundingClientRect();
      const leftSpace = rect.left;
      const rightSpace = window.innerWidth - rect.right;
      if (direction === DIRECTIONS.LEFT && leftSpace < TeriockTooltipManager.RICH_TOOLTIP_WIDTH) {
        direction = DIRECTIONS.RIGHT;
      } else if (direction === DIRECTIONS.RIGHT && rightSpace < TeriockTooltipManager.RICH_TOOLTIP_WIDTH) {
        direction = DIRECTIONS.LEFT;
      }
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
    if (this.element) { this.activate(this.element, options); }
  }
}
