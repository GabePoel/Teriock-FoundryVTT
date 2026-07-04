import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields, LightData } = foundry.data;

/**
 * Modified light data that allows for blank type and color values so live updating works.
 * @inheritDoc
 */
class AutomationLightData extends LightData {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      animation: new fields.SchemaField({
        intensity: new fields.NumberField({
          initial: 5,
          integer: true,
          max: 10,
          min: 1,
          nullable: false,
          required: true,
          validationError: "Light animation intensity must be an integer between 1 and 10",
        }),
        reverse: new fields.BooleanField(),
        speed: new fields.NumberField({
          initial: 5,
          integer: true,
          max: 10,
          min: 0,
          nullable: false,
          required: true,
          validationError: "Light animation speed must be an integer between 0 and 10",
        }),
        type: new fields.StringField({ blank: true, initial: null, nullable: true }),
      }),
      color: new fields.ColorField({ blank: true, initial: null, nullable: true }),
    });
  }
}

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @property {AutomationLightData} light
 */
export default class LightAutomation extends CritMechanicMixin(BaseAutomation) {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Light.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { changes: true });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "light";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { light: new fields.EmbeddedDataField(AutomationLightData) });
  }

  /** @inheritDoc */
  getChanges() {
    return this.actor?.system.settings.getSetting("autoLighting")
      ? [{
        key: "token.light",
        phase: TERIOCK.config.change.defaultPhase,
        priority: Math.max(this.light.dim ?? 0, this.light.bright ?? 0),
        qualifier: "1",
        target: "Actor",
        type: "override",
        value: this.light,
      }]
      : [];
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate("templates/scene/token/light.hbs", {
      gridUnits: _loc("MEASUREMENT.GridUnits"),
      lightAnimations: this.light.negative ? CONFIG.Canvas.darknessAnimations : CONFIG.Canvas.lightAnimations,
      lightFields: this.getFieldForProperty("light").fields,
      rootId: this.uuid,
      source: this._source,
    });
    const element = foundry.utils.parseHTML(html);
    element.className = "teriock-form-container";
    element.querySelectorAll("[name]").forEach((el) => {
      el.setAttribute("name", el.getAttribute("name").replace("system.automations.element.light", this.localPath));
    });
    return element;
  }
}
