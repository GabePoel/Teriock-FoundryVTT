import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
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
    return Object.assign(super.metadata, {
      changes: true,
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      relation: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionConfig.types, (t) => t.label),
        ),
        initial: "resistances",
      }),
      category: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionConfig.categories, (c) => c.label),
        ),
        initial: "abilities",
      }),
      description: new fields.StringField({
        label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
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
  getChanges() {
    if (
      !this.value ||
      (this.category !== "other" && !this._choices[this.value])
    )
      return [];
    return [
      {
        key: `system.protections.${this.relation}.${this.category}`,
        phase: "normal",
        priority: 5,
        qualifier: "1",
        target: "Actor",
        type: "add",
        value: this.value,
      },
    ];
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate(
      "teriock/sheets/automations/protection-config",
      {
        category: this.category,
        choices: this._choices,
        value: this.value,
        fields: this.schema.fields,
        path: this.localPath,
        relation: this.relation,
        uuid: this.uuid,
      },
    );
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
