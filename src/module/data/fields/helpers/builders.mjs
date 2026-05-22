import { EnhancedNumberField, EnhancedStringField, EvaluationField, FormulaField } from "../_module.mjs";
import { competenceConfig } from "../../../constants/config/competence-config.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { DefenseModel } from "../../models/_module.mjs";

const {
  ArrayField,
  BooleanField,
  DocumentIdField,
  DocumentUUIDField,
  FilePathField,
  JSONField,
  NumberField,
  SchemaField,
  SetField,
  StringField,
} = foundry.data.fields;

/**
 * Field for source portion of combat expiration.
 * @returns {StringField}
 */
export function combatExpirationSourceTypeField() {
  return new StringField({
    choices: localizeChoices({
      everyone: "TERIOCK.SCHEMA.CombatExpiration.who.choices.everyone",
      executor: "TERIOCK.SCHEMA.CombatExpiration.who.choices.executor",
      target: "TERIOCK.SCHEMA.CombatExpiration.who.choices.target",
    }, { sort: false }),
    hint: _loc("TERIOCK.SCHEMA.CombatExpiration.who.hint"),
    initial: "target",
    label: _loc("TERIOCK.SCHEMA.CombatExpiration.who.label"),
    required: true,
  });
}

/**
 * Field for method of combat expiration.
 * @returns {SchemaField} Timing field.
 */
export function combatExpirationMethodField() {
  return new SchemaField({
    roll: new StringField({
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.what.roll.hint"),
      initial: "2d4kh1",
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.what.roll.label"),
    }),
    threshold: new NumberField({
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.what.threshold.hint"),
      initial: 4,
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.what.threshold.label"),
    }),
    type: new StringField({
      choices: localizeChoices({
        forced: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.forced",
        none: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.none",
        rolled: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.rolled",
      }),
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.what.type.hint"),
      initial: "none",
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.what.type.label"),
      required: true,
    }),
  });
}

/**
 * Field for timing of combat expiration.
 * @returns {SchemaField}
 */
export function combatExpirationTimingField() {
  return new SchemaField({
    skip: new NumberField({
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.skip.hint"),
      initial: 0,
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.skip.label"),
    }),
    time: new StringField({
      choices: localizeChoices({
        end: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.end",
        start: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.start",
      }),
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.time.hint"),
      initial: "start",
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.time.label"),
      required: true,
    }),
    trigger: new StringField({
      choices: localizeChoices({
        action: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.action",
        combat: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.combat",
        turn: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.turn",
      }),
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.trigger.hint"),
      initial: "turn",
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.trigger.label"),
      required: true,
    }),
  });
}

/**
 * A change type field.
 * @returns {EnhancedStringField}
 */
export function changeTypeField() {
  return new EnhancedStringField({
    choices: objectMap(ActiveEffect.CHANGE_TYPES, t => t.label, { localize: true }),
    initial: "add",
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
    key: new EnhancedStringField({ initial: "", label: "TERIOCK.SCHEMA.QualifiedChange.key.label" }),
    priority: new EnhancedNumberField({ initial: 20, label: "TERIOCK.SCHEMA.QualifiedChange.priority.label" }),
    target: new EnhancedStringField({
      choices: localizeChoices(TERIOCK.config.change.parent.targets),
      initial: "Actor",
      label: "TERIOCK.SCHEMA.QualifiedChange.target.label",
      nullable: false,
      required: true,
    }),
    type: changeTypeField(),
    value: new FormulaField({ deterministic: false, initial: "", label: "TERIOCK.SCHEMA.QualifiedChange.value.label" }),
  });
}

/**
 * Field that represents panel associations.
 * @returns {ArrayField}
 */
export function associationsField() {
  return new ArrayField(
    new SchemaField({
      cards: new ArrayField(
        new SchemaField({
          color: new StringField({ nullable: true, required: false }),
          draggable: new BooleanField(),
          id: new DocumentIdField(),
          img: new FilePathField({ categories: ["IMAGE"] }),
          makeTooltip: new BooleanField({ initial: false, required: false }),
          name: new StringField(),
          rescale: new BooleanField({ initial: false, required: false }),
          type: new StringField({ initial: "base", required: false }),
          uuid: new DocumentUUIDField(),
        }),
        { initial: [], required: false },
      ),
      icon: new StringField({ initial: null, nullable: true, required: false }),
      title: new StringField({ initial: "Associations", required: false }),
    }),
    { initial: [], required: false },
  );
}

/**
 * Field that represents panel blocks.
 * @returns {ArrayField}
 */
export function blocksField() {
  return new ArrayField(
    new SchemaField({
      classes: new StringField({ initial: "" }),
      elements: new StringField({ nullable: true }),
      italic: new BooleanField({ initial: false, required: false }),
      special: new StringField({ nullable: true }),
      text: new StringField({ blank: true, nullable: true }),
      title: new StringField(),
    }),
  );
}

/**
 * Field that represents panel bars.
 * @returns {ArrayField}
 */
