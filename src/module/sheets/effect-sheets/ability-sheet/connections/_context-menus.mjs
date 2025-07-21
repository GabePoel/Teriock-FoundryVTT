import { makeIcon } from "../../../../helpers/utils.mjs";

/**
 * Capitalizes the first character of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Removes attribute save changes from a changes array.
 * Filters out changes that match attribute save patterns.
 * @param {Array} changes - Array of changes to filter.
 * @returns {Array} Filtered array without attribute save changes.
 */
function removeAttributeSaveChanges(changes) {
  return changes.filter(
    (change) => !/^system\.attributes\.(int|mov|per|snk|str|unp)\.save(Proficient|Fluent)$/.test(change.key),
  );
}

/**
 * Creates context menus for ability configuration.
 * Provides comprehensive menu options for all ability properties and settings.
 * @param {TeriockAbility} ability - The ability to create context menus for.
 * @returns {object} Object containing all context menu configurations.
 */
export function contextMenus(ability) {
  /**
   * Fetches configuration values from CONFIG.TERIOCK.abilityOptions.
   * @param {string} keychain - Dot-separated keychain to traverse.
   * @returns {*} The configuration value at the specified path.
   */
  function fetch(keychain) {
    let keys = CONFIG.TERIOCK.abilityOptions;
    const keysArray = keychain.split(".");
    for (const key of keysArray) {
      keys = keys[key];
    }
    return keys;
  }

  /**
   * Creates a quick menu from configuration options.
   * @param {string} keychain - The configuration keychain to use.
   * @param {string} updateKey - The system key to update when an option is selected.
   * @param {boolean|null} nullOption - Whether to include a "None" option.
   * @returns {Array} Array of menu options.
   */
  function quickMenu(keychain, updateKey, nullOption = null) {
    const keys = fetch(keychain);
    const out = Object.entries(keys).map(([key, value]) => ({
      name: value,
      icon: CONFIG.TERIOCK.icons[key],
      callback: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        name: "None",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({ [updateKey]: null }),
      });
    }
    return out;
  }

  return {
    delivery: quickMenu("delivery", "system.delivery.base"),
    piercing: [
      {
        name: "Normal",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () => ability.update({ "system.piercing": "normal" }),
      },
      {
        name: "AV0",
        icon: CONFIG.TERIOCK.icons.av0,
        callback: () => ability.update({ "system.piercing": "av0" }),
      },
      {
        name: "UB",
        icon: CONFIG.TERIOCK.icons.ub,
        callback: () => ability.update({ "system.piercing": "ub" }),
      },
    ],
    maneuver: [
      {
        name: "Active",
        icon: CONFIG.TERIOCK.icons.active,
        callback: async () => {
          await ability.update({
            "system.maneuver": "active",
            "system.executionTime": "a1",
          });
          await ability.deleteSubs();
        },
      },
      {
        name: "Reactive",
        icon: CONFIG.TERIOCK.icons.reactive,
        callback: async () => {
          await ability.update({
            "system.maneuver": "reactive",
            "system.executionTime": "r1",
          });
          await ability.deleteSubs();
        },
      },
      {
        name: "Passive",
        icon: CONFIG.TERIOCK.icons.passive,
        callback: async () =>
          await ability.update({
            "system.maneuver": "passive",
            "system.executionTime": "passive",
          }),
      },
      {
        name: "Slow",
        icon: CONFIG.TERIOCK.icons.slow,
        callback: async () => {
          await ability.update({
            "system.maneuver": "slow",
            "system.executionTime": "10 Minutes",
          });
          await ability.deleteSubs();
        },
      },
    ],
    active: quickMenu("executionTime.active", "system.executionTime"),
    reactive: quickMenu("executionTime.reactive", "system.executionTime"),
    interaction: quickMenu("interaction", "system.interaction"),
    featSaveAttribute: quickMenu("featSaveAttribute", "system.featSaveAttribute"),
    targets: Object.entries(fetch("targets")).flatMap(([key, value]) => [
      {
        name: value,
        icon: CONFIG.TERIOCK.icons.unchecked,
        callback: async () => {
          const currentTargets = foundry.utils.getProperty(ability.system, "targets") || [];
          const newTargets = [...currentTargets, key];
          await ability.update({ "system.targets": newTargets });
        },
        condition: () => {
          const currentTargets = foundry.utils.getProperty(ability.system, "targets") || [];
          return !currentTargets.includes(key);
        },
      },
      {
        name: value,
        icon: CONFIG.TERIOCK.icons.checked,
        callback: async () => {
          const currentTargets = foundry.utils.getProperty(ability.system, "targets") || [];
          const newTargets = currentTargets.filter((t) => t !== key);
          await ability.update({ "system.targets": newTargets });
        },
        condition: () => {
          const currentTargets = foundry.utils.getProperty(ability.system, "targets") || [];
          return currentTargets.includes(key);
        },
      },
    ]),
    manaCost: [
      {
        name: "No Mana Cost",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "none",
              value: {
                static: 0,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Static Cost",
        icon: CONFIG.TERIOCK.icons.numerical,
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "static",
              value: {
                static: 1,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Formula Cost",
        icon: CONFIG.TERIOCK.icons.formula,
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "formula",
              value: {
                static: 0,
                formula: "1d4",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: CONFIG.TERIOCK.icons.variable,
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "variable",
              value: {
                static: 0,
                formula: "",
                variable: "<p>Enter cost here.</p>",
              },
            },
          }),
      },
    ],
    hitCost: [
      {
        name: "No Hit Cost",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "none",
              value: {
                static: 0,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Static Cost",
        icon: CONFIG.TERIOCK.icons.numerical,
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "static",
              value: {
                static: 1,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Hack Cost",
        icon: CONFIG.TERIOCK.icons.hack,
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "hack",
              value: {
                static: 0,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Formula Cost",
        icon: CONFIG.TERIOCK.icons.formula,
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "formula",
              value: {
                static: 0,
                formula: "1d4",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: CONFIG.TERIOCK.icons.variable,
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "variable",
              value: {
                static: 0,
                formula: "",
                variable: "<p>Enter cost here.</p>",
              },
            },
          }),
      },
    ],
    goldCost: [
      {
        name: "No Gold Cost",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "none",
              value: {
                static: 0,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Static Cost",
        icon: CONFIG.TERIOCK.icons.numerical,
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "static",
              value: {
                static: 50,
                formula: "",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Formula Cost",
        icon: CONFIG.TERIOCK.icons.formula,
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "formula",
              value: {
                static: 0,
                formula: "1d100",
                variable: "",
              },
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: CONFIG.TERIOCK.icons.variable,
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "variable",
              value: {
                static: 0,
                formula: "",
                variable: "<p>Enter cost here.</p>",
              },
            },
          }),
      },
    ],
    breakCost: [
      {
        name: "No Break Cost",
        icon: CONFIG.TERIOCK.icons.remove,
        callback: () =>
          ability.update({
            "system.costs.break": null,
          }),
      },
      {
        name: "Shatter Cost",
        icon: CONFIG.TERIOCK.icons.shatter,
        callback: () =>
          ability.update({
            "system.costs.break": "shatter",
          }),
      },
      {
        name: "Destroy Cost",
        icon: CONFIG.TERIOCK.icons.destroy,
        callback: () =>
          ability.update({
            "system.costs.break": "destroy",
          }),
      },
    ],
    expansion: quickMenu("expansion", "system.expansion", true),
    expansionSaveAttribute: quickMenu("featSaveAttribute", "system.expansionSaveAttribute"),

    attributeImprovement: ["int", "mov", "per", "snk", "str", "unp"].map((attr) => ({
      name: attr.toUpperCase(),
      icon: CONFIG.TERIOCK.icons[attr],
      callback: async () => {
        const existingChanges = ability.changes;
        const oldAttr = ability.system.improvements.attributeImprovement.attribute;
        const oldKey = oldAttr ? `system.attributes.${oldAttr}.value` : null;
        const newKey = `system.attributes.${attr}.value`;
        const filteredChanges = oldKey
          ? existingChanges.filter((change) => change.key !== oldKey)
          : [...existingChanges];
        const minVal = ability.system.improvements.attributeImprovement.minVal.toString();
        filteredChanges.push({
          key: newKey,
          mode: 2,
          value: minVal,
          priority: 20,
        });
        await ability.update({
          "system.improvements.attributeImprovement.attribute": attr,
          changes: filteredChanges,
        });
      },
    })),
    attributeImprovementMinVal: Array.from({ length: 9 }, (_, i) => i - 3).map((i) => ({
      name: i.toString(),
      icon: CONFIG.TERIOCK.icons.numerical,
      callback: async () => {
        const existingChanges = ability.changes;
        const key = `system.attributes.${ability.system.improvements.attributeImprovement.attribute}.value`;
        const filteredChanges = existingChanges.filter((change) => change.key !== key);
        existingChanges.length = 0;
        existingChanges.push(...filteredChanges);
        existingChanges.push({
          key: key,
          mode: 2,
          value: i,
          priority: 20,
        });
        await ability.update({
          "system.improvements.attributeImprovement.minVal": i,
          changes: existingChanges,
        });
      },
    })),
    featSaveImprovement: ["int", "mov", "per", "snk", "str", "unp"].map((attr) => ({
      name: attr.toUpperCase(),
      icon: CONFIG.TERIOCK.icons[attr],
      callback: async () => {
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
        await ability.update({
          "system.improvements.featSaveImprovement.attribute": attr,
          changes: filteredChanges,
        });
      },
    })),
    featSaveImprovementAmount: ["proficiency", "fluency"].map((level) => ({
      name: capitalize(level),
      icon: CONFIG.TERIOCK.icons[level],
      callback: async () => {
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
        await ability.update({
          "system.improvements.featSaveImprovement.amount": level,
          changes: filteredChanges,
        });
      },
    })),
    abilityType: Object.entries(fetch("abilityType")).map(([key, value]) => ({
      name: value.name,
      icon: makeIcon(value.icon, CONFIG.TERIOCK.iconStyles.contextMenu),
      callback: async () => {
        await ability.update({
          "system.abilityType": key,
        });
      },
    })),
  };
}
