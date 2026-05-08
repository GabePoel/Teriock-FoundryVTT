import { protectionConfig } from "../../../constants/config/protection-config.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class ProtectionAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Protection",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Protection.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "protection";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { changes: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      category: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionConfig.categories, (c) => c.label),
        ),
        initial: "abilities",
        required: true,
      }),
      relation: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionConfig.types, (t) => t.label),
        ),
        initial: "resistances",
        required: true,
      }),
      value: new fields.StringField(),
    });
  }

  /**
   * @returns {Record<string, string>}
   */
  get _choices() {
    if (this.category === "other") return {};
    return foundry.utils.getProperty(
      TERIOCK,
      protectionConfig.categories[this.category]?.choices || {},
    );
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["relation", "category", "value"];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
    if (this.category !== "other" && path.endsWith("value")) {
      inputConfig.choices = this._choices;
    }
    return super._makeFormGroup(path, groupConfig, inputConfig);
  }

  /** @inheritDoc */
  getChanges() {
    if (
      !this.value ||
      (this.category !== "other" && !this._choices[this.value])
    )
      return [];
    return [
      {
        key: `system.protections.${this.relation}.${this.category}`,
        phase: TERIOCK.config.change.defaultPhase,
        priority: 5,
        qualifier: "1",
        target: "Actor",
        type: "add",
        value: this.value,
      },
    ];
  }
}
