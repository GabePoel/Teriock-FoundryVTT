import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { qualifiedChangeField } from "../../fields/helpers/builders.mjs";
import { v14MigrateChangeMode } from "../../shared/migrations/migrate-changes.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Hacky array field that makes sure data conforms to an array before being saved to source.
 * This is used to avoid making substantive changes to input handling in {@link ChangesSheetMixin}.
 * @todo Find a better way to handle this.
 */
class ChangesArrayField extends fields.ArrayField {
  _updateCommit(source, key, value, _diff, _options) {
    value = this._cast(value);
    return super._updateCommit(source, key, value, _diff, _options);
  }
}

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
      changes: new ChangesArrayField(qualifiedChangeField()),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    for (const c of data.changes || []) c.mode = v14MigrateChangeMode(c.mode);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  async getEditor() {
    const html = await TeriockTextEditor.renderTemplate(
      "teriock/sheets/shared/changes",
      {
        changesData: this.changes,
        changesPath: `${this.fieldPath}.${this.id}.changes`,
        editable: this.document.sheet.isEditable,
        fieldDefs: this.schema.fields.changes.element.fields,
        valuePath: `_source.${this.fieldPath}.${this.id}.changes`,
      },
    );
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
