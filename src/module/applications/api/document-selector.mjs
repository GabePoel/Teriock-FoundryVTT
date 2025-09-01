const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { SearchFilter } = foundry.applications.ux;

// noinspection JSClosureCompilerSyntax
/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 */
export default class TeriockDocumentSelector extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  constructor(docs, { multi = true, hint = "", tooltip = true } = {}, ...args) {
    super(...args);
    this.docs = docs;
    this.multi = multi;
    this.hint = hint;
    this.tooltip = tooltip;

    this._resolve = null;
    this._result = new Promise((resolve) => (this._resolve = resolve));
    console.log(this);
  }

  static DEFAULT_OPTIONS = {
    classes: ["teriock", "dynamic-select", "dialog"],
    actions: { ok: this._getSelected, cancel: this._cancel },
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

  static async _cancel(event) {
    event?.preventDefault();
    // noinspection JSUnresolvedReference
    this._finish(this.multi ? [] : null);
    await this.close();
  }

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
      if (radio) ids = [radio.value];
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

  _initSearchFilter() {
    const root = this.element;
    if (!root) return;

    const input = root.querySelector(".search-input");
    const content = root.querySelector(".doc-select");
    if (!input || !content) return;

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

  /** @inheritDoc */
  _onClose() {
    this._finish(this.multi ? [] : null);
  }

  /** @inheritDoc */
  async _onRender(options) {
    await super._onRender(options);
    this._initSearchFilter();
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      documents: this.docs,
      multi: this.multi,
      hint: this.hint,
      tooltip: this.tooltip,
    });
    console.log(context);
    return context;
  }

  async select() {
    await this.render(true);
    return this._result;
  }
}
