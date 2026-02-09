import { systemPath } from "../../../helpers/path.mjs";
import { qualifiedChangeField } from "../../fields/helpers/builders.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Changes.QualifiedChangeData[]} changes
 */
export default class ChangesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Changes";
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
  async _getEditorForms() {
    return foundry.applications.handlebars.renderTemplate(
      systemPath("templates/document-templates/shared/changes.hbs"),
      {
        changesPath: `${this.fieldPath}.${this.id}.changes`,
        changesData: this.changes,
        valuePath: `_source.${this.fieldPath}.${this.id}.changes`,
        fieldDefs: this.schema.fields.changes.element.fields,
        editable: this.document.sheet.isEditable,
        TERIOCK,
      },
    );
  }
}
