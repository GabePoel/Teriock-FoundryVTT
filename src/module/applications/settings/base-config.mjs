import { icons } from "../../constants/display/icons.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import TeriockBaseApplication from "../api/base-application.mjs";

const { fields } = foundry.data;
const { SettingsConfig } = foundry.applications.settings;

/**
 * Base application for configuring system settings.
 * Adapted from D&D 5E.
 */
export default class BaseConfig extends TeriockBaseApplication {
  /** @override */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: true, handler: BaseConfig.#onCommitChanges },
    position: { width: 650 },
    tag: "form",
    window: { contentClasses: ["standard-form", "teriock-settings"] },
  };

  /** @override */
  static PARTS = {
    general: { template: "teriock/settings/base-config" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /**
   * Context to display in the settings which this is registered as a menu.
   * @type {{key: string, label: string, hint: string, restricted: boolean}}
   */
  static SETTINGS_MENU = {
    key: "",
    label: "",
    hint: "",
    restricted: false,
  };

  /**
   * Commit settings changes.
   * This method processes the submitted form data, updates the settings, and determines if a reload is required.
   * @this {BaseConfig}
   * @param {SubmitEvent} _event - The submission event.
   * @param {HTMLFormElement} _form - The submitted form element.
   * @param {FormDataExtended} formData - The submitted form data.
   * @returns {Promise<void>} Resolves once the settings are updated, or prompts for a reload if required.
   */
  static async #onCommitChanges(_event, _form, formData) {
    let requiresClientReload = false;
    let requiresWorldReload = false;
    for (const [key, value] of Object.entries(
      foundry.utils.expandObject(formData.object),
    )) {
      const setting = game.settings.settings.get(`teriock.${key}`);
      const current = game.settings.get("teriock", key, { document: true });
      const prior = current?._source?.value ?? current;
      const updated = await game.settings.set("teriock", key, value, {
        document: true,
      });
      if (prior === (updated?._source?.value ?? updated)) continue;
      requiresClientReload ||=
        setting.scope !== "world" && setting.requiresReload;
      requiresWorldReload ||=
        setting.scope === "world" && setting.requiresReload;
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
      restricted: !!this.SETTINGS_MENU.restricted,
      type: this,
    });
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.fields = [];
    context.buttons = [
      {
        icon: makeIconClass(icons.ui.save, "button"),
        label: "SETTINGS.Save",
        type: "submit",
      },
    ];
    return context;
  }

  /**
   * Create the field data for a specific setting.
   * @param {Teriock.Keys.Setting} name - Setting key within the teriock namespace.
   * @returns {object}
   */
  createSettingField(name) {
    const setting = game.settings.settings.get(`teriock.${name}`);
    if (!setting)
      throw new Error(`Setting \`teriock.${name}\` not registered.`);
    const isDataField = setting.type instanceof fields.DataField;
    const Field = {
      [Boolean]: fields.BooleanField,
      [Number]: fields.NumberField,
      [String]: fields.StringField,
    }[setting.type];
    if (!isDataField && !Field) {
      throw new Error(
        "Automatic field generation only available for Boolean, Number, or String types",
      );
    }
    const data = {
      name,
      field: isDataField
        ? setting.type
        : new Field({ required: true, blank: false }),
      hint: _loc(setting.hint),
      label: _loc(setting.name),
      value: game.settings.get("teriock", name),
    };
    if (setting.choices)
      data.options = Object.entries(setting.choices).map(([value, label]) => ({
        value,
        label: _loc(label),
      }));
    return data;
  }

  /**
   * Create many setting fields all at once.
   * @param {Teriock.Keys.Setting[] | Record<string, *>} settings
   * @returns {object[]}
   */
  createSettingFields(settings) {
    if (typeof settings === "object") {
      if (!game.user.isGM) {
        settings = Object.fromEntries(
          Object.entries(settings).filter(([_k, v]) => v.scope !== "world"),
        );
      }
      settings = Object.keys(settings);
    }
    return settings.map((s) => this.createSettingField(s));
  }
}
