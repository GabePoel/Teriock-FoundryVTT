import { ChoiceSelector } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { choicesWithNone } from "../../../../helpers/localization.mjs";
import { mergeMetadata, objectMap } from "../../../../utils/_module.mjs";
import { FormulaField, IdentifierField } from "../../../fields/_module.mjs";
import { categorySuggestions } from "../../../fields/tools/suggestions.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Prompts for a value during execution and exposes it as `@choice.<namespace>`. The value is either one of its choices,
 * a number, or a formula.
 */
export default class ChoicesAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Choices"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { ability: true }, type: "choices" });

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
      choiceType: new fields.StringField({
        blank: false,
        choices: {
          formula: _loc("TERIOCK.AUTOMATIONS.Choices.TYPES.formula"),
          number: _loc("TERIOCK.AUTOMATIONS.Choices.TYPES.number"),
          select: _loc("TERIOCK.AUTOMATIONS.Choices.TYPES.select"),
        },
        initial: "select",
        required: true,
      }),
      description: new fields.HTMLField(),
      initialFormula: new FormulaField({ deterministic: false, placeholder: "0" }),
      initialNumber: new fields.NumberField({ initial: null, nullable: true, placeholder: "0" }),
      integer: new fields.BooleanField({ initial: true }),
      max: new fields.NumberField({ initial: null, nullable: true, placeholder: `+ ${TERIOCK.CONST.INF_CODE}` }),
      min: new fields.NumberField({ initial: null, nullable: true, placeholder: `\uF068 ${TERIOCK.CONST.INF_CODE}` }),
      name: new fields.StringField(),
      namespace: new IdentifierField(),
      preset: new fields.StringField({
        blank: true,
        initial: "",
        choices: () =>
          objectMap(TERIOCK.CONFIG.category, c => c.label, { none: true, filter: c => c.suggestions !== "none" }),
      }),
    });
  }

  /** @inheritDoc */
  static validateJoint(data) {
    super.validateJoint(data);
    if (Number.isFinite(data.min) && Number.isFinite(data.max) && data.min > data.max) {
      throw new Error(_loc("TERIOCK.AUTOMATIONS.Choices.ERRORS.minAboveMax"));
    }
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
    const paths = ["name", "namespace", "description", "hr", "choiceType"];
    if (this.choiceType === "select") { paths.push("preset", "allowNone"); }
    if (this.choiceType === "number") { paths.push("min", "max", "initialNumber", "integer"); }
    if (this.choiceType === "formula") { paths.push("initialFormula"); }
    return [...paths, ...super._formPaths];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (["max", "min"].includes(path)) { inputConfig.classes = "placeholder-fa-solid"; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /** @inheritDoc */
  async getEditor(config = {}) {
    const editor = await super.getEditor(config);
    if (this.preset || this.choiceType !== "select") { return editor; }
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
    if (!this.namespace) { return; }
    const options = { hintHtml: this.description, title: this.name || this.display.label || this.label };
    if (this.choiceType !== "select") {
      const label = _loc("TERIOCK.AUTOMATIONS.Choices.FIELDS.choices.element.value.label");
      const field = this.choiceType === "number"
        ? new fields.NumberField({
          initial: Math.clamp(this.initialNumber ?? 0, this.min ?? -Infinity, this.max ?? Infinity),
          integer: this.integer,
          label,
          max: this.max ?? undefined,
          min: this.min ?? undefined,
        })
        : new FormulaField({ deterministic: false, initial: this.initialFormula, label });
      const value = await ChoiceSelector.prompt(null, { ...options, field });
      if (value === null) { return false; }
      let choice = field.clean(value);
      if (this.choiceType === "formula" && choice) {
        choice = `(${BaseRoll.replaceFormulaData(choice, execution.getRollData())})`;
      }
      execution.choices[this.namespace] = choice;
      return;
    }
    const choices = this.preset ? categorySuggestions(this.preset) : objectMap(this.choices, c => c.label);
    if (foundry.utils.isEmpty(choices)) { return; }
    const id = await ChoiceSelector.prompt(this.allowNone ? choicesWithNone(choices) : choices, {
      ...options,
      initial: Object.keys(choices)[0],
      required: true,
    });
    if (id === null) { return false; }
    execution.choices[this.namespace] = this.preset || !id ? id : this.choices[id].value;
  }
}
