export const unsortedPseudoHooks = {
  execution: "Ability Execution",
  preExecution: "Ability Pre-execution",
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
  takeTainTempMp: "Gaining Temp MP",
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
};

export const pseudoHooks = Object.fromEntries(
  Object.entries(unsortedPseudoHooks).sort(([, a], [, b]) =>
    a.localeCompare(b),
  ),
);
