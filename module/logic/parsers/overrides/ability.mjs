const abilitiesMap = {
  "Unbreachability": [
    { key: 'system.wornAc', mode: 4, value: 1, priority: 20 }
  ],
  "Dragon Scales": [
    { key: 'system.naturalAv', mode: 4, value: 2, priority: 20 }
  ],
  "Agile": [
    { key: 'system.speedAdjustments.difficultTerrain', mode: 4, value: 3, priority: 20 }
  ],
  "Digging": [
    { key: 'system.speedAdjustments.dig', mode: 4, value: 1, priority: 20 }
  ],
  "Gliding": [
    { key: 'system.speedAdjustments.fly', mode: 4, value: 1, priority: 20 }
  ],
  "Leap": [
    { key: 'system.speedAdjustments.leapHorizontal', mode: 4, value: 2, priority: 20 },
    { key: 'system.speedAdjustments.leapVertical', mode: 4, value: 1, priority: 20 }
  ],
  "Shadowcreep Acrobatics": [
    { key: 'system.speedAdjustments.difficultTerrain', mode: 2, value: 1, priority: 25 },
    { key: 'system.speedAdjustments.crawl', mode: 2, value: 1, priority: 25 },
    { key: 'system.speedAdjustments.climb', mode: 2, value: 1, priority: 25 },
    { key: 'system.speedAdjustments.hidden', mode: 2, value: 1, priority: 25 },
    { key: 'system.speedAdjustments.leapHorizontal', mode: 2, value: 1, priority: 25 },
    { key: 'system.speedAdjustments.leapVertical', mode: 2, value: 1, priority: 25 }
  ],
  "Natural Hide": [
    { key: 'system.naturalAv', mode: 4, value: 1, priority: 20 }
  ],
  "Natural Scales": [
    { key: 'system.naturalAv', mode: 4, value: 2, priority: 20 }
  ],
  "Natural Half Plate": [
    { key: 'system.naturalAv', mode: 4, value: 3, priority: 20 }
  ],
  "Natural Full Plate": [
    { key: 'system.naturalAv', mode: 4, value: 4, priority: 20 }
  ],
  "Cannot Swim": [
    { key: 'system.speedAdjustments.swim', mode: 6, value: 0, priority: 30 }
  ]
};

// For abilities with dynamic or prefix-based changes
const dynamicAbilities = [
  {
    prefix: "Talented",
    getChanges: ability => {
      const tradecraft = ability.name.split(" ")[1];
      return [{
        key: `system.tradecrafts.${tradecraft}.bonus`,
        mode: 4,
        value: 1,
        priority: 20
      }];
    }
  },
  {
    prefix: "Expert",
    getChanges: ability => {
      const tradecraft = ability.name.split(" ")[1];
      return [{
        key: `system.tradecrafts.${tradecraft}.bonus`,
        mode: 4,
        value: 2,
        priority: 20
      }];
    }
  },
  {
    prefix: "Climbing",
    getChanges: ability => {
      let amount = ability.parent?.system?.proficient ? 3 : 2;
      return [{
        key: 'system.speedAdjustments.climb',
        mode: 4,
        value: amount,
        priority: 20
      }];
    }
  },
  {
    prefix: "Flying",
    getChanges: ability => {
      let amount = ability.parent?.system?.proficient ? 3 : 2;
      return [{
        key: 'system.speedAdjustments.fly',
        mode: 4,
        value: amount,
        priority: 20
      }];
    }
  },
  {
    prefix: "Offensive Martial Arts",
    getChanges: ability => {
      let amount = ability.parent?.system?.proficient ? 6 : 4;
      amount = ability.parent?.system?.fluent ? 8 : amount;
      return [{
        key: 'system.damage.hand',
        mode: 4,
        value: amount,
        priority: 20
      }];
    }
  },
  {
    prefix: "Hind Claws",
    getChanges: ability => {
      let amount = ability.parent?.system?.proficient ? 6 : 4;
      amount = ability.parent?.system?.fluent ? 8 : amount;
      return [{
        key: 'system.damage.hand',
        mode: 4,
        value: amount,
        priority: 20
      }];
    }
  },
  {
    prefix: "Offensive Bite",
    getChanges: ability => {
      let amount = ability.parent?.system?.proficient ? 6 : 4;
      amount = ability.parent?.system?.fluent ? 8 : amount;
      return [{
        key: 'system.damage.mouth',
        mode: 4,
        value: amount,
        priority: 20
      }];
    }
  }
];

export default function abilityOverrides(ability, changes) {
  // Exact match
  if (abilitiesMap[ability.name]) {
    changes.push(...abilitiesMap[ability.name]);
    return changes;
  }
  // Prefix/dynamic match
  for (const entry of dynamicAbilities) {
    if (ability.name.startsWith(entry.prefix)) {
      changes.push(...entry.getChanges(ability));
      return changes;
    }
  }
  return changes;
}
