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
    const attributeIcon = TERIOCK.config.attribute?.[key]?.icon;
    if (attributeIcon) { return attributeIcon; }
    for (const value of Object.values(iconMap)) {
      if (value && typeof value === "object") {
        const found = findIconByKey(key, value);
        if (found) { return found; }
      }
    }
    if (Object.prototype.hasOwnProperty.call(iconMap, key)) { return iconMap[key]; }
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
      icon: makeIcon(findIconByKey(key) ?? key, "contextMenu"),
      label: value,
      onClick: () => ability.update({ [updateKey]: key }),
    }));
    if (nullOption) {
      out.unshift({
        icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
        label: _loc("TERIOCK.SCHEMA.Competence.choices.0"),
        onClick: () => ability.update({ [updateKey]: null }),
      });
    }
    return out;
  }

  return {
    active: quickMenu(TERIOCK.config.ability.executionTime.active, "system.executionTime"),
    delivery: quickMenu(TERIOCK.config.ability.delivery, "system.delivery"),
    expansion: quickMenu(TERIOCK.config.ability.expansion, "system.expansion.type", true),
    expansionSaveAttribute: [{
      icon: makeIcon(TERIOCK.display.icons.ui.remove, "contextMenu"),
      label: _loc("TERIOCK.TERMS.Common.none"),
      onClick: async () => await ability.update({ "system.expansion.featSaveAttribute": null }),
    }, ...quickMenu(TERIOCK.reference.attributes, "system.expansion.featSaveAttribute")],
    featSaveAttribute: quickMenu(TERIOCK.reference.attributes, "system.featSaveAttribute"),
    form: Object.entries(TERIOCK.config.effect.form).map(([key, value]) => ({
      icon: makeIcon(value.icon, TERIOCK.display.iconStyles.contextMenu),
      label: value.label,
      onClick: async () => await ability.update({ "system.form": key }),
    })),
    interaction: quickMenu(TERIOCK.config.ability.interaction, "system.interaction"),
    maneuver: [{
      icon: makeIcon(TERIOCK.display.icons.maneuver.active, "contextMenu"),
      label: _loc("TERIOCK.TERMS.Maneuver.active"),
      onClick: async () => {
        await ability.update({ "system.executionTime.base": "a1", "system.maneuver": "active" });
      },
    }, {
      icon: makeIcon(TERIOCK.display.icons.maneuver.reactive, "contextMenu"),
      label: _loc("TERIOCK.TERMS.Maneuver.reactive"),
      onClick: async () => {
        await ability.update({ "system.executionTime.base": "r1", "system.maneuver": "reactive" });
      },
    }, {
      icon: makeIcon(TERIOCK.display.icons.maneuver.passive, "contextMenu"),
      label: _loc("TERIOCK.TERMS.Maneuver.passive"),
      onClick: async () =>
        await ability.update({ "system.executionTime.base": "passive", "system.maneuver": "passive" }),
    }, {
      icon: makeIcon(TERIOCK.display.icons.maneuver.slow, "contextMenu"),
      label: _loc("TERIOCK.TERMS.Maneuver.slow"),
      onClick: async () => {
        await ability.update({
          "system.executionTime.slow.raw": "10",
          "system.executionTime.slow.unit": "minute",
          "system.maneuver": "slow",
        });
      },
    }],
    piercing: TeriockContextMenu.makeUpdateEntries(ability, [
      { icon: TERIOCK.display.icons.piercing.none, label: _loc("TERIOCK.MODELS.Piercing.MENU.0"), value: 0 },
      { icon: TERIOCK.display.icons.piercing.av0, label: _loc("TERIOCK.MODELS.Piercing.MENU.1"), value: 1 },
      { icon: TERIOCK.display.icons.piercing.ub, label: _loc("TERIOCK.MODELS.Piercing.MENU.2"), value: 2 },
    ], { path: "system.piercing.raw" }),
    reactive: quickMenu(TERIOCK.config.ability.executionTime.reactive, "system.executionTime"),
  };
}
