import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {number} angle
 * @property {number} distance
 * @property {boolean} movable
 * @property {string} t
 * @property {number} width
 */
export default class TemplateAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.TemplateAutomation",
    "TEMPLATE",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.TemplateAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "template";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      angle: new FormulaField({
        initial: 0,
        min: 0,
        step: 0.01,
      }),
      distance: new FormulaField({
        initial: 0,
        min: 0,
      }),
      movable: new fields.BooleanField(),
      t: new fields.StringField({
        choices: localizeChoices({
          none: "None",
          circle: "TEMPLATE.TYPES.circle",
          cone: "TEMPLATE.TYPES.cone",
          rect: "TEMPLATE.TYPES.rect",
          ray: "TEMPLATE.TYPES.ray",
        }),
        initial: "none",
      }),
      width: new FormulaField({
        initial: 0,
        label: "Width",
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
   * @returns {{angle: number, distance: number, movable: boolean, t: string, width: number}}
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
