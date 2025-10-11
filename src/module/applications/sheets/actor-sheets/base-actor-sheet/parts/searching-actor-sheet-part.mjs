const { SearchFilter } = foundry.applications.ux;

export default (Base) =>
  class SearchingActorSheetPart extends Base {
    constructor(...args) {
      super(...args);
      /** @type {Record<string, string>} */
      this._searchStrings = {};
    }

    _initSearchFilters() {
      this.element.querySelectorAll(".tcard-search[data-search-key]").forEach(
        /** @param {HTMLInputElement} input */ (input) => {
          const searchKey = input.dataset.searchKey;
          if (!searchKey) {
            return;
          }

          const resultsContainer = this.element.querySelector(
            `.tcard-results[data-search-key="${searchKey}"]`,
          );
          if (!resultsContainer) {
            return;
          }
          const initial = this._searchStrings[searchKey] || "";
          const searchFilter = new SearchFilter({
            inputSelector: `.tcard-search[data-search-key="${searchKey}"]`,
            contentSelector: `.tcard-results[data-search-key="${searchKey}"]`,
            initial: initial,
            callback: (_event, query, rgx, container) => {
              this._searchStrings[searchKey] = query;
              container.querySelectorAll(".tcard").forEach((card) => {
                const title =
                  card.querySelector(".tcard-title")?.textContent ?? "";
                const isMatch = rgx ? rgx.test(title) : true;
                card.classList.toggle("hidden", !isMatch);
              });
            },
          });
          searchFilter.bind(this.element);
        },
      );
    }

    async _onRender(context, options) {
      await super._onRender(context, options);
      this._initSearchFilters();
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.searchStrings = foundry.utils.deepClone(this._searchStrings);
      return context;
    }
  };
