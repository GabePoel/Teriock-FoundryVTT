import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { qualifiedChangeField } from "../../fields/helpers/builders.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

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
  static migrateData(data) {
    if (data.changes) {
      const keep = [];
      for (const c of data.changes) {
        if (!c.key) {
          keep.push(c);
          continue;
        }
        if (c.key.startsWith("system.adept.enabled")) continue;
        if (c.key.startsWith("system.gifted.enabled")) continue;
        if (c.key.startsWith("system.adept.amount")) {
          c.key = c.key.replace(
            "system.adept.amount",
            "system.costs.tweaks.adept",
          );
        }
        if (c.key.startsWith("system.gifted.amount")) {
          c.key = c.key.replace(
            "system.gifted.amount",
            "system.costs.tweaks.gifted",
          );
        }
        keep.push(c);
      }
      data.changes = keep;
    }
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
