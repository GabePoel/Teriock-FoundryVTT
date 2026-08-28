import { FormulaField, IdentifierField } from "../_module.mjs";
import attributeConfig from "../../../constants/config/attribute-config.mjs";
import classConfig from "../../../constants/config/class-config.mjs";
import competenceConfig from "../../../constants/config/competence-config.mjs";
import dieConfig from "../../../constants/config/death-bag-config.mjs";
import tradecraftConfig from "../../../constants/config/tradecraft-config.mjs";
import { _sloc } from "../../../helpers/localization.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { toKebabCase } from "../../../helpers/string.mjs";
import { formatDynamicSelectOptions, objectMap } from "../../../helpers/utils.mjs";
import { DefenseModel } from "../../models/_module.mjs";

const {
  ArrayField,
  BooleanField,
  ColorField,
  DocumentUUIDField,
  EmbeddedDataField,
  FilePathField,
  HTMLField,
  JSONField,
  NumberField,
  SchemaField,
  SetField,
  StringField,
} = foundry.data.fields;

/**
 * @import { FormSelectOption } from "@client/applications/forms/fields.mjs";
 * @import { ArrayFieldOptions, DataFieldOptions, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * Tradecraft choices.
 * @returns {Record<string, FormSelectOption>}
 */
function getTradecraftChoices() {
  const RAW_TRADECRAFT_CHOICES = {};
  for (const [k, v] of Object.entries(tradecraftConfig.tradecrafts)) {
    const fieldKey = v.field;
    if (!RAW_TRADECRAFT_CHOICES[fieldKey]) {
      RAW_TRADECRAFT_CHOICES[fieldKey] = { choices: {}, label: _sloc(tradecraftConfig.fields[fieldKey].label) };
    }
    RAW_TRADECRAFT_CHOICES[fieldKey].choices[toKebabCase(k)] = _sloc(v.label);
  }
  return formatDynamicSelectOptions(RAW_TRADECRAFT_CHOICES);
}

/**
 * Class choices.
 * @returns {Record<string, FormSelectOption>}
 */
function getClassChoices() {
  const RAW_CLASS_CHOICES = {};
  for (const [k, v] of Object.entries(classConfig.classes)) {
    const archetypeKey = v.archetype;
    if (!RAW_CLASS_CHOICES[archetypeKey]) {
      RAW_CLASS_CHOICES[archetypeKey] = { choices: {}, label: _sloc(classConfig.archetypes[archetypeKey].label) };
    }
    RAW_CLASS_CHOICES[archetypeKey].choices[toKebabCase(k)] = _sloc(v.label);
  }
  return formatDynamicSelectOptions(RAW_CLASS_CHOICES);
}

/**
 * A change type field.
 * @param {Teriock.Changes.Type[]} [types] - Restricts the choices to this subset of change types.
 * @returns {StringField}
 */
export function changeTypeField(types = null) {
  const allowed = types
    ? Object.fromEntries(Object.entries(ActiveEffect.CHANGE_TYPES).filter(([k]) => types.includes(k)))
    : ActiveEffect.CHANGE_TYPES;
  return new StringField({
    choices: objectMap(allowed, t => t.label, { localize: true }),
    initial: types && !types.includes("add") ? types[0] : "add",
    label: "TERIOCK.SCHEMA.QualifiedChange.type.label",
    required: true,
  });
}

/**
 * Field that represents a qualified change.
 * @returns {SchemaField}
 */
export function qualifiedChangeField() {
  return new SchemaField({
    key: new StringField({ initial: "", label: "TERIOCK.SCHEMA.QualifiedChange.key.label" }),
    phase: new StringField({
      choices: objectMap(TERIOCK.config.change.phase, (p) => p.label, { localize: true, filter: p => p.visible }),
      initial: TERIOCK.config.change.defaultPhase,
      label: "TERIOCK.SCHEMA.QualifiedChange.phase.label",
      required: true,
    }),
    priority: new NumberField({
      blank: true,
      initial: null,
      label: "TERIOCK.SCHEMA.QualifiedChange.priority.label",
      nullable: true,
      required: false,
    }),
    target: new StringField({
      choices: objectMap(TERIOCK.config.change.parent.targets, (t) => t, { localize: true }),
      initial: "Actor",
      label: "TERIOCK.SCHEMA.QualifiedChange.target.label",
      nullable: false,
      required: true,
    }),
    type: changeTypeField(),
    value: new FormulaField({ deterministic: false, initial: "", label: "TERIOCK.COMMON.Value" }),
  });
}

