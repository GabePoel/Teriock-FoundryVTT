import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { qualifiedChangeField } from "../../fields/helpers/builders.mjs";
import { migrateChange } from "../../shared/migrations/change-migrations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Changes.QualifiedChangeData[]} changes
 */
export default class ChangesAutomation extends CritAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Changes.LABEL";
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
  static migrateData(data) {
    if (data.changes) for (const change of data.changes) migrateChange(change);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate(
      "teriock/sheets/shared/changes",
      {
        changesData: this.changes,
        changesPath: `${this.localPath}.changes`,
        editable: this.document.sheet.isEditable,
        fieldDefs: this.schema.fields.changes.element.fields,
        valuePath: `_source.${this.localPath}.changes`,
      },
    );
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
