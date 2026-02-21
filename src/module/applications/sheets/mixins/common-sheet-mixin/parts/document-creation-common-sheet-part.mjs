import { copyRank, getRank } from "../../../../../helpers/fetch.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { newDocumentDialog } from "../../../../dialogs/_module.mjs";
import {
  selectAbilityDialog,
  selectBodyPartDialog,
  selectClassDialog,
  selectEquipmentTypeDialog,
  selectPropertyDialog,
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
     * @property {TeriockCommon} document
     */
    class DocumentCreationCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          createAbility: this._onCreateAbility,
          createBody: this._onCreateBody,
          createEquipment: this._onCreateEquipment,
          createFluency: this._onCreateFluency,
          createProperty: this._onCreateProperty,
          createRank: this._onCreateRank,
          createResource: this._onCreateResource,
          createPower: this._onCreatePower,
          createConsequence: this._onCreateConsequence,
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
          if (out.sup?.type === "wrapper") {
            obj["_stats.compendiumSource"] = out.sup.uuid;
          }
        }
        if (decision && obj) {
          await this.document.createChildDocuments("ActiveEffect", [obj]);
        }
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
              name: game.i18n.format(
                "TERIOCK.SHEETS.Common.MENU.Create.fluency",
                { tradecraft: TERIOCK.reference.tradecrafts[tc] },
              ),
              type: "fluency",
              img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
              system: {
                tradecraft: tc,
                field: f,
              },
            },
          ]);
        }
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
          if (out.sup?.type === "wrapper") {
            obj["_stats.compendiumSource"] = out.sup.uuid;
          }
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
        const rankClass = await selectClassDialog();
        const innate = this.document.documentName !== "Actor";
        if (!rankClass) {
          return;
        }
        const possibleRanks = await Promise.all([
          getRank(rankClass, 1),
          getRank(rankClass, 2),
          getRank(rankClass, 3),
          getRank(rankClass, 4),
          getRank(rankClass, 5),
        ]);
        const referenceRank =
          /**@type {TeriockRank} */ await selectDocumentDialog(possibleRanks, {
            title: game.i18n.localize(
              "TERIOCK.SHEETS.Common.MENU.CreateRank.title",
            ),
            openable: true,
          });
        const rankNumber = referenceRank.system.classRank;
        let rank = await copyRank(rankClass, rankNumber);
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
              title: game.i18n.localize(
                "TERIOCK.SHEETS.Common.MENU.CreateRank.selectCombat",
              ),
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
              title: game.i18n.localize(
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
    }
  );
};

function newDocumentObj(type) {
  return {
    name: game.i18n.format("TERIOCK.SHEETS.Common.MENU.Create.document", {
      type: game.i18n.localize(
        `TYPES.${TERIOCK.options.document[type].doc}.${type}`,
      ),
    }),
    type,
  };
}
