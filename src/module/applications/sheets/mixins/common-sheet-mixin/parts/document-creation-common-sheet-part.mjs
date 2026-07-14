import { makeIconClass } from "../../../../../helpers/icon.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { toKebabCase } from "../../../../../helpers/string.mjs";
import { TeriockDialog } from "../../../../api/_module.mjs";
import { DocumentSelector, selectClassDialog, selectTradecraftDialog } from "../../../../dialogs/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function DocumentCreationCommonSheetPart(Base) {
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
            name: _loc("TERIOCK.SHEETS.Common.MENU.Create.fluency", {
              tradecraft: TERIOCK.config.tradecraft.tradecrafts[tc].label,
            }),
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
        const possibleRanks = await Promise.all(
          Array.from({ length: 5 }, (_v, i) => teriock.fromIdentifier(`rank:rank-${i + 1}-${classIdentifier}`)),
        );
        const referenceRank = /**@type {TeriockRank} */ await DocumentSelector.selectSingle(possibleRanks, {
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
        const availableNames = {};
        for (const category of ["combat", "support"]) {
          availableNames[category] = new Set(
            referenceRank.abilities.filter(a => a.getFlag("teriock", "category") === category).map(a => a.name),
          );
        }
        for (const existingRank of existingRanks) {
          for (const ability of existingRank.abilities) {
            const existingAbility = rank.abilities.find(a => a.name === ability.name);
            if (existingAbility) {
              availableNames.combat.delete(existingAbility.name);
              availableNames.support.delete(existingAbility.name);
            }
          }
        }
        const chosenAbilityNames = [];
        for (const [category, titleKey] of [["combat", "selectCombat"], ["support", "selectSupport"]]) {
          const available = availableNames[category];
          if (available.size > 1) {
            const availableAbilities = referenceRank.abilities.filter(a => available.has(a.name));
            const chosenAbility = await DocumentSelector.selectSingle(availableAbilities, {
              openable: true,
              title: _loc(`TERIOCK.SHEETS.Common.MENU.CreateRank.${titleKey}`),
            });
            chosenAbilityNames.push(chosenAbility.name);
          } else {
            chosenAbilityNames.push(...available);
          }
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
        this._connectChildrenCreateMenu();
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
            const selected = await DocumentSelector.selectSingle(stackCandidates, {
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
    }
  );
}

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
  const label = TERIOCK.config.document[type].label;
  const typeName = label.toLowerCase();
  const decision = await TeriockDialog.prompt({
    buttons: [{
      icon: makeIconClass(TERIOCK.display.icons.ui.custom, "button"),
      label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.create"),
      callback: () => "create",
    }],
    content: _loc("TERIOCK.DIALOGS.NewDocument.content", { typeName }),
    modal: true,
    ok: {
      default: true,
      icon: makeIconClass(TERIOCK.display.icons.ui.import, "button"),
      label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.import"),
      callback: () => "import",
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.add, "title"),
      title: _loc("TERIOCK.DIALOGS.NewDocument.title", { name: label }),
    },
  });
  if (!decision) { return null; }
  if (decision === "import") {
    const picked = await TERIOCK.config.document[type]?.importDialog();
    if (!picked) { return null; }
    if (TERIOCK.config.document[type]?.documentName === "Item") { return game.items.fromCompendium(picked); }
    return foundry.utils.mergeObject(picked.toObject(), { _stats: { compendiumSource: picked.uuid } });
  }
  return obj;
}
