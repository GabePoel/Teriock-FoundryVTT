import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import TeriockBaseApplication from "./base-application.mjs";

const { SearchFilter } = foundry.applications.ux;

/**
 * @property {function} _finish
 */
export default class TeriockDocumentSelector extends TeriockBaseApplication {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { cancel: this._onCancel, ok: this._onGetSelected },
    classes: ["dynamic-select", "dialog"],
    position: { width: 450 },
    window: {
      contentClasses: ["standard-form"],
      icon: makeIconClass(icons.ui.select, "title"),
      resizable: true,
      title: "TERIOCK.DIALOGS.Select.Document.title",
    },
  };

  static PARTS = {
    all: {
      scrollable: [".doc-list-container"],
      template: "teriock/dialogs/select",
    },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   */
  static async _onCancel(event) {
    event?.preventDefault();
    this._finish(this.multi ? [] : null);
    await this.close();
  }

  /**
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   */
  static async _onGetSelected(event) {
    event?.preventDefault();
    const root = this.element;
    let ids = [];
    if (this.multi) {
      ids = Array.from(root.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.name);
    } else {
      const radio = root.querySelector('input[name="choice"]:checked');
      if (radio) {
        ids = [radio.value];
      }
    }
    this._finish(ids);
    await this.close();
  }

  /**
   *
   * @param {Record<string, Teriock.SelectOptions.SelectDocument> }docs
   * @param {Partial<Teriock.SelectOptions.DocumentsSelect>} options
   * @param args
   */
  constructor(docs, options = {}, ...args) {
    const { hint = "", multi = true, openable = false, tooltip = true, tooltipAsync = false } = options;
    super(...args);
    this.docs = docs;
    this.multi = multi;
    this.hint = hint;
    this.tooltip = tooltip;
    this.tooltipAsync = tooltipAsync;
    this.openable = openable;
    if (options.title) {
      this.config = foundry.utils.mergeObject(this.options || {}, {
        window: { title: options.title },
      });
    }
    this._resolve = null;
    this._result = new Promise(resolve => (this._resolve = resolve));
  }

  /**
   * Finish the document selection.
   */
  _finish(value) {
    if (this._resolve) {
      const r = this._resolve;
      this._resolve = null;
      r(value);
    }
  }

  /**
   * Initialize the tooltip loader.
   */
  _initClickLoader() {
    this.element.querySelectorAll("[data-uuid]").forEach(
      /** @param {HTMLElement} el */ el => {
        if (this.openable) {
          el.addEventListener("dblclick", async ev => {
            const target = /** @type {HTMLElement} */ ev.currentTarget;
            const uuid = target.dataset.uuid;
            const doc = /** @type {AnyChildDocument} */ await fromUuid(uuid);
            await doc.sheet.render(true);
          });
        }
      },
    );
  }

  /**
   * Initialize the search filter.
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
      contentSelector: ".doc-select",
      initial: "",
      inputSelector: ".search-input",
      callback: (_e, _q, rgx, container) => {
        container.querySelectorAll(".doc-select-item").forEach(
          /** @param {HTMLLIElement} card */ card => {
            const title = card.querySelector(".doc-name-container")?.textContent ?? "";
            const match = rgx ? rgx.test(title) : true;
            card.style.display = match ? "block" : "none";
          },
        );
      },
    });
    searchFilter.bind(root);
  }

  /** @inheritDoc */
  _onClose() {
    this._finish(this.multi ? [] : null);
  }

  /** @inheritDoc */
  async _onRender(context, options = {}) {
    await super._onRender(context, options);
    this._initSearchFilter();
    this._initClickLoader();
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      buttons: [
        {
          action: "ok",
          icon: makeIconClass(TERIOCK.display.icons.ui.done, "button"),
          label: "COMMON.Confirm",
          type: "submit",
        },
      ],
      documents: this.docs,
      hint: this.hint,
      multi: this.multi,
      tooltip: this.tooltip,
      tooltipAsync: this.tooltipAsync,
    });
  }

  /**
   * @returns {Promise<object>}
   */
  async select() {
    await this.render(true);
    return this._result;
  }
}
