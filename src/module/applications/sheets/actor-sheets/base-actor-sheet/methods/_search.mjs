const { SearchFilter } = foundry.applications.ux;

/**
 * @param {TeriockBaseActorSheet} sheet
 */
export function _initSearchFilters(sheet) {
  sheet.element.querySelectorAll(".tcard-search[data-search-key]").forEach(
    /** @param {HTMLInputElement} input */ (input) => {
      const searchKey = input.dataset.searchKey;
      if (!searchKey) return;

      const resultsContainer = sheet.element.querySelector(
        `.tcard-results[data-search-key="${searchKey}"]`,
      );
      if (!resultsContainer) return;

      const initial = sheet._searchStrings[searchKey] || "";

      const searchFilter = new SearchFilter({
        inputSelector: `.tcard-search[data-search-key="${searchKey}"]`,
        contentSelector: `.tcard-results[data-search-key="${searchKey}"]`,
        initial: initial,
        callback: (_event, query, rgx, container) => {
          sheet._searchStrings[searchKey] = query;
          container.querySelectorAll(".tcard").forEach((card) => {
            const title = card.querySelector(".tcard-title")?.textContent ?? "";
            const isMatch = rgx ? rgx.test(title) : true;
            card.classList.toggle("hidden", !isMatch);
          });
        },
      });
      searchFilter.bind(sheet.element);
    },
  );
}