/**
 * Field that represents panel associations.
 * @param {ArrayFieldOptions} [options]
 * @returns {ArrayField}
 */
export function associationsField(options = {}) {
  return new ArrayField(
    new SchemaField({
      cards: new ArrayField(
        new SchemaField({
          color: new ColorField({ blank: true, initial: null, nullable: true, required: false }),
          documentUuid: new DocumentUUIDField(),
          img: new FilePathField({ categories: ["IMAGE"], initial: systemPath("icons/documents/uncertainty.svg") }),
          name: new StringField(),
        }),
        { initial: [], required: false },
      ),
      icon: new StringField({ initial: null, nullable: true, required: false }),
      title: new StringField({ initial: "Associations", required: false }),
    }),
    { initial: [], required: false, ...options },
  );
}

/**
 * Field that represents panel blocks.
 * @param {ArrayFieldOptions} [options]
 * @returns {ArrayField}
 */
export function blocksField(options) {
  return new ArrayField(
    new SchemaField({
      classes: new ArrayField(new StringField(), { initial: [] }),
      gmOnly: new BooleanField(),
      text: new HTMLField({ blank: true, nullable: true }),
      title: new StringField(),
    }),
    { initial: [], required: false, ...options },
  );
}

/**
 * A string that is initially null.
 * @param {StringFieldOptions} options
 * @returns {StringField}
 */
export function nullString(options) {
  return new StringField({ blank: true, initial: null, nullable: true, required: false, ...options });
}

/**
 * A JSON field with an empty object.
 * @param {DataFieldOptions} [options]
 * @returns {JSONField}
 */
export function defaultJSONField(options = {}) {
  return new JSONField({ blank: true, initial: "{}", nullable: true, ...options });
}

/**
 * Competence field.
 * @param {NumberFieldOptions} [options]
 * @returns {NumberField}
 */
export function competenceField(options = {}) {
  return new NumberField({
    choices: objectMap(competenceConfig.levels, l => l.label, { localize: true, sort: false }),
    hint: _sloc("TERIOCK.SCHEMA.Competence.hint"),
    initial: 0,
    label: _sloc("TERIOCK.COMMON.Competence"),
    max: 2,
    min: 0,
    nullable: false,
    required: false,
    ...options,
  });
}

/**
 * Attribute field.
 * @param {StringFieldOptions} [options]
 * @param {boolean} [options.unp]
 * @param {boolean} [options.nullable]
 * @returns {StringField}
 */
export function attributeField(options = { nullable: true, unp: false }) {
  const { unp = false, ...rest } = options;
  const fieldOptions = {
    initial: options.nullable ? null : "int",
    nullable: options.nullable ?? true,
    required: false,
    ...rest,
  };
  const allowBlank = fieldOptions.blank || fieldOptions.nullable || !fieldOptions.required;
  return new StringField({
    ...fieldOptions,
    blank: allowBlank,
    choices: objectMap(attributeConfig, (v) => v.label, {
      localize: true,
      none: allowBlank,
      filter: (v) => unp || !v?.notImprovable,
    }),
  });
}

/**
 * Field for a movement action.
 * @param {StringFieldOptions} [options]
 * @returns {StringField}
 */
export function movementActionField(options = {}) {
  const fieldOptions = { initial: "walk", nullable: false, required: true, ...options };
  const allowBlank = fieldOptions.blank || fieldOptions.nullable || !fieldOptions.required;
  return new StringField({
    ...fieldOptions,
    choices: objectMap(
      Object.fromEntries(
        Object.entries(CONFIG.Token.movement.actions).filter(([_k, v]) => {
          if (typeof v.canSelect === "function") { return v.canSelect(); }
          else if (typeof v.canSelect === "boolean") { return v.canSelect; }
          return true;
        }),
      ),
      t => t.label,
      { localize: true, none: allowBlank },
    ),
  });
}

