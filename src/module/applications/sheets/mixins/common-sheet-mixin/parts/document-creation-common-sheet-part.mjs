import * as createEffects from "../../../../../helpers/create-effects.mjs";
import { copyRank, getRank } from "../../../../../helpers/fetch.mjs";
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
  //noinspection JSClosureCompilerSyntax
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
          createBaseEffect: this._createBaseEffect,
          createBody: this._createBody,
          createEmbedded: this._createEmbedded,
          createEquipment: this._createEquipment,
          createFluency: this._createFluency,
          createProperty: this._createProperty,
          createRank: this._createRank,
          createResource: this._createResource,
        },
      };

      /**
       * Creates a new ability for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created ability.
       */
      static async _createAbility(_event, _target) {
        const out = await selectAbilityDialog();
        const o = out.toObject();
        console.log(o);
        await this.document.createChildDocuments("ActiveEffect", [o]);
      }

      /**
       * Creates a new base effect for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createBaseEffect(_event, _target) {
        await createEffects.createBaseEffect(this.document);
      }

      /**
       * Adds a {@link TeriockBody} to the {@link TeriockDocument}.
       * @returns {Promise<void>}
       * @private
       */
      static async _createBody() {
        await this.document.createChildDocuments("Item", [
          (await selectBodyPartDialog())?.toObject(),
        ]);
      }

      /**
       * Adds new embedded {@link TeriockChild} to the current {@link TeriockDocument}.
       * Creates documents based on the specified tab type.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when the document is created.
       * @static
       */
      static async _createEmbedded(_event, target) {
        const tab = target.dataset.tab;
        const tabMap = {
          ability: {
            data: {
              name: "New Ability",
              type: "ability",
            },
            docType: "ActiveEffect",
          },
          consequence: {
            data: {
              name: "New Consequence",
              type: "consequence",
            },
            docType: "ActiveEffect",
          },
          equipment: {
            data: {
              name: "New Equipment",
              type: "equipment",
            },
            docType: "Item",
          },
          fluency: {
            data: {
              name: "New Fluency",
              type: "fluency",
            },
            docType: "ActiveEffect",
          },
          power: {
            data: {
              name: "New Power",
              type: "power",
            },
            docType: "Item",
          },
          rank: {
            data: {
              name: "New Rank",
              type: "rank",
            },
            docType: "Item",
          },
          resource: {
            data: {
              name: "New Resource",
              type: "resource",
            },
            docType: "ActiveEffect",
          },
        };
        const entry = tabMap[tab];
        if (!entry) {
          return;
        }
        const docs =
          /** @type {(Document|ClientDocument)[]} */ await this.document.createChildDocuments(
            entry.docType,
            [entry.data],
          );
        await docs[0].sheet?.render(true);
      }

      /**
       * Adds a {@link TeriockEquipment} to the {@link TeriockDocument}.
       * @returns {Promise<void>}
       * @private
       */
      static async _createEquipment(_event, _target) {
        await this.document.createChildDocuments("Item", [
          (await selectEquipmentTypeDialog())?.toObject(),
        ]);
      }

      /**
       * Creates new fluency for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createFluency(_event, _target) {
        const tradecraft = await selectTradecraftDialog();
        if (tradecraft) {
          await createEffects.createFluency(this.document, tradecraft);
        }
      }

      /**
       * Creates a new property for the current document.
       * Shows a dialog to select a property type or create a new one.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created property.
       */
      static async _createProperty(_event, _target) {
        await this.document.createChildDocuments("ActiveEffect", [
          (await selectPropertyDialog())?.toObject(),
        ]);
      }

      /**
       * Adds a {@link TeriockRank} to the {@link TeriockDocument}.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} _target - The event target.
       * @returns {Promise<void>} Promise that resolves when the {@link TeriockRank} is added.
       * @private
       */
      static async _createRank(_event, _target) {
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
        const existingRanks = this.document
          .getRanks()
          .filter((r) => r.system.className === rankClass);
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
        const toCreate = rank.toObject();
        toCreate.system = foundry.utils.mergeObject(toCreate.system || {}, {
          innate: innate,
        });
        await this.document.createChildDocuments("Item", [toCreate]);
      }

      /**
       * Creates a new resource for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created resource.
       */
      static async _createResource(_event, _target) {
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
