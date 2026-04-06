import { mix } from "../../../helpers/utils.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  DisplayAutomationMixin,
  OverrideDataAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {CritAutomation}
 * @mixes CompetenceAutomation
 * @mixes DisplayAutomation
 * @mixes OverrideDataAutomation
 */
export default class ModifyEffectAutomation extends mix(
  CritAutomation,
  DisplayAutomationMixin,
  OverrideDataAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ModifyEffect",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ModifyEffect.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "modifyEffect";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      prevent: new fields.BooleanField({ initial: false }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "prevent",
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }
}
