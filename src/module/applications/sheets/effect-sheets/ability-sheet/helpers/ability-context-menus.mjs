import { makeIcon } from "../../../../../helpers/utils.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * Creates context menus for ability configuration.
 * Provides comprehensive menu options for all ability properties and settings.
 * @param {TeriockAbility} ability - The ability to create context menus for.
 * @returns {object} Object containing all context menu configurations.
 */
export default function abilityContextMenus(ability) {
  /**
   * Finds an icon name by key from nested icon maps.
   * @param {string} key
   * @param {object} [iconMap]
   * @returns {string | null}
   */
  function findIconByKey(key, iconMap = TERIOCK.display.icons) {
    const attributeIcon = TERIOCK.options.attribute?.[key]?.icon;
    if (attributeIcon) {
      return attributeIcon;
    }
    for (const value of Object.values(iconMap)) {
      if (value && typeof value === "object") {
        const found = findIconByKey(key, value);
        if (found) return found;
      }
    }
    if (Object.prototype.hasOwnProperty.call(iconMap, key)) {
      return iconMap[key];
    }
    return null;
  }

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
      icon: makeIcon(findIconByKey(key) ?? key, "contextMenu"),
      callback: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        name: "None",
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () => ability.update({ [updateKey]: null }),
      });
    }
    return out;
  }

  return {
    delivery: quickMenu("delivery", "system.delivery.base"),
    piercing: TeriockContextMenu.makeUpdateEntries(
      ability,
      [
        { name: "None", icon: TERIOCK.display.icons.piercing.none, value: 0 },
        { name: "AV0", icon: TERIOCK.display.icons.piercing.av0, value: 1 },
        { name: "UB", icon: TERIOCK.display.icons.piercing.ub, value: 2 },
      ],
      {
        path: "system.piercing.raw",
      },
    ),
    maneuver: [
      {
        name: "Active",
        icon: makeIcon(TERIOCK.display.icons.maneuver.active, "contextMenu"),
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
        icon: makeIcon(TERIOCK.display.icons.maneuver.reactive, "contextMenu"),
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
        icon: makeIcon(TERIOCK.display.icons.maneuver.passive, "contextMenu"),
        callback: async () =>
          await ability.update({
            "system.maneuver": "passive",
            "system.executionTime": "passive",
          }),
      },
      {
        name: "Slow",
        icon: makeIcon(TERIOCK.display.icons.maneuver.slow, "contextMenu"),
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
    manaCost: [
      {
        name: "No Mana Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.mp.type": "none",
          }),
      },
      {
        name: "Static Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "static",
              "value.static": 1,
            },
          }),
      },
      {
        name: "Formula Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "formula",
              "value.formula": "1d4",
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "variable",
              "value.variable": "<p>Enter cost here.</p>",
            },
          }),
      },
    ],
    hitCost: [
      {
        name: "No Hit Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp.type": "none",
          }),
      },
      {
        name: "Static Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "static",
              "value.static": 1,
            },
          }),
      },
      {
        name: "Hack Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.hack, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp.type": "hack",
          }),
      },
      {
        name: "Formula Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "formula",
              "value.formula": "1d4",
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "variable",
              "value.variable": "<p>Enter cost here.</p>",
            },
          }),
      },
    ],
    goldCost: [
      {
        name: "No Gold Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.gp.type": "none",
          }),
      },
      {
        name: "Static Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "static",
              "value.static": 50,
            },
          }),
      },
      {
        name: "Formula Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "formula",
              "value.formula": "1d100",
            },
          }),
      },
      {
        name: "Variable Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "variable",
              "value.variable": "<p>Enter cost here.</p>",
            },
          }),
      },
    ],
    breakCost: [
      {
        name: "No Break Cost",
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.break": null,
          }),
      },
      {
        name: "Shatter Cost",
        icon: makeIcon(TERIOCK.display.icons.break.shatter, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.break": "shatter",
          }),
      },
      {
        name: "Destroy Cost",
        icon: makeIcon(TERIOCK.display.icons.break.destroy, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.break": "destroy",
          }),
      },
    ],
    expansion: quickMenu("expansion", "system.expansion.type", true),
    expansionSaveAttribute: quickMenu(
      "featSaveAttribute",
      "system.expansion.featSaveAttribute",
    ),
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
