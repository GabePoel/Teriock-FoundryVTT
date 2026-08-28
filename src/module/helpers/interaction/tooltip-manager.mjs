import { toClass } from "../string.mjs";

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
   * @type {Set<Teriock.Documents.DocumentName>}
   */
  #allowedDocumentNames;

  /**
   * The HTML to display for a tooltip that's loading.
   * @type {string}
   */
  #loadingTooltipHTML;

  /**
   * Constrain a rich tooltip to the space below its current top so any content that expands doesn't go off screen.
   * @param {HTMLElement} tooltip
   */
  #constrainTooltip(tooltip) {
    const pad = this.constructor.TOOLTIP_MARGIN_PX;
    const { innerHeight } = tooltip.ownerDocument.defaultView;
    const top = tooltip.style.top ? parseFloat(tooltip.style.top) : tooltip.getBoundingClientRect().top;
    if (!Number.isFinite(top)) { return; }
    tooltip.style.maxHeight = `${Math.max(0, innerHeight - top - pad)}px`;
    tooltip.style.overflowY = "auto";
  }

  /**
   * Fetch a rich tooltip.
   * @param {HTMLElement} element
   */
  async #fetchRichTooltip(element) {
    const uuid = element.dataset.tooltipUuid || game.teriock.identifiers.get(element.dataset.tooltipIdentifier);
    if (!this.#validateUuid(uuid)) { return; }
    const doc = await fromUuid(uuid);
    if (doc && typeof doc.toTooltip === "function" && doc.isViewer) {
      element.dataset.tooltipHtml = await doc.toTooltip();
    } else {
      delete element.dataset.tooltipClass;
      delete element.dataset.tooltipHtml;
    }
    element.dataset.tooltipFetched = "true";
    if (element === this.element) { this.activate(element); }
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
      const tooltipClass = [element.dataset.tooltipClass];
      tooltipClass.push(TeriockTooltipManager.RICH_TOOLTIP_CLASS);
      element.dataset.tooltipClass = toClass(tooltipClass.filter(Boolean));
      element.dataset.tooltipHtml = this.#loadingTooltipHTML;
      this.#fetchRichTooltip(element);
    }
  }

  /**
   * Toggle collapsible sections inside rich tooltips.
   * @param {PointerEvent} event
   */
  #onToggleCollapse(event) {
    const target = event.target?.closest?.(
      `.${TeriockTooltipManager.RICH_TOOLTIP_CLASS} [data-action='toggleCollapse']:not(.teriock-panel-header)`,
    );
    if (!target) { return; }
    const collapsible = target.closest(".collapsible[data-collapsible-id]");
    if (!collapsible) { return; }
    event.preventDefault();
    event.stopPropagation();
    const tooltip = target.closest(`.${TeriockTooltipManager.RICH_TOOLTIP_CLASS}`);
    if (tooltip && collapsible.classList.contains("collapsed")) { this.#constrainTooltip(tooltip); }
    collapsible.classList.toggle("collapsed");
  }

  /**
   * Check if a UUID can have a rich tooltip. Only certain documents allow them.
   * @param {UUID<TeriockDocument>} uuid
   * @returns {boolean}
   */
  #validateUuid(uuid) {
    if (!uuid) { return false; }
    if (!this.#allowedDocumentNames) {
      this.#allowedDocumentNames = game.settings.get("teriock", "documentTooltips");
      if (this.#allowedDocumentNames.has("ActiveEffect")) { this.#allowedDocumentNames.add("VirtualCondition"); }
      if (this.#allowedDocumentNames.has("JournalEntryPage")) { this.#allowedDocumentNames.add("Affinity"); }
    }
    const documentName = foundry.utils.parseUuid(uuid)?.type;
    return this.#allowedDocumentNames.has(documentName);
  }

  /** @inheritdoc */
  _setAnchor(direction) {
    const DIRECTIONS = TeriockTooltipManager.TOOLTIP_DIRECTIONS;
    if ((this.element.dataset.tooltipClass ?? "").includes(TeriockTooltipManager.RICH_TOOLTIP_CLASS)) {
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
    document.body.addEventListener("click", this.#onToggleCollapse.bind(this), { capture: true });
    super.activateListeners(document, { _deprecated });
  }

  /**
   * Initialize the loading tooltip.
   * @return {Promise<void>}
   */
  async initializeLoadingTooltip() {
    await game.teriock.templatesReady;
    const loadingPanel = new teriock.data.pseudoDocuments.Panel(TERIOCK.display.panel.premade.loading);
    this.#loadingTooltipHTML = await loadingPanel.renderHTML();
  }

  /**
   * Reactivate the tooltip.
   * @param options
   */
  reactivate(options = {}) {
    if (this.element) { this.activate(this.element, options); }
  }
}
