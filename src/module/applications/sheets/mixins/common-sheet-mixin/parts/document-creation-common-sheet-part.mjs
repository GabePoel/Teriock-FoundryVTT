import * as createEffects from "../../../../../helpers/create-effects.mjs";
import { copyRank, getItem, getRank } from "../../../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../../../helpers/string.mjs";
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
      static DEFAULT_OPTIONS = {
        actions: {
          createAbility: this._createAbility,
          createBaseEffect: this._createBaseEffect,
          createBodyPart: this._createBodyPart,
          createEmbedded: this._createEmbedded,
          createEquipment: this._createEquipment,
          createFluency: this._createFluency,
          createProperty: this._createProperty,
          createRank: this._createRank,
          createResource: this._createResource,
        },
      };

      /**
       * Adds a new embedded {@link TeriockChild} to the current {@link TeriockDocument}.
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
          /** @type {(Document|ClientDocument)[]} */ await this.document.actor.createEmbeddedDocuments(
            entry.docType,
            [entry.data],
          );
        if (entry.docType === this.document.documentName) {
          await this.document.addSubs(docs);
        }
        await docs[0].sheet?.render(true);
      }

      /**
       * Adds a {@link TeriockEquipment} to the {@link TeriockDocument}.
       * @returns {Promise<void>}
       * @private
       */
      static async _createEquipment(_event, _target) {
        let equipmentType = await selectEquipmentTypeDialog();
        let created;
        if (Object.keys(TERIOCK.index.equipment).includes(equipmentType)) {
          const equipment = await getItem(
            TERIOCK.index.equipment[equipmentType],
            "equipment",
          );
          created = await this.document.actor.createEmbeddedDocuments("Item", [
            equipment,
          ]);
        } else {
          equipmentType = toTitleCase(equipmentType);
          created = await this.document.actor.createEmbeddedDocuments("Item", [
            {
              name: equipmentType,
              system: {
                equipmentType: equipmentType,
              },
              type: "equipment",
            },
          ]);
        }
        if (this.document.documentName !== "Actor") {
          await this.document.addSubs(created);
        }
      }

      /**
       * Adds a {@link TeriockBody} to the {@link TeriockDocument}.
       * @returns {Promise<void>}
       * @private
       */
      static async _createBodyPart() {
        let bodyPartKey = await selectBodyPartDialog();
        let created;
        if (Object.keys(TERIOCK.index.bodyParts).includes(bodyPartKey)) {
          const bodyPart = await getItem(
            TERIOCK.index.bodyParts[bodyPartKey],
            "bodyParts",
          );
          created = await this.document.actor.createEmbeddedDocuments("Item", [
            bodyPart,
          ]);
        } else {
          created = await this.document.actor.createEmbeddedDocuments("Item", [
            {
              name: toTitleCase(bodyPartKey),
              type: "body",
            },
          ]);
        }
        if (this.document.documentName !== "Actor") {
          await this.document.addSubs(created);
        }
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
        const referenceRank = await selectDocumentDialog(possibleRanks, {
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
          const created = await this.document.actor.createEmbeddedDocuments(
            "Item",
            [toCreate],
          );
          if (this.document.documentName !== "Actor") {
            await this.document.addSubs(created);
          }
          return;
        }
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
        const created = await this.document.actor.createEmbeddedDocuments(
          "Item",
          [toCreate],
        );
        if (this.document.documentName !== "Actor") {
          await this.document.addSubs(created);
        }
      }

      /**
       * Creates a new ability for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created ability.
       */
      static async _createAbility(_event, _target) {
        const abilityKey = await selectAbilityDialog();
        let abilityName = "New Ability";
        if (abilityKey) {
          if (abilityKey !== "other") {
            abilityName = TERIOCK.index.abilities[abilityKey];
            await tm.fetch.importAbility(this.document, abilityName);
          } else {
            await createEffects.createAbility(this.document, abilityName);
          }
        }
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
        const propertyKey = await selectPropertyDialog();
        let propertyName = "New Property";
        if (propertyKey) {
          if (propertyKey !== "other") {
            propertyName = TERIOCK.index.properties[propertyKey];
            await tm.fetch.importProperty(this.document, propertyName);
          } else {
            await createEffects.createProperty(this.document, propertyName);
          }
        }
      }

      /**
       * Creates a new resource for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created resource.
       */
      static async _createResource(_event, _target) {
        await createEffects.createResource(this.document);
      }
    }
  );
};
