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
   * @returns {ContextMenuEntry[]}
   */
  function quickMenu(config, updateKey, nullOption = null) {
    const out = Object.entries(config).map(([key, value]) => ({
      label: value,
      icon: makeIcon(findIconByKey(key) ?? key, "contextMenu"),
      onClick: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        label: _loc("TERIOCK.SCHEMA.Competence.choices.0"),
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        onClick: () => ability.update({ [updateKey]: null }),
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
      label: value.label,
      icon: makeIcon(value.icon, TERIOCK.display.iconStyles.contextMenu),
      onClick: async () => {
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
        onClick: async () => {
          await ability.update({
            "system.executionTime.base": "a1",
            "system.maneuver": "active",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.active, "contextMenu"),
        label: _loc("TERIOCK.TERMS.Maneuver.active"),
      },
      {
        onClick: async () => {
          await ability.update({
            "system.executionTime.base": "r1",
            "system.maneuver": "reactive",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.reactive, "contextMenu"),
        label: _loc("TERIOCK.TERMS.Maneuver.reactive"),
      },
      {
        onClick: async () =>
          await ability.update({
            "system.executionTime.base": "passive",
            "system.maneuver": "passive",
          }),
        icon: makeIcon(TERIOCK.display.icons.maneuver.passive, "contextMenu"),
        label: _loc("TERIOCK.TERMS.Maneuver.passive"),
      },
      {
        onClick: async () => {
          await ability.update({
            "system.executionTime.slow.raw": "10",
            "system.executionTime.slow.unit": "minute",
            "system.maneuver": "slow",
          });
          await ability.deleteSubDocuments(ability.subs.map((s) => s._id));
        },
        icon: makeIcon(TERIOCK.display.icons.maneuver.slow, "contextMenu"),
        label: _loc("TERIOCK.TERMS.Maneuver.slow"),
      },
    ],
    piercing: TeriockContextMenu.makeUpdateEntries(
      ability,
      [
        {
          icon: TERIOCK.display.icons.piercing.none,
          label: _loc("TERIOCK.MODELS.Piercing.MENU.0"),
          value: 0,
        },
        {
          icon: TERIOCK.display.icons.piercing.av0,
          label: _loc("TERIOCK.MODELS.Piercing.MENU.1"),
          value: 1,
        },
        {
          icon: TERIOCK.display.icons.piercing.ub,
          label: _loc("TERIOCK.MODELS.Piercing.MENU.2"),
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
