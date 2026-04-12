import { getImage } from "../../../../../helpers/path.mjs";
import { toKebabCase } from "../../../../../helpers/string.mjs";
import { newDocumentDialog } from "../../../../dialogs/_module.mjs";
import {
  selectAbilityDialog,
  selectBodyPartDialog,
  selectClassDialog,
  selectEquipmentTypeDialog,
  selectPropertyDialog,
  selectSpeciesDialog,
  selectTradecraftDialog,
} from "../../../../dialogs/select-dialog.mjs";
import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {CommonDocument} document
     */
    class DocumentCreationCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          createAbility: this._onCreateAbility,
          createAttunement: this._onCreateAttunement,
          createBody: this._onCreateBody,
          createConsequence: this._onCreateConsequence,
          createEquipment: this._onCreateEquipment,
          createFluency: this._onCreateFluency,
          createMount: this._onCreateMount,
          createPower: this._onCreatePower,
          createProperty: this._onCreateProperty,
          createRank: this._onCreateRank,
          createResource: this._onCreateResource,
          createSpecies: this._onCreateSpecies,
        },
      };

      /**
       * Adds a new {@link TeriockAbility} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateAbility() {
        const decision = await newDocumentDialog("ability");
        let obj = newDocumentObj("ability");
        if (decision === "import") {
          const out = await selectAbilityDialog();
          if (!out) return;
          obj = out.toObject();
          obj["_stats.compendiumSource"] = out.uuid;
        }
        if (decision && obj) {
          await this.document.createChildDocuments("ActiveEffect", [obj]);
        }
      }

      /**
       * Adds a new {@link TeriockAttunement} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateAttunement() {
        await this.document.createChildDocuments("ActiveEffect", [
          newDocumentObj("attunement"),
        ]);
      }

      /**
       * Adds a new {@link TeriockBody} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateBody() {
        const decision = await newDocumentDialog("body");
        let obj = newDocumentObj("body");
        if (decision === "import") {
          obj = game.items.fromCompendium(await selectBodyPartDialog());
        }
        if (decision && obj) {
          await this.document.createChildDocuments("Item", [obj]);
        }
      }

      /**
       * Adds a new {@link TeriockConsequence} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateConsequence() {
        await this.document.createChildDocuments("ActiveEffect", [
          newDocumentObj("consequence"),
        ]);
      }

      /**
       * Adds a new {@link TeriockEquipment} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateEquipment() {
        const decision = await newDocumentDialog("equipment");
        let obj = newDocumentObj("equipment");
        if (decision === "import") {
          obj = game.items.fromCompendium(await selectEquipmentTypeDialog());
        }
        if (decision && obj) {
          await this.document.createChildDocuments("Item", [obj]);
        }
      }

      /**
       * Adds a new {@link TeriockFluency} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateFluency() {
        const tc = await selectTradecraftDialog();
        if (tc) {
          const f = Object.entries(TERIOCK.options.tradecraft).find(([_k, v]) =>
            Object.keys(v.tradecrafts).includes(tc),
          )[0];
          await this.document.createChildDocuments("ActiveEffect", [
            {
              name: _loc("TERIOCK.SHEETS.Common.MENU.Create.fluency", {
                tradecraft: TERIOCK.reference.tradecrafts[tc],
              }),
              type: "fluency",
              img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
              system: { tradecraft: tc, field: f },
            },
          ]);
        }
      }

      /**
       * Adds a new {@link TeriockMount} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateMount() {
        await this.document.createChildDocuments("Item", [
          newDocumentObj("mount"),
        ]);
      }

      /**
       * Adds a new {@link TeriockPower} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreatePower() {
        await this.document.createChildDocuments("Item", [
          newDocumentObj("power"),
        ]);
      }

      /**
       * Adds a new {@link TeriockProperty} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateProperty() {
        const decision = await newDocumentDialog("property");
        let obj = newDocumentObj("property");
        if (decision === "import") {
          const out = await selectPropertyDialog();
          if (!out) return;
          obj = out.toObject();
          obj["_stats.compendiumSource"] = out.uuid;
        }
        if (decision && obj) {
          await this.document.createChildDocuments("ActiveEffect", [obj]);
        }
      }

      /**
       * Adds a new {@link TeriockRank} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateRank() {
        let rankClass = await selectClassDialog();
        const innate = this.document.documentName !== "Actor";
        if (!rankClass) return;
        const classIdentifier = toKebabCase(rankClass);
        const possibleRanks = await Promise.all([
          teriock.fromIdentifier(`rank:rank-1-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-2-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-3-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-4-${classIdentifier}`),
          teriock.fromIdentifier(`rank:rank-5-${classIdentifier}`),
        ]);
        const referenceRank =
          /**@type {TeriockRank} */ await selectDocumentDialog(possibleRanks, {
            title: _loc("TERIOCK.SHEETS.Common.MENU.CreateRank.title"),
            openable: true,
          });
        const rankNumber = referenceRank.system.classRank;
        let rank = referenceRank.clone();
        if (rankNumber <= 2) {
          const toCreate = rank.toObject();
          toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, {
            innate: innate,
          });
          await this.document.createChildDocuments("Item", [toCreate]);
          return;
        }
        /** @type {TeriockRank[]} */
        const existingRanks = (await this.document.getRanks()).filter(
          (r) => r.system.className === rankClass,
        );
        const combatAbilityNames = new Set(
          referenceRank.abilities
            .filter((a) => a.getFlag("teriock", "category") === "combat")
            .map((a) => a.name),
        );
        const availableCombatAbilityNames = new Set(combatAbilityNames);
        const supportAbilityNames = new Set(
          referenceRank.abilities
            .filter((a) => a.getFlag("teriock", "category") === "support")
            .map((a) => a.name),
        );
        const availableSupportAbilityNames = new Set(supportAbilityNames);
        for (const existingRank of existingRanks) {
          for (const ability of existingRank.abilities) {
            const existingAbility = rank.abilities.find(
              (a) => a.name === ability.name,
            );
            if (existingAbility) {
              availableCombatAbilityNames.delete(existingAbility.name);
              availableSupportAbilityNames.delete(existingAbility.name);
            }
          }
        }
        const chosenAbilityNames = [];
        if (availableCombatAbilityNames.size > 1) {
          const availableCombatAbilities = referenceRank.abilities.filter((a) =>
            availableCombatAbilityNames.has(a.name),
          );
          const chosenCombatAbility = await selectDocumentDialog(
            availableCombatAbilities,
            {
              title: _loc("TERIOCK.SHEETS.Common.MENU.CreateRank.selectCombat"),
              openable: true,
            },
          );
          const chosenCombatAbilityName = chosenCombatAbility.name;
          chosenAbilityNames.push(chosenCombatAbilityName);
        } else {
          chosenAbilityNames.push(...availableCombatAbilityNames);
        }
        if (availableSupportAbilityNames.size > 1) {
          const availableSupportAbilities = referenceRank.abilities.filter(
            (a) => availableSupportAbilityNames.has(a.name),
          );
          const chosenSupportAbility = await selectDocumentDialog(
            availableSupportAbilities,
            {
              title: _loc(
                "TERIOCK.SHEETS.Common.MENU.CreateRank.selectSupport",
              ),
              openable: true,
            },
          );
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
          chosenAbility.allSubs.map((a) => allowedAbilityIds.add(a.id));
        }
        for (const ability of abilities) {
          if (!allowedAbilityIds.has(ability.id)) {
            abilities.delete(ability.id);
          }
        }
        const toCreate = game.items.fromCompendium(rank);
        toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, {
          innate: innate,
        });
        await this.document.createChildDocuments("Item", [toCreate]);
      }

      /**
       * Adds a new {@link TeriockResource} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateResource() {
        await this.document.createChildDocuments("ActiveEffect", [
          newDocumentObj("resource"),
        ]);
      }

      /**
       * Adds a new {@link TeriockSpecies} to the current document.
       * @returns {Promise<void>}
       */
      static async _onCreateSpecies() {
        const decision = await newDocumentDialog("species");
        let obj = newDocumentObj("species");
        if (decision === "import") {
          obj = game.items.fromCompendium(await selectSpeciesDialog());
        }
        if (decision && obj) {
          await this.document.createChildDocuments("Item", [obj]);
        }
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.querySelectorAll(".teriock-block[data-uuid]").forEach(
          /** @param {HTMLElement} el */ (el) => {
            const uuid = el.dataset.uuid;
            fromUuid(uuid).then((doc) => doc?.onEmbed(el));
          },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        let children = await this.document.getVisibleChildren();
        children = children.filter((c) => {
          if (foundry.utils.hasProperty(c, "system.revealed")) {
            return (
              foundry.utils.getProperty(c, "system.revealed") || game.user.isGM
            );
          } else {
            return true;
          }
        });
        for (const [type, options] of Object.entries(
          TERIOCK.options.document,
        )) {
          if (options.getter) {
            context[options["getter"]] = TERIOCK.options.document[type].sorter(
              children.filter((c) => c.type === type),
            );
          }
        }
        return context;
      }
    }
  );
};

function newDocumentObj(type) {
  return {
    name: _loc("TERIOCK.SHEETS.Common.MENU.Create.document", {
      type: _loc(`TYPES.${TERIOCK.options.document[type].doc}.${type}`),
    }),
    type,
  };
}
