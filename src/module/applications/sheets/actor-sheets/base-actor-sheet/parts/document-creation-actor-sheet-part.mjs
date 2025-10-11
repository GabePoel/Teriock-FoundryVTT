import { copyRank, getItem, getRank } from "../../../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../../../helpers/string.mjs";
import { changeSizeDialog } from "../../../../dialogs/_module.mjs";
import {
  selectClassDialog,
  selectEquipmentTypeDialog,
} from "../../../../dialogs/select-dialog.mjs";
import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

export default (Base) =>
  class DocumentCreationActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        addEmbedded: this._addEmbedded,
        addEquipment: this._addEquipment,
        addRank: this._addRank,
      },
    };

    /**
     * Adds a new embedded document to the actor.
     * Creates documents based on the specified tab type.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when the document is created.
     * @static
     */
    static async _addEmbedded(_event, target) {
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
        /** @type {(Document|ClientDocument)[]} */ await this.actor.createEmbeddedDocuments(
          entry.docType,
          [entry.data],
        );
      await docs[0].sheet?.render(true);
    }

    /**
     * Adds a {@link TeriockEquipment} to the {@link TeriockActor}.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The event target.
     * @returns {Promise<void>}
     * @private
     */
    static async _addEquipment(_event, _target) {
      let equipmentType = await selectEquipmentTypeDialog();
      if (Object.keys(TERIOCK.index.equipment).includes(equipmentType)) {
        const equipment = await getItem(
          TERIOCK.index.equipment[equipmentType],
          "equipment",
        );
        await this.document.createEmbeddedDocuments("Item", [equipment]);
      } else {
        equipmentType = toTitleCase(equipmentType);
        await this.document.createEmbeddedDocuments("Item", [
          {
            name: equipmentType,
            system: {
              equipmentType: equipmentType,
            },
            type: "equipment",
          },
        ]);
      }
    }

    /**
     * Adds a {@link TeriockRank} to the {@link TeriockActor}.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} _target - The event target.
     * @returns {Promise<void>} Promise that resolves when the {@link TeriockRank} is added.
     * @private
     */
    static async _addRank(_event, _target) {
      const rankClass = await selectClassDialog();
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
        await this.document.createEmbeddedDocuments("Item", [rank]);
        return;
      }
      const existingRanks = this.document.ranks.filter(
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
        const availableSupportAbilities = referenceRank.abilities.filter((a) =>
          availableSupportAbilityNames.has(a.name),
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
      await this.document.createEmbeddedDocuments("Item", [rank]);
    }

    //noinspection JSUnusedGlobalSymbols
    _canDrop(doc) {
      if (doc.type === "ability") {
        return false;
      } else {
        return super._canDrop(doc);
      }
    }

    //noinspection JSUnusedGlobalSymbols
    async _onDropItem(event, data) {
      const item = await super._onDropItem(event, data);
      if (item?.type === "species") {
        await item?.system?.imports.importDeterministic();
        if (item?.system?.size?.enabled) {
          await changeSizeDialog(this.actor, item);
        }
      }
    }
  };
