import { copyRank, getItem, getRank } from "../../../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../../../helpers/utils.mjs";
import { selectClassDialog, selectEquipmentTypeDialog } from "../../../../dialogs/select-dialog.mjs";
import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

/**
 * Adds a new embedded document to {@link TeriockActor}.
 * Creates a document based on the specified tab type.
 *
 * @param {TeriockBaseActorSheet} sheet
 * @param {HTMLElement} target
 * @returns {Promise<void>}
 * @private
 */
export async function _addEmbedded(sheet, target) {
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
  if (!entry) return;
  /** @type {(Document|ClientDocument)[]} */
  const docs = await sheet.actor.createEmbeddedDocuments(entry.docType, [
    entry.data,
  ]);
  await docs[0].sheet?.render(true);
}

/**
 * Adds a {@link TeriockRank} to {@link TeriockActor}.
 *
 * @param {TeriockBaseActorSheet} sheet
 * @returns {Promise<void>}
 * @private
 */
export async function _addRank(sheet) {
  const rankClass = await selectClassDialog();
  if (!rankClass) return;
  const possibleRanks = await Promise.all([
    getRank(rankClass, 1),
    getRank(rankClass, 2),
    getRank(rankClass, 3),
    getRank(rankClass, 4),
    getRank(rankClass, 5),
  ]);
  const referenceRank = await selectDocumentDialog(possibleRanks, {
    title: "Select Rank",
  });
  const rankNumber = referenceRank.system.classRank;
  let rank = await copyRank(rankClass, rankNumber);
  if (rankNumber <= 2) {
    await sheet.document.createEmbeddedDocuments("Item", [rank]);
    return;
  }
  const existingRanks = sheet.document.ranks.filter(
    (r) => r.system.className === rankClass,
  );
  const combatAbilityNames = new Set(
    referenceRank.abilities
      .filter((a) => !a.sup)
      .map((a) => a.name)
      .slice(0, 3),
  );
  const availableCombatAbilityNames = new Set(combatAbilityNames);
  const supportAbilityNames = new Set(
    referenceRank.abilities
      .filter((a) => !a.sup)
      .map((a) => a.name)
      .slice(3),
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
      { title: "Select Combat Ability" },
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
      { title: "Select Support Ability" },
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
    if (!allowedAbilityIds.has(ability.id)) abilities.delete(ability.id);
  }
  await sheet.document.createEmbeddedDocuments("Item", [rank]);
}

/**
 * Adds a {@link TeriockEquipment} to {@link TeriockActor}.
 *
 * @param {TeriockBaseActorSheet} sheet
 * @returns {Promise<void>}
 * @private
 */
export async function _addEquipment(sheet) {
  let equipmentType = await selectEquipmentTypeDialog();
  if (Object.keys(CONFIG.TERIOCK.equipmentType).includes(equipmentType)) {
    const equipment = await getItem(
      CONFIG.TERIOCK.equipmentType[equipmentType],
      "equipment",
    );
    await sheet.document.createEmbeddedDocuments("Item", [equipment]);
  } else {
    equipmentType = toTitleCase(equipmentType);
    await sheet.document.createEmbeddedDocuments("Item", [
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
