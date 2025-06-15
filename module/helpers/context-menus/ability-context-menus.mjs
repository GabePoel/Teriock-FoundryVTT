import { makeIcon } from "../utils.mjs";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function removeAttributeSaveChanges(changes) {
  return changes.filter(change =>
    !/^system\.attributes\.(int|mov|per|snk|str|unp)\.save(Proficient|Fluent)$/.test(change.key)
  );
}

export function contextMenus(ability) {
  function fetch(keyChain) {
    let keys = CONFIG.TERIOCK.abilityOptions;
    const keysArray = keyChain.split('.');
    for (const key of keysArray) {
      keys = keys[key];
    }
    return keys;
  }

  function quickMenu(keyChain, updateKey, nullOption = null) {
    const keys = fetch(keyChain);
    const out = Object.entries(keys).map(([key, value]) => ({
      name: value,
      icon: CONFIG.TERIOCK.icons[key],
      callback: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        name: 'None',
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({ [updateKey]: null }),
      });
    }
    return out;
  }

  return {
    delivery: quickMenu('delivery', 'system.delivery.base'),
    piercing: [
      {
        name: 'Normal',
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({ 'system.piercing': 'normal' }),
      },
      {
        name: 'AV0',
        icon: CONFIG.TERIOCK.icons.av0,
        callback: () => ability.update({ 'system.piercing': 'av0' }),
      },
      {
        name: 'UB',
        icon: CONFIG.TERIOCK.icons.ub,
        callback: () => ability.update({ 'system.piercing': 'ub' }),
      }
    ],
    maneuver: [
      {
        name: 'Active',
        icon: CONFIG.TERIOCK.icons.active,
        callback: async () => {
          await ability.update({
            'system.maneuver': 'active',
            'system.executionTime': 'a1'
          })
          await ability.deleteChildren();
        },
      },
      {
        name: 'Reactive',
        icon: CONFIG.TERIOCK.icons.reactive,
        callback: async () => {
          await ability.update({
            'system.maneuver': 'reactive',
            'system.executionTime': 'r1'
          })
          await ability.deleteChildren();
        },
      },
      {
        name: 'Passive',
        icon: CONFIG.TERIOCK.icons.passive,
        callback: async () => await ability.update({
          'system.maneuver': 'passive',
          'system.executionTime': 'passive'
        }),
      },
      {
        name: 'Slow',
        icon: CONFIG.TERIOCK.icons.slow,
        callback: async () => {
          await ability.update({
            'system.maneuver': 'slow',
            'system.executionTime': '10 Minutes'
          })
          await ability.deleteChildren();
        },
      },
    ],
    active: quickMenu('executionTime.active', 'system.executionTime'),
    reactive: quickMenu('executionTime.reactive', 'system.executionTime'),
    interaction: quickMenu('interaction', 'system.interaction'),
    featSaveAttribute: quickMenu('featSaveAttribute', 'system.featSaveAttribute'),
    targets: Object.entries(fetch('targets')).flatMap(([key, value]) => ([
      {
        name: value,
        icon: CONFIG.TERIOCK.icons.unchecked,
        callback: async () => {
          const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
          const newTargets = [...currentTargets, key];
          await ability.update({ 'system.targets': newTargets });
        },
        condition: () => {
          const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
          return !currentTargets.includes(key);
        }
      },
      {
        name: value,
        icon: CONFIG.TERIOCK.icons.checked,
        callback: async () => {
          const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
          const newTargets = currentTargets.filter(t => t !== key);
          await ability.update({ 'system.targets': newTargets });
        },
        condition: () => {
          const currentTargets = foundry.utils.getProperty(ability.system, 'targets') || [];
          return currentTargets.includes(key);
        }
      }
    ])),
    manaCost: [
      {
        name: 'No Mana Cost',
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({
          'system.costs.mp': null,
          'system.costs.manaCost': null,
        }),
      },
      {
        name: 'Numerical Cost',
        icon: CONFIG.TERIOCK.icons.numerical,
        callback: () => ability.update({
          'system.costs.mp': '1 MP',
          'system.costs.manaCost': null,
        }),
      },
      {
        name: 'Variable Cost',
        icon: CONFIG.TERIOCK.icons.variable,
        callback: () => ability.update({
          'system.costs.mp': 'x',
          'system.costs.manaCost': 'Insert text here.',
        }),
      }
    ],
    hitCost: [
      {
        name: 'No Hit Cost',
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({
          'system.costs.hp': null,
          'system.costs.hitCost': null,
        }),
      },
      {
        name: 'Numerical Cost',
        icon: CONFIG.TERIOCK.icons.numerical,
        callback: () => ability.update({
          'system.costs.hp': '1 HP',
          'system.costs.hitCost': null,
        }),
      },
      {
        name: 'Hack Cost',
        icon: CONFIG.TERIOCK.icons.hack,
        callback: () => ability.update({
          'system.costs.hp': 'hack',
          'system.costs.hitCost': null,
        }),
      },
      {
        name: 'Variable Cost',
        icon: CONFIG.TERIOCK.icons.variable,
        callback: () => ability.update({
          'system.costs.hp': 'x',
          'system.costs.hitCost': 'Insert text here.',
        }),
      }
    ],
    breakCost: [
      {
        name: 'No Break Cost',
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({
          'system.costs.break': null,
        }),
      },
      {
        name: 'Shatter Cost',
        icon: CONFIG.TERIOCK.icons.shatter,
        callback: () => ability.update({
          'system.costs.break': 'shatter',
        }),
      },
      {
        name: 'Destroy Cost',
        icon: CONFIG.TERIOCK.icons.destroy,
        callback: () => ability.update({
          'system.costs.break': 'destroy',
        }),
      }
    ],
    expansion: quickMenu('expansion', 'system.expansion', true),
    expansionSaveAttribute: quickMenu('featSaveAttribute', 'system.expansionSaveAttribute'),

    attributeImprovement: ["int", "mov", "per", "snk", "str", "unp"].map(attr => ({
      name: attr.toUpperCase(),
      icon: CONFIG.TERIOCK.icons[attr],
      callback: () => {
        const existingChanges = ability.changes;
        const oldAttr = ability.system.improvements.attributeImprovement.attribute;
        const oldKey = oldAttr ? `system.attributes.${oldAttr}.value` : null;
        const newKey = `system.attributes.${attr}.value`;
        const filteredChanges = oldKey
          ? existingChanges.filter(change => change.key !== oldKey)
          : [...existingChanges];
        const minVal = ability.system.improvements.attributeImprovement.minVal ?? 0;
        filteredChanges.push({
          key: newKey,
          mode: 2,
          value: minVal,
          priority: 20,
        });
        ability.update({
          'system.improvements.attributeImprovement.attribute': attr,
          'changes': filteredChanges,
        });
      },
    })),
    attributeImprovementMinVal: Array.from({ length: 9 }, (_, i) => i - 3).map(i => ({
      name: i.toString(),
      icon: CONFIG.TERIOCK.icons.numerical,
      callback: () => {
        const existingChanges = ability.changes;
        const key = `system.attributes.${ability.system.improvements.attributeImprovement.attribute}.value`;
        const filteredChanges = existingChanges.filter(change => change.key !== key);
        existingChanges.length = 0;
        existingChanges.push(...filteredChanges);
        existingChanges.push({
          key: key,
          mode: 2,
          value: i,
          priority: 20,
        });
        ability.update({
          'system.improvements.attributeImprovement.minVal': i,
          'changes': existingChanges,
        });
      },
    })),
    featSaveImprovement: ["int", "mov", "per", "snk", "str", "unp"].map(attr => ({
      name: attr.toUpperCase(),
      icon: CONFIG.TERIOCK.icons[attr],
      callback: () => {
        const existingChanges = ability.changes;
        const amount = ability.system.improvements.featSaveImprovement.amount || "proficiency";
        const saveKey = amount === "fluency" ? "saveFluent" : "saveProficient";
        const newKey = `system.attributes.${attr}.${saveKey}`;
        const filteredChanges = removeAttributeSaveChanges(existingChanges);
        filteredChanges.push({
          key: newKey,
          mode: 2,
          value: true,
          priority: 20,
        });
        ability.update({
          'system.improvements.featSaveImprovement.attribute': attr,
          'changes': filteredChanges,
        });
      },
    })),
    featSaveImprovementAmount: ["proficiency", "fluency"].map(level => ({
      name: capitalize(level),
      icon: CONFIG.TERIOCK.icons[level],
      callback: () => {
        const existingChanges = ability.changes;
        const attr = ability.system.improvements.featSaveImprovement.attribute;
        if (!attr) return;
        const saveKey = level === "fluency" ? "saveFluent" : "saveProficient";
        const newKey = `system.attributes.${attr}.${saveKey}`;
        const filteredChanges = removeAttributeSaveChanges(existingChanges);
        filteredChanges.push({
          key: newKey,
          mode: 2,
          value: true,
          priority: 20,
        });
        ability.update({
          'system.improvements.featSaveImprovement.amount': level,
          'changes': filteredChanges,
        });
      },
    })),
    abilityType: Object.entries(fetch('abilityType')).map(([key, value]) => ({
      name: value.name,
      icon: makeIcon(value.icon, CONFIG.TERIOCK.iconStyles.contextMenu),
      callback: () => {
        ability.update({
          'system.abilityType': key,
        });
      },
    })),
  };
}
