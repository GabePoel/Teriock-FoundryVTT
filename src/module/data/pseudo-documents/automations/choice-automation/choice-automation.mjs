import { ChoiceSelector } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Prompts for one of its choices during execution and exposes its value as `@choice.<namespace>`.
 */
export default class ChoiceAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Choice"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "choice" });

  /** @inheritDoc */
  static defineSchema() {
    const prefix = "TERIOCK.AUTOMATIONS.Choice.FIELDS.choices.element";
    return Object.assign(super.defineSchema(), {
      choices: new fields.TypedObjectField(
        new fields.SchemaField({
          label: new fields.StringField({ label: `${prefix}.label.label` }),
          value: new fields.StringField({ hint: `${prefix}.value.hint`, label: `${prefix}.value.label` }),
        }),
      ),
      description: new fields.HTMLField(),
      name: new fields.StringField(),
      namespace: new IdentifierField(),
    });
  }

  /**
   * Choices are made before other automations interact.
   * @inheritDoc
   */
  get _executionPriority() {
    return -1;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["name", "namespace", "description", ...super._formPaths];
  }

  /** @inheritDoc */
  async getEditor(config = {}) {
    const editor = await super.getEditor(config);
    const html = await TeriockTextEditor.renderTemplate("teriock/ui/choices", {
      choices: Object.entries(this._source.choices).map(([id, c]) => ({ ...c, id })),
      editable: this.getNearestDocument()?.sheet?.isEditable,
      fields: this.schema.fields.choices.element.fields,
      path: `${this.localPath}.choices`,
      rootId: [config.rootId, this.localPath].filterJoin("-"),
      uuid: this.uuid,
    });
    editor.append(foundry.utils.parseHTML(html));
    return editor;
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    const entries = Object.entries(this.choices);
    if (!this.namespace || !entries.length) { return; }
    const choices = Object.fromEntries(entries.map(([id, c]) => [id, c.label]));
    const id = await ChoiceSelector.prompt(choices, {
      hintHtml: this.description,
      required: true,
      title: this.name || this.display.label || this.label,
    });
    if (!id) { return false; }
    execution.choices[this.namespace] = this.choices[id].value;
  }
}
