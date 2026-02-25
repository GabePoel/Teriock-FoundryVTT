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
        {
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.0"),
          icon: TERIOCK.display.icons.piercing.none,
          value: 0,
        },
        {
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.1"),
          icon: TERIOCK.display.icons.piercing.av0,
          value: 1,
        },
        {
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.2"),
          icon: TERIOCK.display.icons.piercing.ub,
          value: 2,
        },
      ],
      {
        path: "system.piercing.raw",
      },
    ),
    maneuver: [
      {
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.active"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.reactive"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.passive"),
        icon: makeIcon(TERIOCK.display.icons.maneuver.passive, "contextMenu"),
        callback: async () =>
          await ability.update({
            "system.maneuver": "passive",
            "system.executionTime": "passive",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.slow"),
        icon: makeIcon(TERIOCK.display.icons.maneuver.slow, "contextMenu"),
        callback: async () => {
          await ability.update({
            "system.maneuver": "slow",
            "system.executionTime.slow": "10 Minutes",
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.mp.type": "none",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp.type": "none",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.hack"),
        icon: makeIcon(TERIOCK.display.icons.ui.hack, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp.type": "hack",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "variable",
              "value.variable": game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.FIELDS.costs.default",
              ),
            },
          }),
      },
    ],
    goldCost: [
      {
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.gp.type": "none",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
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
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
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
        name: game.i18n.localize("TERIOCK.TERMS.BreakCost.none"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.break": null,
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.BreakCost.shatter"),
        icon: makeIcon(TERIOCK.display.icons.break.shatter, "contextMenu"),
        callback: () =>
          ability.update({
            "system.costs.break": "shatter",
          }),
      },
      {
        name: game.i18n.localize("TERIOCK.TERMS.BreakCost.destroy"),
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
