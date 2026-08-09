import { makeIconClass } from "../../helpers/icon.mjs";
import BaseMenu from "./base-menu.mjs";

/**
 * Localize a menu.
 * @param {string} key
 * @param {Teriock.Settings.MenuEntry} menu
 */
function localizeMenu(key, menu) {
  const path = `TERIOCK.MENUS.${key.capitalize()}`;
  menu.hint ??= `${path}.hint`;
  menu.label ??= `${path}.label`;
  menu.title ??= `${path}.name`;
  const definitions = [];
  for (const [groupKey, group] of Object.entries(menu.groups)) {
    group.label ??= `${path}.parts.${groupKey}`;
    for (const [settingKey, definition] of Object.entries(group.settings)) {
      definition.name ??= `TERIOCK.SETTINGS.${settingKey}.name`;
      definition.hint ??= `TERIOCK.SETTINGS.${settingKey}.hint`;
      definitions.push(definition);
    }
  }
  menu.restricted ??= definitions.every(d => d.scope === "world");
}

/**
 * Build the application for a settings menu.
 * @param {string} key
 * @param {Teriock.Settings.MenuEntry} menu
 * @returns {typeof BaseMenu}
 */
export default function MenuFactory(key, menu) {
  localizeMenu(key, menu);
  const groups = Object.entries(menu.groups);
  const tabbed = menu.format === "tabs";
  const template = tabbed ? "teriock/menus/tabbed-menu" : "teriock/menus/base-menu";
  return class SettingsMenu extends (menu.application ?? BaseMenu) {
    /** @inheritDoc */
    static DEFAULT_OPTIONS = { window: { icon: makeIconClass(menu.icon, "title"), title: menu.title } };

    /** @inheritDoc */
    static PARTS = {
      ...(tabbed ? { tabs: { template: "templates/generic/tab-navigation.hbs" } } : {}),
      ...Object.fromEntries(groups.map(([id, group]) => [id, { template: group.template ?? template }])),
      footer: BaseMenu.PARTS.footer,
    };

    /** @inheritDoc */
    static SETTINGS_MENU = { hint: menu.hint, key: `${key}Config`, label: menu.label, restricted: menu.restricted };

    /** @inheritDoc */
    static TABS = tabbed
      ? {
        primary: {
          initial: groups[0][0],
          tabs: groups.map(([id, group]) => ({ icon: makeIconClass(group.icon, "solid"), id, label: group.label })),
        },
      }
      : {};

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (tabbed) { context.tabClasses = "top-tabs"; }
      const group = menu.groups[partId];
      if (!group || group.template) { return context; }
      context.fields = this.createSettingFields(group.settings);
      context.fieldset = !tabbed && (groups.length > 1);
      context.icon = group.icon;
      context.label = group.label;
      return context;
    }
  };
}
