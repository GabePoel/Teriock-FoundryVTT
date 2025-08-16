import { copyRank, getItem, getRank } from "../../../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../../../helpers/utils.mjs";
import { selectClassDialog, selectDialog, selectEquipmentTypeDialog } from "../../../../dialogs/select-dialog.mjs";

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
        img: "systems/teriock/assets/ability.svg",
        name: "New Ability",
        type: "ability",
      },
      docType: "ActiveEffect",
    },
    consequence: {
      data: {
        img: "systems/teriock/assets/effect.svg",
        name: "New Consequence",
        type: "consequence",
      },
      docType: "ActiveEffect",
    },
    equipment: {
      data: {
        img: "systems/teriock/assets/equipment.svg",
        name: "New Equipment",
        type: "equipment",
      },
      docType: "Item",
    },
    fluency: {
      data: {
        img: "systems/teriock/assets/fluency.svg",
        name: "New Fluency",
        type: "fluency",
      },
      docType: "ActiveEffect",
    },
    power: {
      data: {
        img: "systems/teriock/assets/power.svg",
        name: "New Power",
        type: "power",
      },
      docType: "Item",
    },
    rank: {
      data: {
        img: "systems/teriock/assets/rank.svg",
        name: "New Rank",
        type: "rank",
      },
      docType: "Item",
    },
    resource: {
      data: {
        img: "systems/teriock/assets/resource.svg",
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
  const rankNumber = Number(
    await selectDialog(
      { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" },
      {
        label: "Rank",
        hint: `What rank ${CONFIG.TERIOCK.rankOptionsList[rankClass]} is this?`,
        title: "Select Rank",
      },
    ),
  );
  if (!rankClass) return;
  const referenceRank = await getRank(rankClass, rankNumber);
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
    const combatAbilityChoices = {};
    availableCombatAbilityNames.map((n) => (combatAbilityChoices[n] = n));
    const chosenCombatAbilityName = await selectDialog(combatAbilityChoices, {
      label: "Ability",
      hint: "Select a combat ability.",
      title: "Select Combat Ability",
    });
    chosenAbilityNames.push(chosenCombatAbilityName);
  } else {
    chosenAbilityNames.push(...availableCombatAbilityNames);
  }
  if (availableSupportAbilityNames.size > 1) {
    const supportAbilityChoices = {};
    availableSupportAbilityNames.map((n) => (supportAbilityChoices[n] = n));
    const supportAbilityName = await selectDialog(supportAbilityChoices, {
      label: "Support Ability",
      hint: "Select a support ability.",
      title: "Select Combat Ability",
    });
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
