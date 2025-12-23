import { toTitleCase } from "../../../../../helpers/string.mjs";
import { makeIcon } from "../../../../../helpers/utils.mjs";

/**
 * Creates context menus for ability configuration.
 * Provides comprehensive menu options for all ability properties and settings.
 * @param {TeriockAbility} ability - The ability to create context menus for.
 * @returns {object} Object containing all context menu configurations.
 */
export default function abilityContextMenus(ability) {
  /**
   * Fetches configuration values from `TERIOCK.options.ability`.
   * @param {string} keychain - Dot-separated keychain to traverse.
   * @returns {*} The configuration value at the specified path.
   */
  function fetch(keychain) {
    let keys = TERIOCK.options.ability;
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
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  function quickMenu(keychain, updateKey, nullOption = null) {
    const keys = fetch(keychain);
    const out = Object.entries(keys).map(([key, value]) => ({
      name: value,
      icon: TERIOCK.display.icons[key],
      callback: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        name: "None",
        icon: TERIOCK.display.icons.remove,
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
        icon: TERIOCK.display.icons.remove,
        callback: () => ability.update({ "system.piercing": "normal" }),
      },
      {
        name: "AV0",
        icon: TERIOCK.display.icons.av0,
        callback: () => ability.update({ "system.piercing": "av0" }),
      },
      {
        name: "UB",
        icon: TERIOCK.display.icons.ub,
        callback: () => ability.update({ "system.piercing": "ub" }),
      },
    ],
    maneuver: [
      {
        name: "Active",
        icon: TERIOCK.display.icons.active,
        callback: async () => {
          await ability.update({
            "system.maneuver": "active",
            "system.executionTime": "a1",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
      },
      {
        name: "Reactive",
        icon: TERIOCK.display.icons.reactive,
        callback: async () => {
          await ability.update({
            "system.maneuver": "reactive",
            "system.executionTime": "r1",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
      },
      {
        name: "Passive",
        icon: TERIOCK.display.icons.passive,
        callback: async () =>
          await ability.update({
            "system.maneuver": "passive",
            "system.executionTime": "passive",
          }),
      },
      {
        name: "Slow",
        icon: TERIOCK.display.icons.slow,
        callback: async () => {
          await ability.update({
            "system.maneuver": "slow",
            "system.executionTime": "10 Minutes",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
      },
    ],
    active: quickMenu("executionTime.active", "system.executionTime"),
    reactive: quickMenu("executionTime.reactive", "system.executionTime"),
    interaction: quickMenu("interaction", "system.interaction"),
    featSaveAttribute: quickMenu(
      "featSaveAttribute",
      "system.featSaveAttribute",
    ),
    targets: Object.entries(TERIOCK.options.ability.targets).flatMap(
      ([key, value]) => [
        {
          name: value,
          icon: TERIOCK.display.icons.unchecked,
          callback: async () => {
            const currentTargets = ability.system.targets;
            const newTargets = [...currentTargets, key];
            await ability.update({ "system.targets": newTargets });
          },
          condition: () => {
            const currentTargets = ability.system.targets;
            return !currentTargets.has(key);
          },
        },
        {
          name: value,
          icon: TERIOCK.display.icons.checked,
          callback: async () => {
            const currentTargets = ability.system.targets;
            const newTargets = currentTargets.filter((t) => t !== key);
            await ability.update({ "system.targets": newTargets });
          },
          condition: () => {
            const currentTargets = ability.system.targets;
            return currentTargets.has(key);
          },
        },
      ],
    ),
    manaCost: [
      {
        name: "No Mana Cost",
        icon: TERIOCK.display.icons.remove,
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
        icon: TERIOCK.display.icons.numerical,
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
        icon: TERIOCK.display.icons.formula,
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
        icon: TERIOCK.display.icons.variable,
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
        icon: TERIOCK.display.icons.remove,
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
        icon: TERIOCK.display.icons.numerical,
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
        icon: TERIOCK.display.icons.hack,
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
        icon: TERIOCK.display.icons.formula,
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
        icon: TERIOCK.display.icons.variable,
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
        icon: TERIOCK.display.icons.remove,
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
        icon: TERIOCK.display.icons.numerical,
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
        icon: TERIOCK.display.icons.formula,
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
        icon: TERIOCK.display.icons.variable,
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
        icon: TERIOCK.display.icons.remove,
        callback: () =>
          ability.update({
            "system.costs.break": null,
          }),
      },
      {
        name: "Shatter Cost",
        icon: TERIOCK.display.icons.shatter,
        callback: () =>
          ability.update({
            "system.costs.break": "shatter",
          }),
      },
      {
        name: "Destroy Cost",
        icon: TERIOCK.display.icons.destroy,
        callback: () =>
          ability.update({
            "system.costs.break": "destroy",
          }),
      },
    ],
    expansion: quickMenu("expansion", "system.expansion", true),
    expansionSaveAttribute: quickMenu(
      "featSaveAttribute",
      "system.expansionSaveAttribute",
    ),

    attributeImprovement: Object.keys(TERIOCK.index.statAttributes).map(
      (attr) => ({
        name: attr.toUpperCase(),
        icon: TERIOCK.display.icons[attr],
        callback: async () => {
          await ability.update({
            "system.improvements.attributeImprovement.attribute": attr,
          });
        },
      }),
    ),
    attributeImprovementMinVal: Array.from({ length: 9 }, (_, i) => i - 3).map(
      (i) => ({
        name: i.toString(),
        icon: TERIOCK.display.icons.numerical,
        callback: async () => {
          await ability.update({
            "system.improvements.attributeImprovement.minVal": i,
          });
        },
      }),
    ),
    featSaveImprovement: Object.keys(TERIOCK.index.attributes).map((attr) => ({
      name: attr.toUpperCase(),
      icon: TERIOCK.display.icons[attr],
      callback: async () => {
        await ability.update({
          "system.improvements.featSaveImprovement.attribute": attr,
        });
      },
    })),
    featSaveImprovementAmount: Object.keys(
      TERIOCK.options.ability.featSaveImprovementAmount,
    ).map((level) => ({
      name: toTitleCase(level),
      icon: TERIOCK.display.icons[level],
      callback: async () => {
        await ability.update({
          "system.improvements.featSaveImprovement.amount": level,
        });
      },
    })),
    form: Object.entries(TERIOCK.options.ability.form).map(([key, value]) => ({
      name: value.name,
      icon: makeIcon(value.icon, TERIOCK.display.iconStyles.contextMenu),
      callback: async () => {
        await ability.update({
          "system.form": key,
        });
      },
    })),
  };
}
