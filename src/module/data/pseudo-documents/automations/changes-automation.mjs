import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { qualifiedChangeField } from "../../fields/helpers/builders.mjs";
import CritAutomation from "./crit-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Changes.QualifiedChangeData[]} changes
 */
export default class ChangesAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChangesAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changes";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      changes: new fields.ArrayField(qualifiedChangeField()),
    });
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate(
      systemPath("templates/document-templates/shared/changes.hbs"),
      {
        changesPath: `${this.fieldPath}.${this.id}.changes`,
        changesData: this.changes,
        valuePath: `_source.${this.fieldPath}.${this.id}.changes`,
        fieldDefs: this.schema.fields.changes.element.fields,
        editable: this.document.sheet.isEditable,
      },
    );
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
