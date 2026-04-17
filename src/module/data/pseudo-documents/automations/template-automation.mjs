import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @typedef TemplateConfig
 * @property {Teriock.System.FormulaString} angle
 * @property {Teriock.System.FormulaString} distance
 * @property {boolean} movable
 * @property {string} t
 * @property {Teriock.System.FormulaString} width
 */

/**
 * @extends {TemplateConfig}
 */
export default class TemplateAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Template",
    "TEMPLATE",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Template.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "template";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({
        initial: "0",
        label: "MEASUREMENT.Angle",
        min: 0,
        step: 0.01,
      }),
      distance: new FormulaField({
        initial: "0",
        label: "MEASUREMENT.Distance",
        min: 0,
      }),
      movable: new fields.BooleanField(),
      t: new fields.StringField({
        choices: localizeChoices({
          none: "None",
          circle: "SHAPE.TYPES.circle.name",
          cone: "SHAPE.TYPES.cone.name",
          rect: "SHAPE.TYPES.rectangle.name",
          ray: "SHAPE.TYPES.line.name",
        }),
        initial: "none",
        label: "SHAPE.label",
      }),
      width: new FormulaField({
        initial: "0",
        label: "MEASUREMENT.Width",
        min: 0,
        step: 0.01,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["t", "distance", "angle", "width", "movable"];
  }

  /**
   * Template options.
   * @returns {TemplateConfig}
   */
  get templateOptions() {
    return {
      angle: this.angle,
      distance: this.distance,
      movable: this.movable,
      t: this.t,
      width: this.width,
    };
  }
}