export function barsField() {
  return new ArrayField(
    new SchemaField({
      icon: new StringField({ initial: "", required: false }),
      label: new StringField({ blank: true, nullable: true, required: false }),
      wrappers: new ArrayField(new StringField(), { initial: [], required: false }),
    }),
    { initial: [], required: false },
  );
}

/**
 * A string that is usually null.
 * @returns {StringField}
 */
function nullString() {
  return new StringField({ blank: true, initial: null, nullable: true, required: false });
}

/**
 * A JSON field with an empty object.
 * @returns {JSONField}
 */
export function defaultJSONField() {
  return new JSONField({ blank: true, initial: "{}", nullable: true });
}

/**
 * Field that represents panels.
 * @returns {ArrayField}
 */
export function panelsField() {
  return new ArrayField(
    new SchemaField({
      associations: associationsField(),
      bars: barsField(),
      blocks: blocksField(),
      classes: nullString(),
      color: nullString(),
      font: nullString(),
      icon: nullString(),
      image: nullString(),
      label: nullString(),
      name: nullString(),
      uuid: new DocumentUUIDField({ blank: true, initial: null, nullable: true }),
    }),
    { initial: [], required: false },
  );
}

/**
 * Field that sets block sizes.
 * @param {object} [options]
 * @param {Teriock.Keys.CardDisplaySize} [options.initial]
 * @param {string} [options.child]
 * @returns {StringField}
 */
export function blockSizeField(options = {}) {
  const { child = "TERIOCK.SCHEMA.BlockSize.default", initial = "medium" } = options;
  return new StringField({
    choices: TERIOCK.config.display.sizes,
    hint: _loc("TERIOCK.SCHEMA.BlockSize.hint", { name: _loc(child).toLocaleLowerCase() }),
    initial,
    label: _loc("TERIOCK.SCHEMA.BlockSize.label", { name: _loc(child) }),
  });
}

/**
 * Field that sets block gaps.
 * @param {object} [options]
 * @param {boolean} [options.initial]
 * @param {string} [options.child]
 * @returns {BooleanField}
 */
export function blockGaplessField(options = {}) {
  const { child = "TERIOCK.SCHEMA.BlackGapless.default", initial = false } = options;
  return new BooleanField({
    hint: _loc("TERIOCK.SCHEMA.BlackGapless.hint", { name: _loc(child).toLocaleLowerCase() }),
    initial,
    label: _loc("TERIOCK.SCHEMA.BlackGapless.label", { name: _loc(child) }),
  });
}

/**
 * Competence field.
 * @returns {NumberField}
 */
export function competenceField() {
  return new NumberField({
    choices: objectMap(competenceConfig.levels, l => l.label, { localize: true, sort: false }),
    hint: _loc("TERIOCK.SCHEMA.Competence.hint"),
    initial: 0,
    label: _loc("TERIOCK.SCHEMA.Competence.label"),
    max: 2,
    min: 0,
    nullable: false,
    required: false,
  });
}

/**
 * Attribute field.
 * @param {object} [options]
 * @param {boolean} [options.unp]
 * @param {boolean} [options.nullable]
 * @returns {StringField}
 */
export function attributeField(options = { nullable: true, unp: false }) {
  return new StringField({
    choices: options.unp ? TERIOCK.reference.attributes : TERIOCK.reference.statAttributes,
    initial: options.nullable ? null : "int",
    nullable: options.nullable ?? true,
    required: false,
  });
}

/**
 * Conditions that must be absent and present.
 * @returns {SchemaField}
 */
export function conditionRequirementsField() {
  return new SchemaField({
    absent: new SetField(new StringField({ choices: TERIOCK.reference.conditions })),
    present: new SetField(new StringField({ choices: TERIOCK.reference.conditions })),
  });
}

/**
 * Field for a movement action.
 * @param {StringFieldOptions} [options]
 * @returns {StringField}
 */
export function movementActionField(options = {}) {
  return new StringField({
    choices: localizeChoices(
      objectMap(
        Object.fromEntries(
          Object.entries(CONFIG.Token.movement.actions).filter(([_k, v]) => {
            if (typeof v.canSelect === "function") return v.canSelect();
            else if (typeof v.canSelect === "boolean") return v.canSelect;
            else return true;
          }),
        ),
        t => t.label,
      ),
    ),
    initial: "walk",
    nullable: false,
    required: true,
    ...options,
  });
}

/**
 * Field for a rollable formula.
 * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} options
 * @returns {FormulaField}
 */
export function rollableFormulaField(options = {}) {
  return new FormulaField({ deterministic: false, initial: "0", nullable: false, ...options });
}

/**
 * Field for a defense.
 * @param {StringFieldOptions & Teriock.Fields._EvaluationFieldOptions} [options]
 * @returns {EvaluationField}
 */
export function defenseField(options = {}) {
  return new EvaluationField({ deterministic: true, floor: true, min: 0, model: DefenseModel, ...options });
}
