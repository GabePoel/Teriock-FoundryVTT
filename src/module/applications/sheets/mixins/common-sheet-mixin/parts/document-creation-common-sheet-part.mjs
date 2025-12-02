import { copyRank, getRank } from "../../../../../helpers/fetch.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import {
  selectAbilityDialog,
  selectBodyPartDialog,
  selectClassDialog,
  selectEquipmentTypeDialog,
  selectPropertyDialog,
  selectTradecraftDialog,
} from "../../../../dialogs/select-dialog.mjs";
import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax,JSValidateJSDoc
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class DocumentCreationCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          createAbility: this._createAbility,
          createBody: this._createBody,
          createEquipment: this._createEquipment,
          createFluency: this._createFluency,
          createProperty: this._createProperty,
          createRank: this._createRank,
          createResource: this._createResource,
          createPower: this._createPower,
          createConsequence: this._createConsequence,
        },
      };

      /**
       * Adds a new {@link TeriockAbility} to the current document.
       * @returns {Promise<void>}
       */
      static async _createAbility() {
        const out = await selectAbilityDialog();
        const obj = out.toObject();
        if (out.sup?.type === "wrapper") {
          obj["_stats.compendiumSource"] = out.sup.uuid;
        }
        await this.document.createChildDocuments("ActiveEffect", [obj]);
      }

      /**
       * Adds a new {@link TeriockBody} to the current document.
       * @returns {Promise<void>}
       */
      static async _createBody() {
        await this.document.createChildDocuments("Item", [
          game.items.fromCompendium(await selectBodyPartDialog()),
        ]);
      }

      /**
       * Adds a new {@link TeriockConsequence} to the current document.
       * @returns {Promise<void>}
       */
      static async _createConsequence() {
        await this.document.createChildDocuments("ActiveEffect", [
          {
            name: "New Consequence",
            type: "consequence",
          },
        ]);
      }

      /**
       * Adds a new {@link TeriockEquipment} to the current document.
       * @returns {Promise<void>}
       */
      static async _createEquipment() {
        await this.document.createChildDocuments("Item", [
          game.items.fromCompendium(await selectEquipmentTypeDialog()),
        ]);
      }

      /**
       * Adds a new {@link TeriockFluency} to the current document.
       * @returns {Promise<void>}
       */
      static async _createFluency() {
        const tc = await selectTradecraftDialog();
        if (tc) {
          const f = Object.entries(TERIOCK.options.tradecraft).find(([_k, v]) =>
            Object.keys(v.tradecrafts).includes(tc),
          )[0];
          await this.document.createChildDocuments("ActiveEffect", [
            {
              name: `New ${TERIOCK.index.tradecrafts[tc]} Fluency`,
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
      static async _createPower() {
        await this.document.createChildDocuments("Item", [
          {
            name: "New Power",
            type: "power",
          },
        ]);
      }

      /**
       * Adds a new {@link TeriockProperty} to the current document.
       * @returns {Promise<void>}
       */
      static async _createProperty() {
        const out = await selectPropertyDialog();
        const obj = out.toObject();
        if (out.sup?.type === "wrapper") {
          obj["_stats.compendiumSource"] = out.sup.uuid;
        }
        await this.document.createChildDocuments("ActiveEffect", [obj]);
      }

      /**
       * Adds a new {@link TeriockRank} to the current document.
       * @returns {Promise<void>}
       */
      static async _createRank() {
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
            title: "Select Rank",
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
              title: "Select Combat Ability",
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
              title: "Select Support Ability",
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
      static async _createResource() {
        await this.document.createChildDocuments("ActiveEffect", [
          {
            name: "New Resource",
            type: "resource",
          },
        ]);
      }
    }
  );
};
