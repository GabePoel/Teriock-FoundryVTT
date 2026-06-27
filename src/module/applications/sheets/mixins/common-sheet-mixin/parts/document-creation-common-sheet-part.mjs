import { BasePreviewModel } from "../../../../../data/models/preview-models/_module.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { toKebabCase } from "../../../../../helpers/string.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";
import { newDocumentDialog } from "../../../../dialogs/_module.mjs";
import { selectClassDialog, selectTradecraftDialog } from "../../../../dialogs/select-dialog.mjs";
import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";
import { HTMLTernaryElement } from "../../../../elements/_module.mjs";

const { SearchFilter } = foundry.applications.ux;

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default Base => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class DocumentCreationCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = { actions: { createChild: this._onCreateChild } };

      /**
       * Create a child document from a preview add button.
       * @this {DocumentCreationCommonSheetPart}
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onCreateChild(_event, target) {
        const type = /** @type {Teriock.Documents.ChildType|undefined} */ target.dataset.type;
        if (type) { await this._createChild(type); }
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
       * Connect a left-click context menu to the consolidated children add button.
       */
      _connectChildrenCreateMenu() {
        if (!this.isEditable || typeof this._connectContextMenu !== "function") { return; }
        const types = this.document.visibleTypes;
        if (types.length <= 1 || !this.element.querySelector(".children-add-button")) { return; }
        this._connectContextMenu(
          ".children-add-button",
          types.map(type => ({
            icon: makeIconClass(TERIOCK.config.document[type].icon, "contextMenu"),
            label: _loc("TERIOCK.SHEETS.Common.PREVIEW.addType", { type: TERIOCK.config.document[type].label }),
            onClick: () => this._createChild(type),
          })),
          "click",
          undefined,
          true,
        );
      }

      /**
       * Create a child document of the given type.
       * @this {DocumentCreationCommonSheetPart}
       * @param {Teriock.Documents.ChildType} type
       * @returns {Promise<void>}
       */
      async _createChild(type) {
        switch (type) {
          case "rank":
            return this._onCreateRank();
          case "fluency":
            return this._onCreateFluency();
          case "equipment":
            return this._onCreateEquipment();
          default: {
            const obj = await resolveCreateObject(type);
            if (!obj) { return; }
            await this.document.createChildDocuments(TERIOCK.config.document[type]?.documentName, [obj]);
          }
        }
      }

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

      /**
       * Adds a new {@link TeriockEquipment} to the current document.
       * @returns {Promise<void>}
       */
      async _onCreateEquipment() {
        const obj = await resolveCreateObject("equipment");
        if (!obj) { return; }
        const stack = await this._stackEquipment(obj);
        if (!stack) {
          await this.document.createChildDocuments(TERIOCK.config.document.equipment.documentName, [obj]);
        }
      }

      /**
       * Adds a new {@link TeriockFluency} to the current document.
       * @returns {Promise<void>}
       */
      async _onCreateFluency() {
        const tc = await selectTradecraftDialog();
        if (tc) {
          const f = TERIOCK.config.tradecraft.tradecrafts[tc].field;
          await this.document.createChildDocuments("ActiveEffect", [{
            img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
            name: _loc("TERIOCK.SHEETS.Common.MENU.Create.fluency", { tradecraft: TERIOCK.reference.tradecrafts[tc] }),
            system: { field: f, tradecraft: tc },
            type: "fluency",
          }]);
        }
      }

      /**
       * Adds a new {@link TeriockRank} to the current document.
       * @returns {Promise<void>}
       * @todo There is 100% a simpler/more generalized version of this that could be made.
       */
      async _onCreateRank() {
        const rankClass = await selectClassDialog();
        const innate = this.document.documentName !== "Actor";
        if (!rankClass) { return; }
        const classIdentifier = toKebabCase(rankClass);
        const possibleRanks = await Promise.all([
          teriock.fromIdentifier(`rank:rank-1-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-2-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-3-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-4-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-5-${classIdentifier}`),
        ]);
        const referenceRank = /**@type {TeriockRank} */ await selectDocumentDialog(possibleRanks, {
          openable: true,
          title: _loc("TERIOCK.SHEETS.Common.MENU.CreateRank.title"),
        });
        const rankNumber = referenceRank.system.number;
        const rank = /** @type {TeriockRank} */ referenceRank.clone();
        rank.updateSource({ "system.instructions": "" });
        if (rankNumber <= 2) {
          const toCreate = rank.toObject(true);
          toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, { innate });
          await this.document.createChildDocuments("Item", [toCreate]);
          return;
        }
        /** @type {TeriockRank[]} */
        const existingRanks = (await this.document.getRanks()).filter(r => r.system._source.class === classIdentifier);
        const combatAbilityNames = new Set(
          referenceRank.abilities.filter(a => a.getFlag("teriock", "category") === "combat").map(a => a.name),
        );
        const availableCombatAbilityNames = new Set(combatAbilityNames);
        const supportAbilityNames = new Set(
          referenceRank.abilities.filter(a => a.getFlag("teriock", "category") === "support").map(a => a.name),
        );
        const availableSupportAbilityNames = new Set(supportAbilityNames);
        for (const existingRank of existingRanks) {
          for (const ability of existingRank.abilities) {
            const existingAbility = rank.abilities.find(a => a.name === ability.name);
            if (existingAbility) {
              availableCombatAbilityNames.delete(existingAbility.name);
              availableSupportAbilityNames.delete(existingAbility.name);
            }
          }
        }
        const chosenAbilityNames = [];
        if (availableCombatAbilityNames.size > 1) {
          const availableCombatAbilities = referenceRank.abilities.filter(a => availableCombatAbilityNames.has(a.name));
          const chosenCombatAbility = await selectDocumentDialog(availableCombatAbilities, {
            openable: true,
            title: _loc("TERIOCK.SHEETS.Common.MENU.CreateRank.selectCombat"),
          });
          const chosenCombatAbilityName = chosenCombatAbility.name;
          chosenAbilityNames.push(chosenCombatAbilityName);
        } else {
          chosenAbilityNames.push(...availableCombatAbilityNames);
        }
        if (availableSupportAbilityNames.size > 1) {
          const availableSupportAbilities = referenceRank.abilities.filter(a =>
            availableSupportAbilityNames.has(a.name)
          );
          const chosenSupportAbility = await selectDocumentDialog(availableSupportAbilities, {
            openable: true,
            title: _loc("TERIOCK.SHEETS.Common.MENU.CreateRank.selectSupport"),
          });
          const supportAbilityName = chosenSupportAbility.name;
          chosenAbilityNames.push(supportAbilityName);
        } else {
          chosenAbilityNames.push(...availableSupportAbilityNames);
        }
        const abilities = rank.effects;
        const allowedAbilityIds = new Set();
        for (const chosenAbilityName of chosenAbilityNames) {
          /** @type {TeriockAbility} */
          const chosenAbility = abilities.getName(chosenAbilityName);
          allowedAbilityIds.add(chosenAbility.id);
          chosenAbility.allSubs.map(a => allowedAbilityIds.add(a.id));
        }
        for (const ability of abilities) { if (!allowedAbilityIds.has(ability?.id)) { abilities.delete(ability?.id); } }
        const toCreate = game.items.fromCompendium(rank);
        toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, { innate });
        await this.document.createChildDocuments("Item", [toCreate]);
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
        this._initSearchFilters();
        this._connectChildrenCreateMenu();
      }

      /**
       * Build grouped preview sections for the consolidated children block.
       * @param {object} context
       */
      _prepareChildrenPreviewGroups(context) {
        const groups = [];
        for (const type of this.document.visibleTypes) {
          const config = TERIOCK.config.document[type];
          const docs = context[config.getter];
          if (docs?.length) {
            groups.push({ docs: this.previewMenus.children.previewDocuments(docs ?? []), empty: config.plural });
          }
        }
        if (!groups.length) {
          groups.push({ docs: [], empty: _loc("TERIOCK.DOCUMENTS.document.plural") });
        }
        context.previewGroups.children = groups;
        context.filterForms.children = this.previewMenus.children?._getEditorFormsSync().outerHTML;
        context.previewSortOrders.children = this.previewMenus.children?.constructor.sortOrders;
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        let children = await this.document.getVisibleChildren();
        children = children.filter(c => {
          if (foundry.utils.hasProperty(c, "system.revealed")) {
            return foundry.utils.getProperty(c, "system.revealed") || game.user.isGM;
          }
          return true;
        });
        context.filterForms = {};
        context.previews = this.previewMenus;
        context.previewGroups = {};
        context.previewSortOrders = {};
        context.addType = this.document.visibleTypes.length !== 1 ? "children" : this.document.visibleTypes[0];
        context.addButton = this.document.visibleTypes.length === 1;
        context.addMenu = !context.addButton;
        context.searchStrings = foundry.utils.deepClone(this._searchStrings);
        for (const [type, options] of Object.entries(TERIOCK.config.document)) {
          if (options?.getter && ["ActiveEffect", "Item"].includes(options?.documentName)) {
            context[options.getter] = TERIOCK.config.document[type].sorter(children.filter(c => c.type === type));
            context.filterForms[type] = this.previewMenus[type]?._getEditorFormsSync().outerHTML;
            context.previewSortOrders[type] = this.previewMenus[type]?.constructor.sortOrders;
            context.previewGroups[type] = [{
              docs: this.previewMenus[type].previewDocuments(context[options.getter]),
              empty: options.plural,
            }];
          }
        }
        this._prepareChildrenPreviewGroups(context);
        return context;
      }

      /**
       * Attempt to stack a piece of equipment that would otherwise be created.
       * @param {TeriockEquipment|object} equipment
       * @returns {Promise<TeriockEquipment|false>} - Either the equipment this was stacked with or `false` if not stacked.
       */
      async _stackEquipment(equipment) {
        if (
          foundry.utils.getProperty(equipment, "system.consumable")
          && foundry.utils.getProperty(equipment, "system.quantity")
          && equipment?.name
        ) {
          const stackCandidates = (await this.document.getEquipment()).filter(e =>
            e.master?.uuid === this.document.uuid
            && e.name === equipment.name
            && e.system.identifier === foundry.utils.getProperty(equipment, "system.identifier")
            && e.system.consumable
            && e.system.quantity < e.system.maxQuantity.value
          );
          if (stackCandidates?.length > 0) {
            const selected = await selectDocumentDialog(stackCandidates, {
              auto: false,
              hint: _loc("TERIOCK.SHEETS.Common.DIALOGS.EquipmentStackConfirmation.hint", { name: equipment.name }),
              openable: true,
              silent: true,
              textKey: "system.remainingString",
              title: _loc("TERIOCK.SHEETS.Common.DIALOGS.EquipmentStackConfirmation.title"),
            });
            if (selected) {
              await selected.update({ "system.quantity": selected.system.quantity + equipment.system.quantity });
              return selected;
            }
          }
        }
        return false;
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
};

/**
 * Resolve a creation object from config, optionally via the new-document import dialog.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<object|null>}
 */
async function resolveCreateObject(type) {
  const obj = {
    name: _loc("TERIOCK.SHEETS.Common.MENU.Create.document", { type: TERIOCK.config.document[type]?.label }),
    type,
  };
  if (!TERIOCK.config.document[type]?.importDialog) { return obj; }
  const decision = await newDocumentDialog(type);
  if (!decision) { return null; }
  if (decision === "import") {
    const picked = await TERIOCK.config.document[type]?.importDialog();
    if (!picked) { return null; }
    if (TERIOCK.config.document[type]?.documentName === "Item") { return game.items.fromCompendium(picked); }
    return foundry.utils.mergeObject(picked.toObject(), { _stats: { compendiumSource: picked.uuid } });
  }
  return obj;
}
