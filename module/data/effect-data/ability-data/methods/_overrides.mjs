/** @import { AppliesData } from "./schema/_types"; */

import { tradecraftOptions } from "../../../../helpers/constants/tradecraft-options.mjs";
import { mergeLevel } from "../../../../helpers/utils.mjs";

const abilityMap = {
  Unbreachability: {
    base: {
      changes: [{ key: "system.wornAc", mode: 4, value: 1, priority: 20 }],
    },
  },
  "Dragon Scales": {
    base: {
      changes: [{ key: "system.naturalAv", mode: 4, value: 2, priority: 20 }],
    },
  },
  Agile: {
    base: {
      changes: [{ key: "system.speedAdjustments.difficultTerrain", mode: 4, value: 3, priority: 20 }],
    },
  },
  Digging: {
    base: {
      changes: [{ key: "system.speedAdjustments.dig", mode: 4, value: 1, priority: 20 }],
    },
  },
  Gliding: {
    base: {
      changes: [{ key: "system.speedAdjustments.fly", mode: 4, value: 1, priority: 20 }],
    },
  },
  Leaping: {
    base: {
      changes: [
        { key: "system.speedAdjustments.leapHorizontal", mode: 4, value: 2, priority: 20 },
        { key: "system.speedAdjustments.leapVertical", mode: 4, value: 1, priority: 20 },
      ],
    },
  },
  "Shadowcreep Acrobatics": {
    base: {
      changes: [
        { key: "system.speedAdjustments.difficultTerrain", mode: 2, value: 1, priority: 25 },
        { key: "system.speedAdjustments.crawl", mode: 2, value: 1, priority: 25 },
        { key: "system.speedAdjustments.climb", mode: 2, value: 1, priority: 25 },
        { key: "system.speedAdjustments.hidden", mode: 2, value: 1, priority: 25 },
        { key: "system.speedAdjustments.leapHorizontal", mode: 2, value: 1, priority: 25 },
        { key: "system.speedAdjustments.leapVertical", mode: 2, value: 1, priority: 25 },
      ],
    },
  },
  "Natural Hide": {
    base: {
      changes: [{ key: "system.naturalAv", mode: 4, value: 1, priority: 20 }],
    },
  },
  "Natural Scales": {
    base: {
      changes: [{ key: "system.naturalAv", mode: 4, value: 2, priority: 20 }],
    },
  },
  "Natural Half Plate": {
    base: {
      changes: [{ key: "system.naturalAv", mode: 4, value: 3, priority: 20 }],
    },
  },
  "Natural Full Plate": {
    base: {
      changes: [{ key: "system.naturalAv", mode: 4, value: 4, priority: 20 }],
    },
  },
  "Cannot Swim": {
    base: {
      changes: [{ key: "system.speedAdjustments.swim", mode: 6, value: 0, priority: 30 }],
    },
  },
  "Vicious Claws": {
    base: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 8, priority: 25 }],
    },
  },
  "Vicious Bite": {
    base: {
      changes: [{ key: "system.damage.mouth", mode: 4, value: 8, priority: 25 }],
    },
  },
  "Shield Bash": {
    base: {
      changes: [
        { key: "system.damage.bucklerShield", mode: 4, value: 4, priority: 20 },
        { key: "system.damage.largeShield", mode: 4, value: 6, priority: 20 },
        { key: "system.damage.towerShield", mode: 4, value: 8, priority: 20 },
      ],
    },
  },
  "Might Strike": {
    base: {
      changes: [{ key: "system.damage.standard", mode: 2, value: " + 1d4[Holy]", priority: 20 }],
    },
  },
  "Control and Resist Fire": {
    base: {
      changes: [
        { key: "system.damage.standard", mode: 2, value: " + 1d4[Fire]", priority: 20 },
        { key: "system.resistances.damageTypes", mode: 2, value: "fire", priority: 20 },
      ],
    },
  },
  Climbing: {
    base: {
      changes: [{ key: "system.speedAdjustments.climb", mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: "system.speedAdjustments.climb", mode: 4, value: 3, priority: 20 }],
    },
  },
  Flying: {
    base: {
      changes: [{ key: "system.speedAdjustments.fly", mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: "system.speedAdjustments.fly", mode: 4, value: 3, priority: 20 }],
    },
  },
  "Offensive Martial Arts": {
    base: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 4, priority: 20 }],
    },
    proficient: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 6, priority: 20 }],
    },
    fluent: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 8, priority: 20 }],
    },
  },
  "Hind Claws": {
    base: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 4, priority: 20 }],
    },
    fluent: {
      changes: [{ key: "system.damage.hand", mode: 4, value: 6, priority: 20 }],
    },
  },
  Bite: {
    base: {
      changes: [{ key: "system.damage.mouth", mode: 4, value: 4, priority: 20 }],
    },
    proficient: {
      changes: [{ key: "system.damage.mouth", mode: 4, value: 6, priority: 20 }],
    },
    fluent: {
      changes: [{ key: "system.damage.mouth", mode: 4, value: 8, priority: 20 }],
    },
  },
  "Instant Ethereal": {
    base: {
      statuses: ["ethereal"],
    },
  },
  "Treeform Ball": {
    base: {
      statuses: ["transformed"],
    },
  },
  "Bestial Shift": {
    base: {
      statuses: ["transformed"],
    },
  },
  "Bestial Transformation": {
    base: {
      statuses: ["transformed"],
    },
  },
  Polymorph: {
    base: {
      statuses: ["transformed"],
    },
  },
  "Light Ray": {
    base: {
      statuses: ["lighted"],
    },
  },
  "Light Touch": {
    base: {
      statuses: ["lighted"],
    },
  },
  "Light Aura": {
    base: {
      statuses: ["lighted"],
    },
  },
  "Ice Ball": {
    base: {
      statuses: ["frozen"],
    },
  },
  "Shock Touch": {
    base: {
      statuses: ["frozen"],
    },
  },
  "Blizzard Aura": {
    base: {
      statuses: ["frozen"],
    },
  },
  "Missile Dodging": {
    base: {
      statuses: ["missileDodging"],
    },
  },
  "Melee Dodging": {
    base: {
      statuses: ["meleeDodging"],
    },
  },
  Snare: {
    base: {
      statuses: ["snared"],
    },
  },
  Adrenaline: {
    base: {
      changes: [
        { key: "system.resistances.statuses", mode: 2, value: "unconscious", priority: 20 },
        { key: "system.resistances.other", mode: 2, value: "Dropping From Negative HP", priority: 20 },
      ],
    },
  },
  Alert: {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Being Surprised", priority: 20 }],
    },
  },
  "Battle Cry Resistance": {
    base: {
      changes: [{ key: "system.resistances.statuses", mode: 2, value: "frightened", priority: 20 }],
    },
  },
  "Berserker Tracking": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Being Surprised (Outside Towns)", priority: 20 }],
    },
  },
  "Called Magic Resistance": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Conjured Spells", priority: 20 }],
    },
  },
  "Careful Planning": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Being Surprised (Inside Towns)", priority: 20 }],
    },
  },
  "Combat Shimmering": {
    base: {
      changes: [
        { key: "system.resistances.statuses", mode: 2, value: "snared", priority: 20 },
        { key: "system.resistances.statuses", mode: 2, value: "immobilized", priority: 20 },
        { key: "system.resistances.damageTypes", mode: 2, value: "hack", priority: 20 },
      ],
    },
  },
  "Death Grip": {
    base: {
      changes: [
        { key: "system.resistances.effects", mode: 2, value: "stealing", priority: 20 },
        { key: "system.resistances.abilities", mode: 2, value: "Unglue", priority: 20 },
      ],
    },
  },
  Lie: {
    base: {
      changes: [{ key: "system.resistances.effects", mode: 2, value: "truthDetecting", priority: 20 }],
    },
  },
  "Missile Magic Resistance": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Conjured Missile Spells", priority: 20 }],
    },
  },
  "Missile Weapon Resistance": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Ranged Weapons", priority: 20 }],
    },
  },
  Reflexes: {
    base: {
      changes: [{ key: "system.resistances.abilities", mode: 2, value: "Disarm", priority: 20 }],
    },
  },
  "Resist Effects": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Semblant Skills", priority: 20 }],
    },
  },
  "Resist Mental Effects": {
    base: {
      changes: [{ key: "system.resistances.effects", mode: 2, value: "mental", priority: 20 }],
    },
  },
  Sentry: {
    base: {
      changes: [
        {
          key: "system.resistances.other",
          mode: 2,
          value: "Being Surprised (Braced, Fortified Areas, Guard Duty)",
          priority: 20,
        },
        {
          key: "system.resistances.other",
          mode: 2,
          value: "Frightened (Braced, Fortified Areas, Guard Duty)",
          priority: 20,
        },
        {
          key: "system.resistances.other",
          mode: 2,
          value: "Mediator Tradecrafts (Braced, Fortified Areas, Guard Duty)",
          priority: 20,
        },
      ],
    },
  },
  Stamina: {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Dropping From Negative MP", priority: 20 }],
    },
  },
  "Vitals Protection": {
    base: {
      changes: [{ key: "system.resistances.other", mode: 2, value: "Vitals Targeting Abilities", priority: 20 }],
    },
  },
  "Fall Durability": {
    base: {
      changes: [{ key: "system.immunities.damageTypes", mode: 2, value: "Fall", priority: 20 }],
    },
  },
  Glue: {
    base: {
      changes: [{ key: "system.immunities.other", mode: 2, value: "Stealing (Glued Items)", priority: 20 }],
    },
  },
  "Impure Durability": {
    base: {
      changes: [{ key: "system.immunities.damageTypes", mode: 2, value: "Non-magical Non-silver", priority: 20 }],
    },
  },
  "Magical Durability": {
    base: {
      changes: [{ key: "system.immunities.damageTypes", mode: 2, value: "Non-magical", priority: 20 }],
    },
  },
  "Mental Effect Immunity": {
    base: {
      changes: [{ key: "system.immunities.effects", mode: 2, value: "mental", priority: 20 }],
    },
  },
  "Spell Immunity": {
    base: {
      changes: [{ key: "system.immunities.other", mode: 2, value: "Spells", priority: 20 }],
    },
  },
  "Throw the Bones": {
    base: {
      changes: [{ key: "system.immunities.other", mode: 2, value: "Spells (One Use)", priority: 20 }],
    },
  },
  "Unconsciousness Immunity": {
    base: {
      changes: [{ key: "system.immunities.statuses", mode: 2, value: "unconscious", priority: 20 }],
    },
  },
  "Undead Mind": {
    base: {
      changes: [
        { key: "system.immunities.statuses", mode: 2, value: "frightened", priority: 20 },
        { key: "system.immunities.statuses", mode: 2, value: "charmed", priority: 20 },
      ],
    },
  },
  "Vitals Durability": {
    base: {
      changes: [{ key: "system.immunities.other", mode: 2, value: "Vitals Targeting Abilities", priority: 20 }],
    },
  },
};

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");

for (const [key, value] of Object.entries(tradecrafts)) {
  abilityMap["Talented " + value.name] = {
    base: {
      changes: [{ key: `system.tradecrafts.${key}.bonus`, mode: 4, value: 1, priority: 20 }],
    },
  };
  abilityMap["Expert " + value.name] = {
    base: {
      changes: [{ key: `system.tradecrafts.${key}.bonus`, mode: 4, value: 2, priority: 20 }],
    },
  };
}

/**
 * @param {string} name
 * @returns {Record<string, AppliesData>}
 * @private
 */
export function _override(name) {
  return abilityMap[name];
}
