import { tradecraftOptions } from "../../../helpers/constants/tradecraft-options.mjs";
import { mergeLevel } from "../../../helpers/utils.mjs";

const abilityOverrides = {
  "Unbreachability": {
    base: {
      changes: [{ key: 'system.wornAc', mode: 4, value: 1, priority: 20 }],
    },
  },
  "Dragon Scales": {
    base: {
      changes: [{ key: 'system.naturalAv', mode: 4, value: 2, priority: 20 }],
    },
  },
  "Agile": {
    base: {
      changes: [{ key: 'system.speedAdjustments.difficultTerrain', mode: 4, value: 3, priority: 20 }],
    },
  },
  "Digging": {
    base: {
      changes: [{ key: 'system.speedAdjustments.dig', mode: 4, value: 1, priority: 20 }],
    },
  },
  "Gliding": {
    base: {
      changes: [{ key: 'system.speedAdjustments.fly', mode: 4, value: 1, priority: 20 }],
    },
  },
  "Leap": {
    base: {
      changes: [
        { key: 'system.speedAdjustments.leapHorizontal', mode: 4, value: 2, priority: 20 },
        { key: 'system.speedAdjustments.leapVertical', mode: 4, value: 1, priority: 20 }
      ],
    },
  },
  "Shadowcreep Acrobatics": {
    base: {
      changes: [
        { key: 'system.speedAdjustments.difficultTerrain', mode: 2, value: 1, priority: 25 },
        { key: 'system.speedAdjustments.crawl', mode: 2, value: 1, priority: 25 },
        { key: 'system.speedAdjustments.climb', mode: 2, value: 1, priority: 25 },
        { key: 'system.speedAdjustments.hidden', mode: 2, value: 1, priority: 25 },
        { key: 'system.speedAdjustments.leapHorizontal', mode: 2, value: 1, priority: 25 },
        { key: 'system.speedAdjustments.leapVertical', mode: 2, value: 1, priority: 25 }
      ],
    },
  },
  "Natural Hide": {
    base: {
      changes: [{ key: 'system.naturalAv', mode: 4, value: 1, priority: 20 }],
    },
  },
  "Natural Scales": {
    base: {
      changes: [{ key: 'system.naturalAv', mode: 4, value: 2, priority: 20 }],
    },
  },
  "Natural Half Plate": {
    base: {
      changes: [{ key: 'system.naturalAv', mode: 4, value: 3, priority: 20 }],
    },
  },
  "Natural Full Plate": {
    base: {
      changes: [{ key: 'system.naturalAv', mode: 4, value: 4, priority: 20 }],
    },
  },
  "Cannot Swim": {
    base: {
      changes: [{ key: 'system.speedAdjustments.swim', mode: 6, value: 0, priority: 30 }],
    },
  },
  "Vicious Claws": {
    base: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 8, priority: 25 }],
    },
  },
  "Vicious Bite": {
    base: {
      changes: [{ key: 'system.damage.mouth', mode: 4, value: 8, priority: 25 }],
    },
  },
  "Shield Bash": {
    base: {
      changes: [
        { key: 'system.damage.bucklerShield', mode: 4, value: 4, priority: 20 },
        { key: 'system.damage.largeShield', mode: 4, value: 6, priority: 20 },
        { key: 'system.damage.towerShield', mode: 4, value: 8, priority: 20 }
      ],
    },
  },
  "Might Strike": {
    base: {
      changes: [{ key: 'system.damage.standard', mode: 2, value: " + 1d4[Holy]", priority: 20 }],
    },
  },
  "Control and Resist Fire": {
    base: {
      changes: [{ key: 'system.damage.standard', mode: 2, value: " + 1d4[Fire]", priority: 20 }],
    },
  },
  "Climbing": {
    base: {
      changes: [{ key: 'system.speedAdjustments.climb', mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: 'system.speedAdjustments.climb', mode: 4, value: 3, priority: 20 }],
    }
  },
  "Flying": {
    base: {
      changes: [{ key: 'system.speedAdjustments.fly', mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: 'system.speedAdjustments.fly', mode: 4, value: 3, priority: 20 }],
    }
  },
  "Offensive Martial Arts": {
    base: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 4, priority: 20 }],
    },
    proficient: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 6, priority: 20 }],
    },
    fluent: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 8, priority: 20 }],
    }
  },
  "Hind Claws": {
    base: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 2, priority: 20 }],
    },
    proficient: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 4, priority: 20 }],
    },
    fluent: {
      changes: [{ key: 'system.damage.hand', mode: 4, value: 6, priority: 20 }],
    }
  },
  "Bite": {
    base: {
      changes: [{ key: 'system.damage.mouth', mode: 4, value: 4, priority: 20 }],
    },
    proficient: {
      changes: [{ key: 'system.damage.mouth', mode: 4, value: 6, priority: 20 }],
    },
    fluent: {
      changes: [{ key: 'system.damage.mouth', mode: 4, value: 8, priority: 20 }],
    }
  },
  "Instant Ethereal": {
    base: {
      statuses: ["ethereal"],
    }
  }
}

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");

for (const [key, value] of Object.entries(tradecrafts)) {
  abilityOverrides["Talented " + value.name] = {
    base: {
      changes: [{ key: `system.tradecrafts.${key}.bonus`, mode: 4, value: 1, priority: 20 }],
    }
  }
  abilityOverrides["Expert " + value.name] = {
    base: {
      changes: [{ key: `system.tradecrafts.${key}.bonus`, mode: 4, value: 2, priority: 20 }],
    }
  }
}

export default function abilityApplications(name) {
  return abilityOverrides[name];
}