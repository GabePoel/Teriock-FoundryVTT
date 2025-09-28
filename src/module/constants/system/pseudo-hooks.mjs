export const abilityPseudoHooks = {
  documentChat: "Document Sharing to Chat",
  documentDuplicate: "Document Duplication",
  effectApplication: "Effect Application",
  effectExpiration: "Effect Expiration",
  execution: "Ability Execution",
  movement: "Movement",
  postUpdate: "Actor Post-updating",
  preExecution: "Ability Pre-execution",
  deathBagPull: "Pull From Death Bag",
  rollFeatSave: "Rolling a Feat Save",
  rollImmunity: "Rolling an Immunity Save",
  rollResistance: "Rolling a Resistance Save",
  rollTradecraft: "Rolling a Tradecraft Check",
  takeAwaken: "Taking Awaken",
  takeDamage: "Taking Damage",
  takeDrain: "Taking Drain",
  takeGainTempHp: "Gaining Temp HP",
  takeGainTempMp: "Gaining Temp MP",
  takeHack: "Taking Hack",
  takeHeal: "Taking Healing",
  takeKill: "Taking Auto-kill Effect",
  takeNormalHeal: "Taking Normal Healing",
  takeNormalRevitalize: "Taking Normal Revitalization",
  takePay: "Making Payment",
  takeRevitalize: "Taking Revitalization",
  takeRevive: "Taking Revival",
  takeSetTempHp: "Setting Temp HP",
  takeSetTempMp: "Setting Temp MP",
  takeSleep: "Taking Auto-sleep Effect",
  takeUnhack: "Taking Unhack",
  takeWither: "Taking Wither",
  turnEnd: "Actor Turn Ending",
  turnStart: "Actor Turn Starting",
  useAbility: "Using an Ability",
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

export const unsortedPseudoHooks = foundry.utils.mergeObject(
  abilityPseudoHooks,
  propertyPseudoHooks,
);

export const pseudoHooks = Object.fromEntries(
  Object.entries(unsortedPseudoHooks).sort(([, a], [, b]) =>
    a.localeCompare(b),
  ),
);
