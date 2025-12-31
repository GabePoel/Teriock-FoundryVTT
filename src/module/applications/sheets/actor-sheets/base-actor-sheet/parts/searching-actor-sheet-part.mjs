const { SearchFilter } = foundry.applications.ux;

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof TeriockBaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {TeriockBaseActorSheet}
   * @mixin
   */
  class SearchingActorSheetPart extends Base {
    constructor(...args) {
      super(...args);
      /** @type {Record<string, string>} */
      this._searchStrings = {};
    }

    /** @inheritDoc */
    _initSearchFilters() {
      this.element
        .querySelectorAll(".teriock-block-search[data-search-key]")
        .forEach(
          /** @param {HTMLInputElement} input */ (input) => {
            const searchKey = input.dataset.searchKey;
            if (!searchKey) {
              return;
            }

            const resultsContainer = this.element.querySelector(
              `.teriock-block-results[data-search-key="${searchKey}"]`,
            );
            if (!resultsContainer) {
              return;
            }
            const initial = this._searchStrings[searchKey] || "";
            const searchFilter = new SearchFilter({
              inputSelector: `.teriock-block-search[data-search-key="${searchKey}"]`,
              contentSelector: `.teriock-block-results[data-search-key="${searchKey}"]`,
              initial: initial,
              callback: (_event, query, rgx, container) => {
                this._searchStrings[searchKey] = query;
                container.querySelectorAll(".teriock-block").forEach((card) => {
                  const title =
                    card.querySelector(".teriock-block-title")?.textContent ??
                    "";
                  const isMatch = rgx ? rgx.test(title) : true;
                  card.classList.toggle("hidden", !isMatch);
                });
              },
            });
            searchFilter.bind(this.element);
          },
        );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._initSearchFilters();
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.searchStrings = foundry.utils.deepClone(this._searchStrings);
      return context;
    }
  };
