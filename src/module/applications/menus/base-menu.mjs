import { makeIconClass } from "../../helpers/icon.mjs";
import { TeriockApplication } from "../api/_module.mjs";

const { fields } = foundry.data;
const { SettingsConfig } = foundry.applications.settings;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import { FormDataExtended } from "@client/applications/ux/_module.mjs";
 */

/**
 * Base application for configuring system settings.
 * Originally adapted from D&D 5E.
 */
export default class BaseMenu extends TeriockApplication {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: true, handler: BaseMenu._onCommitChanges },
    position: { width: 650 },
    tag: "form",
    window: { contentClasses: ["standard-form", "teriock-settings"], resizable: true },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    general: { template: "teriock/menus/base-menu" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Context to display in the settings which this is registered as a menu.
   * @type {{key: string, label: string, hint: string, restricted: boolean}}
   */
  static SETTINGS_MENU = { hint: "", key: "", label: "", restricted: false };

  /**
   * Commit settings changes.
   * This method processes the submitted form data, updates the settings, and determines if a reload is required.
   * @this {BaseMenu}
   * @param {SubmitEvent} _event - The submission event.
   * @param {HTMLFormElement} _form - The submitted form element.
   * @param {FormDataExtended} formData - The submitted form data.
   * @returns {Promise<void>} Resolves once the settings are updated, or prompts for a reload if required.
   */
  static async _onCommitChanges(_event, _form, formData) {
    let requiresClientReload = false;
    let requiresWorldReload = false;
    for (const [key, value] of Object.entries(this._prepareCommitData(_event, _form, formData))) {
      const setting = game.settings.settings.get(`teriock.${key}`);
      const current = game.settings.get("teriock", key, { document: true });
      const prior = current?._source?.value ?? current;
      const updated = await game.settings.set("teriock", key, value, { document: true });
      if (prior === (updated?._source?.value ?? updated)) { continue; }
      requiresClientReload ||= setting.scope !== "world" && setting?.requiresReload;
      requiresWorldReload ||= setting.scope === "world" && setting?.requiresReload;
    }
    if (requiresClientReload || requiresWorldReload) {
      return SettingsConfig.reloadConfirm({ world: requiresWorldReload });
    }
  }

  /**
   * Register this settings config as a setting menu.
   */
  static registerMenu() {
    game.settings.registerMenu("teriock", this.SETTINGS_MENU.key, {
      hint: this.SETTINGS_MENU.hint,
      icon: this.DEFAULT_OPTIONS.window.icon,
      label: this.SETTINGS_MENU.label,
      name: this.DEFAULT_OPTIONS.window.title,
      restricted: Boolean(this.SETTINGS_MENU.restricted),
      type: this,
    });
  }

  /** @inheritDoc */
  _initializeApplicationOptions(options) {
    return Object.assign(super._initializeApplicationOptions(options), {
      uniqueId: `teriock-menu-${this.constructor.SETTINGS_MENU.key}`,
    });
  }

  /**
   * Prepare expanded settings data for commit.
   * @param {SubmitEvent} _event
   * @param {HTMLFormElement} _form
   * @param {FormDataExtended} formData
   * @returns {Record<string, *>}
   */
  _prepareCommitData(_event, _form, formData) {
    return foundry.utils.expandObject(formData.object);
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId in (context.tabs ?? {})) { context.tab = context.tabs[partId]; }
    context.fields = [];
    context.icon = undefined;
    context.label = undefined;
    context.fieldset = false;
    context.buttons = [{
      icon: makeIconClass(TERIOCK.display.icons.manifest.ui.save, "button"),
      label: "SETTINGS.Save",
      type: "submit",
    }];
    return context;
  }

  /**
   * Create the field data for a specific setting.
   * @param {string} name
   * @returns {object}
   */
  createSettingField(name) {
    const setting = this.getSetting(name);
    const isDataField = setting.type instanceof fields.DataField;
    const Field =
      { [Boolean]: fields.BooleanField, [Number]: fields.NumberField, [String]: fields.StringField }[setting.type];
    if (!isDataField && !Field) {
      throw new Error("Automatic field generation only available for Boolean, Number, or String types");
    }
    const data = {
      classes: ["teriock-icon-placeholder", ...setting.classes ?? []],
      field: isDataField ? setting.type : new Field({ blank: false, required: true }),
      hint: setting.hint,
      label: setting.name,
      localize: true,
      name,
      stacked: setting.stacked,
      value: game.settings.get("teriock", name),
    };
    if (setting.choices) {
      data.options = Object.entries(setting.choices).map(([value, label]) => ({ label, value }));
    }
    return data;
  }

  /**
   * Create many setting fields at once.
   * @param {string[] | Record<string, *>} settings
   * @returns {object[]}
   */
  createSettingFields(settings) {
    const names = Array.isArray(settings) ? settings : Object.keys(settings);
    return names.filter(name => game.user.isGM || (this.getSetting(name).scope !== "world")).flatMap(name =>
      foundry.utils.isSubclass(this.getSetting(name).type, foundry.abstract.DataModel)
        ? this.createSettingModelFields(name)
        : this.createSettingField(name)
    );
  }

  /**
   * Create the field data for a setting stored as a data model.
   * @param {string} name
   * @returns {object[]}
   */
  createSettingModelFields(name) {
    const value = game.settings.get("teriock", name) ?? {};
    const schemaFields = this.getSetting(name).type.schema.fields;
    return Object.entries(schemaFields).map(([key, field]) => ({
      field,
      hint: field.hint,
      label: field.label,
      localize: true,
      name: `${name}.${key}`,
      value: value[key],
    }));
  }

  /**
   * Get the registered configuration for a setting.
   * @param {string} name
   * @returns {Teriock.Settings.SettingEntry}
   */
  getSetting(name) {
    const setting = game.settings.settings.get(`teriock.${name}`);
    if (!setting) { throw new Error(`Setting \`teriock.${name}\` not registered.`); }
    return setting;
  }
}