/**
 * Field for a rollable formula.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} options
 * @returns {FormulaField}
 */
export function rollableFormulaField(options = {}) {
  return new FormulaField({ deterministic: false, initial: "", nullable: false, placeholder: "0", ...options });
}

/**
 * Field for a qualifier formula.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
 * @return {FormulaField}
 */
export function qualifierField(options = {}) {
  return new FormulaField({
    blank: true,
    deterministic: true,
    initial: "",
    nullable: false,
    placeholder: "0",
    ...options,
  });
}

/**
 * Field for the number of a single color of stone in the death bag.
 * @param {Teriock.Keys.DeathBagStoneColor} color - Stone color key.
 * @param {number} number - Default number of stones of this color.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
 * @returns {FormulaField}
 */
function deathBagStoneField(color, number, options = {}) {
  return new FormulaField({
    deterministic: false,
    initial: `${number}`,
    label: _sloc("TERIOCK.TERMS.Stones.ofColor", { color: _sloc(`TERIOCK.TERMS.StoneColor.${color}`) }),
    nullable: false,
    ...options,
  });
}

/**
 * Schema fields for the death bag.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
 * @returns {Record<string, FormulaField | SchemaField>}
 */
export function deathBagSchema(options = {}) {
  return {
    pull: new FormulaField({
      deterministic: false,
      hint: "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.pull.hint",
      initial: "10",
      label: "TERIOCK.SYSTEMS.BaseActor.FIELDS.deathBag.pull.label",
      nullable: false,
      ...options,
    }),
    stones: new SchemaField(
      Object.fromEntries(
        Object.entries(dieConfig.stones).map(([color, c]) => [color, deathBagStoneField(color, c.number)]),
      ),
    ),
  };
}

/**
 * Field for a defense.
 * @param {DataFieldOptions} [options]
 * @returns {EmbeddedDataField}
 */
export function defenseField(options = {}) {
  return new EmbeddedDataField(DefenseModel, options);
}

/**
 * Field for selecting a tradecraft.
 * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
 * @returns {IdentifierField}
 */
export function tradecraftField(options = {}) {
  return new IdentifierField({
    choices: getTradecraftChoices(),
    initial: Object.keys(TERIOCK.reference.tradecrafts)[0],
    label: _sloc("TERIOCK.COMMON.Tradecraft"),
    nullable: false,
    type: "tradecraft",
    ...options,
  });
}

/**
 * Field for selecting multiple tradecrafts.
 * @param {ArrayFieldOptions} [options]
 * @returns {SetField}
 */
export function tradecraftsField(options = {}) {
  return new SetField(new StringField({ choices: getTradecraftChoices }), options);
}

/**
 * Field for selecting a field.
 * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
 * @returns {IdentifierField}
 */
export function fieldField(options = {}) {
  return new IdentifierField({
    choices: objectMap(tradecraftConfig.fields, f => f.label, { localize: true }),
    initial: Object.keys(tradecraftConfig.fields)[0],
    label: _sloc("TERIOCK.COMMON.Field"),
    nullable: false,
    type: "field",
    ...options,
  });
}

/**
 * Field for selecting a class.
 * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
 * @returns {IdentifierField}
 */
export function classField(options = {}) {
  return new IdentifierField({
    choices: getClassChoices(),
    initial: Object.keys(TERIOCK.reference.classes)[0],
    label: _sloc("TERIOCK.SYSTEMS.Rank.FIELDS.class.label"),
    nullable: false,
    type: "class",
    ...options,
  });
}

/**
 * Field for selecting an archetype.
 * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
 * @returns {IdentifierField}
 */
export function archetypeField(options = {}) {
  return new IdentifierField({
    choices: objectMap(classConfig.archetypes, a => a.label, { localize: true }),
    initial: Object.keys(classConfig.archetypes)[0],
    label: _sloc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
    nullable: false,
    type: "archetype",
    ...options,
  });
}
