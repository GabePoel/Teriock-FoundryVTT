import { BasePreviewModel } from "../../../../../data/models/preview-models/_module.mjs";
import { HTMLTernaryElement } from "../../../../elements/_module.mjs";

const { SearchFilter } = foundry.applications.ux;

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function PreviewCommonSheetPart(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class PreviewCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { sheetToggle: this._onSheetToggle } };

      /**
       * Toggles a boolean field on the sheet and re-renders.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onSheetToggle(_event, target) {
        const { path } = target.dataset;
        const current = target.dataset.bool === "true";
        this.setPreviewSource(path, !current);
        await this.render();
      }

      constructor(...args) {
        super(...args);
        this.previewMenus = {};
        for (const [type, options] of Object.entries(TERIOCK.config.document)) {
          let PreviewModelCls = BasePreviewModel;
          if (options?.previewModel) {
            PreviewModelCls = options.previewModel;
          }
          this.previewMenus[type] = new PreviewModelCls({ name: type }, { parent: this.document });
        }
        this.previewMenus.children = new BasePreviewModel({ name: "children" }, { parent: this.document });
        this.previewMenus.children.updateSource({ display: { gapless: true, size: "small" } });
        /** @type {Record<string, string>} */
        this._searchStrings = {};
      }

      /** @type {Record<string, BasePreviewModel>} */
      previewMenus;

      /**
       * Bind a {@link SearchFilter} to every preview search input rendered on the sheet, scoping each to its
       * `data-search-key` results container and persisting the query onto the matching preview model.
       */
      _initSearchFilters() {
        this.element.querySelectorAll(".teriock-block-search[data-search-key]").forEach(
          /** @param {HTMLInputElement} input */ input => {
            const searchKey = input.dataset.searchKey;
            if (!searchKey) { return; }
            const resultsContainer = this.element.querySelector(
              `.teriock-block-results[data-search-key="${searchKey}"]`,
            );
            if (!resultsContainer) { return; }
            const preview = this.previewMenus?.[searchKey];
            const initial = preview ? preview.search : (this._searchStrings[searchKey] || "");
            const searchFilter = new SearchFilter({
              contentSelector: `.teriock-block-results[data-search-key="${searchKey}"]`,
              initial,
              inputSelector: `.teriock-block-search[data-search-key="${searchKey}"]`,
              callback: (_event, query, rgx, container) => {
                this._searchStrings[searchKey] = query;
                if (preview) { preview.updateSource({ search: query }); }
                container.querySelectorAll(".teriock-block").forEach(card => {
                  const title = card.querySelector(".teriock-block-title")?.textContent ?? "";
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
        this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(/** @param {HTMLElement} el */ el => {
          const uuid = el.dataset.uuid;
          fromUuid(uuid).then(doc => doc?.onEmbed(el));
        });
        this.element.querySelectorAll("[name^=\"previewMenus.\"]").forEach(el => {
          el.addEventListener("change", e => {
            /** @type {AbstractFormInputElement} */
            const filterElement = e.target;
            this.setPreviewSource(filterElement.name, filterElement.value);
            if (filterElement instanceof HTMLTernaryElement) { setTimeout(() => this.render(), 250); }
            else { this.render(); }
          });
        });
        this.element.querySelectorAll("[data-action='sheetSelect']").forEach(/** @param {HTMLInputElement} el */ el => {
          el.addEventListener("change", async () => {
            this.setPreviewSource(el.dataset.path, el.value);
            await this.render();
          });
        });
        this._initSearchFilters();
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        const children = await this.document.getVisibleChildren();
        const single = this.document.visibleTypes.length === 1;
        context.addType = single ? this.document.visibleTypes[0] : "children";
        context.addButton = single;
        context.addMenu = !single;
        context.searchStrings = foundry.utils.deepClone(this._searchStrings);
        context.previews = this.previewMenus;
        context.filterForms = {};
        context.previewGroups = {};
        context.previewSortOrders = {};

        // Prepare previews by type
        for (const [type, config] of Object.entries(TERIOCK.config.document)) {
          if (config.getter && ["ActiveEffect", "Item"].includes(config.documentName)) {
            context[config.getter] = config.sorter(children.filter(c => c.type === type));
            context.filterForms[type] = this.previewMenus[type]?._getEditorFormsSync().outerHTML;
            context.previewSortOrders[type] = this.previewMenus[type]?.constructor.sortOrders;
            context.previewGroups[type] = [{
              docs: this.previewMenus[type].previewDocuments(context[config.getter]),
              empty: config.plural,
            }];
          }
        }

        // Prepare the consolidated "children" preview
        const childrenGroups = [];
        for (const type of this.document.visibleTypes) {
          const config = TERIOCK.config.document[type];
          const docs = context[config.getter];
          if (docs?.length) {
            childrenGroups.push({ docs: this.previewMenus.children.previewDocuments(docs), empty: config.plural });
          }
        }
        if (!childrenGroups.length) {
          childrenGroups.push({ docs: [], empty: _loc("TERIOCK.DOCUMENTS.document.plural") });
        }
        context.previewGroups.children = childrenGroups;
        context.filterForms.children = this.previewMenus.children?._getEditorFormsSync().outerHTML;
        context.previewSortOrders.children = this.previewMenus.children?.constructor.sortOrders;

        // Initial open/closed state for each preview's collapse toggle-buttons.
        context.previewToggles = {};
        for (const type of Object.keys(this.previewMenus)) {
          const open = menu => !(this.collapsibleElements.get(`preview-${type}-${menu}`) ?? true);
          context.previewToggles[type] = { block: open("block"), filter: open("filter"), sort: open("sort") };
        }
        return context;
      }

      /** @inheritDoc */
      _toggleCollapsed(collapsibleId, collapsed) {
        collapsed = super._toggleCollapsed(collapsibleId, collapsed);
        for (const tb of this.element.querySelectorAll(`toggle-button[data-collapsible-target=${collapsibleId}]`)) {
          if (tb.isConnected) { tb.value = !collapsed; }
          else { tb.setAttribute("value", String(!collapsed)); }
        }
      }

      /**
       * Apply a change to a preview model's source from a `previewMenus.<type>.<path>` form/data path. Any other
       * path falls back to a direct property set so the generic toggle handlers stay safe.
       * @param {string} formPath
       * @param {*} value
       */
      setPreviewSource(formPath, value) {
        if (!formPath?.startsWith("previewMenus.")) {
          foundry.utils.setProperty(this, formPath, value);
          return;
        }
        const [, type, ...rest] = formPath.split(".");
        this.previewMenus[type]?.updateSource({ [rest.join(".")]: value });
      }
    }
  );
}
