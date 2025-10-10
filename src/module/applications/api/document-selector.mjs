import { RichApplicationMixin } from "../shared/mixins/_module.mjs";

const { ApplicationV2 } = foundry.applications.api;
const { SearchFilter } = foundry.applications.ux;

// noinspection JSClosureCompilerSyntax
/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 */
export default class TeriockDocumentSelector extends RichApplicationMixin(
  ApplicationV2,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "dynamic-select", "dialog"],
    actions: {
      ok: this._getSelected,
      cancel: this._cancel,
    },
    window: {
      icon: "fa-solid fa-circle-check",
      title: "Select Document",
      resizable: true,
    },
    position: {
      width: 450,
    },
  };

  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/dialog-templates/select.hbs",
      scrollable: [".doc-list-container"],
    },
  };

  /**
   *
   * @param {Record<string, Teriock.SelectOptions.SelectDocument> }docs
   * @param {Partial<Teriock.SelectOptions.DocumentsSelect>} options
   * @param args
   */
  constructor(docs, options = {}, ...args) {
    const {
      multi = true,
      hint = "",
      tooltip = true,
      tooltipAsync = false,
      openable = false,
    } = options;
    super(...args);
    this.docs = docs;
    this.multi = multi;
    this.hint = hint;
    this.tooltip = tooltip;
    this.tooltipAsync = tooltipAsync;
    this.openable = openable;

    this._resolve = null;
    this._result = new Promise((resolve) => (this._resolve = resolve));
  }

  /**
   * @param {MouseEvent} event
   * @returns {Promise<void>}
   * @private
   */
  static async _cancel(event) {
    event?.preventDefault();
    // noinspection JSUnresolvedReference
    this._finish(this.multi ? [] : null);
    await this.close();
  }

  /**
   * @param {MouseEvent} event
   * @returns {Promise<void>}
   * @private
   */
  static async _getSelected(event) {
    event?.preventDefault();
    const root = this.element;
    let ids = [];
    if (this.multi) {
      ids = Array.from(
        root.querySelectorAll('input[type="checkbox"]:checked'),
      ).map((el) => el.name);
    } else {
      const radio = root.querySelector('input[name="choice"]:checked');
      if (radio) {
        ids = [radio.value];
      }
    }
    // noinspection JSUnresolvedReference
    this._finish(ids);
    await this.close();
  }

  _finish(value) {
    if (this._resolve) {
      const r = this._resolve;
      this._resolve = null;
      r(value);
    }
  }

  /**
   * Initialize the search filter.
   * @private
   */
  _initSearchFilter() {
    const root = this.element;
    if (!root) {
      return;
    }
    const input = root.querySelector(".search-input");
    const content = root.querySelector(".doc-select");
    if (!input || !content) {
      return;
    }
    const searchFilter = new SearchFilter({
      inputSelector: ".search-input",
      contentSelector: ".doc-select",
      initial: "",
      callback: (_e, _q, rgx, container) => {
        container.querySelectorAll(".doc-select-item").forEach(
          /** @param {HTMLLIElement} card */ (card) => {
            const title =
              card.querySelector(".doc-name-container")?.textContent ?? "";
            const match = rgx ? rgx.test(title) : true;
            card.style.display = match ? "block" : "none";
          },
        );
      },
    });
    searchFilter.bind(root);
  }

  /**
   * Initialize the tooltip loader.
   * @private
   */
  _initTooltipLoader() {
    this.element.querySelectorAll("[data-uuid]").forEach(
      /** @param {HTMLElement} el */ (el) => {
        if (this.openable) {
          el.addEventListener("dblclick", async (ev) => {
            const target = /** @type {HTMLElement} */ ev.currentTarget;
            const uuid = target.dataset.uuid;
            const doc = /** @type {TeriockChild} */ await fromUuid(uuid);
            await doc.sheet.render(true);
          });
        }
        if (this.tooltipAsync) {
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
                const tooltipManager =
                  /** @type {TeriockTooltipManager} */ game.tooltip;
                if (
                  tooltipManager.tooltip.getAttribute("data-linked-uuid") ===
                  uuid
                ) {
                  tooltipManager.activate(target);
                }
              }
            }
          });
        }
      },
    );
  }

  /** @inheritDoc */
  _onClose() {
    this._finish(this.multi ? [] : null);
  }

  /** @inheritDoc */
  async _onRender(options) {
    await super._onRender(options);
    this._initSearchFilter();
    this._initTooltipLoader();
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      documents: this.docs,
      multi: this.multi,
      hint: this.hint,
      tooltip: this.tooltip,
      tooltipAsync: this.tooltipAsync,
    });
    return context;
  }

  /**
   * @returns {Promise<object>}
   */
  async select() {
    await this.render(true);
    return this._result;
  }
}
