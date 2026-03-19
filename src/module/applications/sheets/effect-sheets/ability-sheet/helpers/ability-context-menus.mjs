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
   * @param {Record<string, string>} config - The configuration to use.
   * @param {string} updateKey - The system key to update when an option is selected.
   * @param {boolean|null} nullOption - Whether to include a "None" option.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  function quickMenu(config, updateKey, nullOption = null) {
    const out = Object.entries(config).map(([key, value]) => ({
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
    active: quickMenu(
      TERIOCK.options.ability.executionTime.active,
      "system.executionTime",
    ),
    delivery: quickMenu(TERIOCK.options.ability.delivery, "system.delivery"),
    expansion: quickMenu(
      TERIOCK.options.ability.expansion,
      "system.expansion.type",
      true,
    ),
    expansionSaveAttribute: quickMenu(
      TERIOCK.reference.attributes,
      "system.expansion.featSaveAttribute",
    ),
    featSaveAttribute: quickMenu(
      TERIOCK.reference.attributes,
      "system.featSaveAttribute",
    ),
    form: Object.entries(TERIOCK.options.effect.form).map(([key, value]) => ({
      name: value.name,
      icon: makeIcon(value.icon, TERIOCK.display.iconStyles.contextMenu),
      callback: async () => {
        await ability.update({
          "system.form": key,
        });
      },
    })),
    interaction: quickMenu(
      TERIOCK.options.ability.interaction,
      "system.interaction",
    ),
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
    reactive: quickMenu(
      TERIOCK.options.ability.executionTime.reactive,
      "system.executionTime",
    ),
  };
}
