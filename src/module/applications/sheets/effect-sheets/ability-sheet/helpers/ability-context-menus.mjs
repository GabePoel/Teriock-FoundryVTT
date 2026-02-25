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
   * Creates a quick menu from configuration options.
   * @param {string} keychain - The configuration keychain to use.
   * @param {string} updateKey - The system key to update when an option is selected.
   * @param {boolean|null} nullOption - Whether to include a "None" option.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  function quickMenu(keychain, updateKey, nullOption = null) {
    const keys = foundry.utils.getProperty(TERIOCK.options.ability, keychain);
    const out = Object.entries(keys).map(([key, value]) => ({
      name: value,
      icon: makeIcon(findIconByKey(key) ?? key, "contextMenu"),
      callback: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        name: game.i18n.localize("TERIOCK.SCHEMA.Competence.choices.0"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        callback: () => ability.update({ [updateKey]: null }),
      });
    }
    return out;
  }

  return {
    active: quickMenu("executionTime.active", "system.executionTime"),
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
    delivery: quickMenu("delivery", "system.delivery.base"),
    expansion: quickMenu("expansion", "system.expansion.type", true),
    expansionSaveAttribute: quickMenu(
      "featSaveAttribute",
      "system.expansion.featSaveAttribute",
    ),
    featSaveAttribute: quickMenu(
      "featSaveAttribute",
      "system.featSaveAttribute",
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
    goldCost: [
      {
        callback: () =>
          ability.update({
            "system.costs.gp.type": "none",
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "static",
              "value.static": 50,
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "formula",
              "value.formula": "1d100",
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.gp": {
              type: "variable",
              "value.variable": `<p>${game.i18n.localize("TERIOCK.TERMS.Cost.default")}</p>`,
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
      },
    ],
    hitCost: [
      {
        callback: () =>
          ability.update({
            "system.costs.hp.type": "none",
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "static",
              "value.static": 1,
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.hp.type": "hack",
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.hack, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.hack"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "formula",
              "value.formula": "1d4",
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.hp": {
              type: "variable",
              "value.variable": game.i18n.localize(
                "TERIOCK.SYSTEMS.Ability.FIELDS.costs.default",
              ),
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
      },
    ],
    interaction: quickMenu("interaction", "system.interaction"),
    manaCost: [
      {
        callback: () =>
          ability.update({
            "system.costs.mp.type": "none",
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.none"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "static",
              "value.static": 1,
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.numerical, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.static"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "formula",
              "value.formula": "1d4",
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.formula, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.formula"),
      },
      {
        callback: () =>
          ability.update({
            "system.costs.mp": {
              type: "variable",
              "value.variable": `<p>${game.i18n.localize("TERIOCK.TERMS.Cost.default")}</p>`,
            },
          }),
        icon: makeIcon(TERIOCK.display.icons.ui.variable, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Cost.variable"),
      },
    ],
    maneuver: [
      {
        callback: async () => {
          await ability.update({
            "system.executionTime.base": "a1",
            "system.maneuver": "active",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.active, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.active"),
      },
      {
        callback: async () => {
          await ability.update({
            "system.executionTime.base": "r1",
            "system.maneuver": "reactive",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.reactive, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.reactive"),
      },
      {
        callback: async () =>
          await ability.update({
            "system.executionTime.base": "passive",
            "system.maneuver": "passive",
          }),
        icon: makeIcon(TERIOCK.display.icons.maneuver.passive, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.passive"),
      },
      {
        callback: async () => {
          await ability.update({
            "system.executionTime.slow.raw": "10",
            "system.executionTime.slow.unit": "minute",
            "system.maneuver": "slow",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.slow, "contextMenu"),
        name: game.i18n.localize("TERIOCK.TERMS.Maneuver.slow"),
      },
    ],
    piercing: TeriockContextMenu.makeUpdateEntries(
      ability,
      [
        {
          icon: TERIOCK.display.icons.piercing.none,
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.0"),
          value: 0,
        },
        {
          icon: TERIOCK.display.icons.piercing.av0,
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.1"),
          value: 1,
        },
        {
          icon: TERIOCK.display.icons.piercing.ub,
          name: game.i18n.localize("TERIOCK.MODELS.Piercing.MENU.2"),
          value: 2,
        },
      ],
      {
        path: "system.piercing.raw",
      },
    ),
    reactive: quickMenu("executionTime.reactive", "system.executionTime"),
  };
}
