import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { protectionOptions } from "../../../constants/options/protection-options.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

export default class ProtectionAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.ProtectionAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ProtectionAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "protection";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      relation: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionOptions.types, (t) => t.label),
        ),
        initial: "resistances",
      }),
      category: new fields.StringField({
        choices: localizeChoices(
          objectMap(protectionOptions.categories, (c) => c.label),
        ),
        initial: "abilities",
      }),
      description: new fields.StringField({
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
        ),
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
      protectionOptions.categories[this.category]?.choices || {},
    );
  }

  /**
   * A change that this protection applies to an actor.
   * @returns {Teriock.Changes.QualifiedChangeData|null}
   */
  get protectionChange() {
    if (
      !this.value ||
      (this.category !== "other" && !this._choices[this.value])
    )
      return null;
    return {
      key: `system.protections.${this.relation}.${this.category}`,
      mode: 2,
      priority: 5,
      qualifier: "1",
      target: "Actor",
      time: "normal",
      value: this.value,
    };
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate(
      systemPath("templates/document-templates/shared/protection-config.hbs"),
      {
        category: this.category,
        choices: this._choices,
        value: this.value,
        fields: this.schema.fields,
        path: `${this.fieldPath}.${this.id}`,
        relation: this.relation,
        uuid: this.uuid,
      },
    );
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
