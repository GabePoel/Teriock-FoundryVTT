export const abilityPseudoHooks = {
  execution: "Ability Execution",
  preExecution: "Ability Pre-execution",
  turnStart: "Actor Turn Starting",
  turnEnd: "Actor Turn Ending",
  effectApplication: "Effect Application",
  effectExpiration: "Effect Expiration",
  movement: "Movement",
  takeDamage: "Taking Damage",
  takeDrain: "Taking Drain",
  takeWither: "Taking Wither",
  takeHeal: "Taking Healing",
  takeRevitalize: "Taking Revitalization",
  takeSetTempHp: "Setting Temp HP",
  takeSetTempMp: "Setting Temp MP",
  takeGainTempHp: "Gaining Temp HP",
  takeGainTempMp: "Gaining Temp MP",
  takeSleep: "Taking Auto-sleep Effect",
  takeKill: "Taking Auto-kill Effect",
  takePay: "Making Payment",
  takeHack: "Taking Hack",
  takeUnhack: "Taking Unhack",
  takeAwaken: "Taking Awaken",
  takeRevive: "Taking Revival",
  rollFeatSave: "Rolling a Feat Save",
  rollResistance: "Rolling a Resistance Save",
  rollTradecraft: "Rolling a Tradecraft Check",
  useAbility: "Using an Ability",
  postUpdate: "Actor Post-updating",
  rollImmunity: "Rolling an Immunity Save",
  documentChat: "Document Sharing to Chat",
  documentDuplicate: "Document Duplication",
};

export const propertyPseudoHooks = {
  equipmentAttune: "Equipment Attunement",
  equipmentDampen: "Equipment Dampening",
  equipmentDeattune: "Equipment Deattunement",
  equipmentEquip: "Equipment Equipping",
  equipmentGlue: "Equipment Gluing",
  equipmentIdentify: "Equipment Identification",
  equipmentReadMagic: "Equipment Reading Magic",
  equipmentRepair: "Equipment Repairing",
  equipmentShatter: "Equipment Shattering",
  equipmentUndampen: "Equipment Undampening",
  equipmentUnequip: "Equipment Unequipping",
  equipmentUnglue: "Equipment Ungluing",
  equipmentUnidentify: "Equipment Unidentification",
  use: "Using Parent",
};

export const unsortedPseudoHooks = foundry.utils.mergeObject(abilityPseudoHooks, propertyPseudoHooks);

export const pseudoHooks = Object.fromEntries(Object.entries(unsortedPseudoHooks)
  .sort(([ , a ], [ , b ]) => a.localeCompare(b)));

