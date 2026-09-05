import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { TeriockActiveEffect } from "../../../../documents/_module.mjs";
import { qualifiedChangeField } from "../../../fields/tools/builders.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 */
export default class ChangesAutomation extends CritMechanicMixin(BaseAutomation) {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Changes.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { changes: true, type: "changes" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { changes: new fields.ArrayField(qualifiedChangeField()) });
  }

  /** @inheritDoc */
  getChanges() {
    return this.changes.map(c => ({
      ...c,
      priority: c.priority ?? TeriockActiveEffect.CHANGE_TYPES[c.type]?.defaultPriority ?? 0,
    }));
  }

  /** @inheritDoc */
  async getEditor(config = {}) {
    const html = await TeriockTextEditor.renderTemplate("teriock/sheets/shared/changes", {
      changesData: this._source.changes.map(c => ({
        ...c,
        defaultPriority: (TeriockActiveEffect.CHANGE_TYPES[c.type]?.defaultPriority ?? 0).toString(),
      })),
      changesPath: `${this.localPath}.changes`,
      editable: this.document?.sheet?.isEditable,
      fieldDefs: this.schema.fields.changes.element.fields,
      rootId: [config.rootId, this.localPath].filterJoin("-"),
      types: TeriockActiveEffect.CHANGE_TYPES,
      valuePath: `_source.${this.localPath}.changes`,
    });
    return /** @type {HTMLDivElement} */ foundry.utils.parseHTML(html);
  }
}
