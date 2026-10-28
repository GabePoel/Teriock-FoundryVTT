import { makeIconClass } from "../../utils/_module.mjs";
import { TeriockDocumentSheet } from "../api/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * The CombatantGroup configuration application.
 * @property {TeriockCombatantGroup} document
 * @category Groups
 */
export default class CombatantGroupConfig extends TeriockDocumentSheet {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    form: { closeOnSubmit: true },
    position: { width: 420 },
    window: { contentClasses: ["standard-form"] },
  };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    form: { template: "teriock/shared/field-list-part" },
    footer: { template: "templates/generic/form-footer.hbs" },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const { fields, source } = context;
    return Object.assign(context, {
      buttons: [{
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.save),
        label: "TERIOCK.COMBAT.Group.ACTIONS.update",
        type: "submit",
      }],
      fields: ["name", "img", "initiative"].map(key => ({
        field: fields[key],
        label: `COMBATANT.FIELDS.${key}.label`,
        localize: true,
        name: key,
        placeholder: key === "initiative" ? undefined : this.document[key],
        value: source[key],
      })),
    });
  }
}
