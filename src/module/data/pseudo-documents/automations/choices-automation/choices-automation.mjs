import { ChoiceSelector } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { choicesWithNone } from "../../../../helpers/localization.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { categorySuggestions } from "../../../fields/tools/suggestions.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Prompts for one of its choices during execution and exposes its value as `@choice.<namespace>`.
 */
export default class ChoicesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Choices"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "choices" });

  /** @inheritDoc */
  static defineSchema() {
    const prefix = "TERIOCK.AUTOMATIONS.Choices.FIELDS.choices.element";
    return Object.assign(super.defineSchema(), {
      allowNone: new fields.BooleanField({ initial: true }),
      choices: new fields.TypedObjectField(
        new fields.SchemaField({
          label: new fields.StringField({ label: `${prefix}.label.label` }),
          value: new fields.StringField({ hint: `${prefix}.value.hint`, label: `${prefix}.value.label` }),
        }),
      ),
      description: new fields.HTMLField(),
      name: new fields.StringField(),
      namespace: new IdentifierField(),
      preset: new fields.StringField({
        blank: true,
        initial: "",
        choices: () =>
          objectMap(TERIOCK.config.category, c => c.label, { none: true, filter: c => c.suggestions !== "none" }),
      }),
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
    return ["name", "namespace", "description", "preset", "allowNone", ...super._formPaths];
  }

  /** @inheritDoc */
  async getEditor(config = {}) {
    const editor = await super.getEditor(config);
    if (this.preset) { return editor; }
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
    const choices = this.preset ? categorySuggestions(this.preset) : objectMap(this.choices, c => c.label);
    if (!this.namespace || foundry.utils.isEmpty(choices)) { return; }
    const id = await ChoiceSelector.prompt(this.allowNone ? choicesWithNone(choices) : choices, {
      hintHtml: this.description,
      initial: Object.keys(choices)[0],
      required: true,
      title: this.name || this.display.label || this.label,
    });
    if (id === null) { return false; }
    execution.choices[this.namespace] = this.preset || !id ? id : this.choices[id].value;
  }
}
