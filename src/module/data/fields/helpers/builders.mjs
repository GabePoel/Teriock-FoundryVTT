import { competenceOptions } from "../../../constants/options/competence-options.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { objectMap, sortObject } from "../../../helpers/utils.mjs";
import {
  EnhancedNumberField,
  EnhancedStringField,
  FormulaField,
} from "../_module.mjs";

const {
  ArrayField,
  BooleanField,
  DocumentIdField,
  DocumentUUIDField,
  NumberField,
  SchemaField,
  SetField,
  StringField,
  FilePathField,
} = foundry.data.fields;

/**
 * Field for source portion of combat expiration.
 * @returns {StringField}
 */
export function combatExpirationSourceTypeField() {
  return new StringField({
    choices: localizeChoices(
      {
        target: "TERIOCK.SCHEMA.CombatExpiration.who.choices.target",
        executor: "TERIOCK.SCHEMA.CombatExpiration.who.choices.executor",
        everyone: "TERIOCK.SCHEMA.CombatExpiration.who.choices.everyone",
      },
      { sort: false },
    ),
    hint: "TERIOCK.SCHEMA.CombatExpiration.who.hint",
    initial: "target",
    label: "TERIOCK.SCHEMA.CombatExpiration.who.label",
  });
}

/**
 * Field for method portion of combat expiration.
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
        rolled: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.rolled",
        none: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.none",
      }),
      hint: _loc("TERIOCK.SCHEMA.CombatExpiration.what.type.hint"),
      initial: "none",
      label: _loc("TERIOCK.SCHEMA.CombatExpiration.what.type.label"),
    }),
  });
}

/**
 * Field for timing portion of combat expiration.
 * @returns {SchemaField}
 */
export function combatExpirationTimingField() {
  return new SchemaField({
    skip: new NumberField({
      hint: "TERIOCK.SCHEMA.CombatExpiration.when.skip.hint",
      initial: 0,
      label: "TERIOCK.SCHEMA.CombatExpiration.when.skip.label",
    }),
    time: new StringField({
      choices: localizeChoices({
        start: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.start",
        end: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.end",
      }),
      hint: "TERIOCK.SCHEMA.CombatExpiration.when.time.hint",
      initial: "start",
      label: "TERIOCK.SCHEMA.CombatExpiration.when.time.label",
    }),
    trigger: new StringField({
      choices: localizeChoices({
        turn: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.turn",
        combat: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.combat",
        action: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.action",
      }),
      hint: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.hint",
      initial: "turn",
      label: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.label",
    }),
  });
}

/**
 * A change type field.
 * @returns {EnhancedStringField}
 */
export function changeTypeField() {
  return new EnhancedStringField({
    choices: objectMap(ActiveEffect.CHANGE_TYPES, (t) => t.label, {
      localize: true,
    }),
    initial: "add",
    label: "TERIOCK.SCHEMA.QualifiedChange.type.label",
    required: false,
  });
}

/**
 * Field that represents an expanded change.
 * @returns {SchemaField}
 */
export function qualifiedChangeField() {
  const allTypes = {
    Actor: "TERIOCK.CHANGES.Targets.Actor",
    Item: "TERIOCK.CHANGES.Targets.Item",
    ActiveEffect: "TERIOCK.CHANGES.Targets.ActiveEffect",
    parent: "TERIOCK.CHANGES.Targets.parent",
  };
  const subTypes = {
    armament: "TERIOCK.CHANGES.Targets.armament",
  };
  Object.assign(subTypes, TERIOCK.system.documentTypes.actors);
  Object.assign(subTypes, TERIOCK.system.documentTypes.items);
  Object.assign(subTypes, TERIOCK.system.documentTypes.effects);
  Object.assign(allTypes, sortObject(subTypes));
  return new SchemaField({
    key: new EnhancedStringField({
      initial: "",
      label: "TERIOCK.SCHEMA.QualifiedChange.key.label",
    }),
    priority: new EnhancedNumberField({
      initial: 20,
      label: "TERIOCK.SCHEMA.QualifiedChange.priority.label",
    }),
    qualifier: new FormulaField({
      deterministic: true,
      initial: "1",
      label: "TERIOCK.SCHEMA.QualifiedChange.qualifier.label",
    }),
    target: new EnhancedStringField({
      choices: localizeChoices(allTypes),
      initial: "Actor",
      label: "TERIOCK.SCHEMA.QualifiedChange.target.label",
      nullable: false,
    }),
    phase: new EnhancedStringField({
      choices: objectMap(TERIOCK.options.change.phase, (p) => p.label, {
        localize: true,
      }),
      initial: "normal",
      label: "TERIOCK.SCHEMA.QualifiedChange.phase.label",
      nullable: false,
    }),
    type: changeTypeField(),
    value: new EnhancedStringField({
      initial: "",
      label: "TERIOCK.SCHEMA.QualifiedChange.value.label",
    }),
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
      icon: new StringField({ nullable: true, required: false, initial: null }),
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
      elements: new StringField({ nullable: true }),
      classes: new StringField({ initial: "" }),
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
      wrappers: new ArrayField(new StringField(), {
        initial: [],
        required: false,
      }),
    }),
    { initial: [], required: false },
  );
}

/**
 * A string that is usually null.
 * @returns {StringField}
 */
function nullString() {
  return new StringField({
    blank: true,
    initial: null,
    nullable: true,
    required: false,
  });
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
      uuid: new DocumentUUIDField({
        blank: true,
        initial: null,
        nullable: true,
      }),
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
  const { initial = "medium", child = "TERIOCK.SCHEMA.BlockSize.default" } =
    options;
  return new StringField({
    initial,
    choices: TERIOCK.options.display.sizes,
    label: _loc("TERIOCK.SCHEMA.BlockSize.label", { name: _loc(child) }),
    hint: _loc("TERIOCK.SCHEMA.BlockSize.hint", {
      name: _loc(child).toLocaleLowerCase(),
    }),
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
  const { initial = false, child = "TERIOCK.SCHEMA.BlackGapless.default" } =
    options;
  return new BooleanField({
    initial,
    label: _loc("TERIOCK.SCHEMA.BlackGapless.label", {
      name: _loc(child),
    }),
    hint: _loc("TERIOCK.SCHEMA.BlackGapless.hint", {
      name: _loc(child).toLocaleLowerCase(),
    }),
  });
}

/**
 * Competence field.
 * @returns {NumberField}
 */
export function competenceField() {
  return new NumberField({
    choices: localizeChoices(competenceOptions.levels, { sort: false }),
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
export function attributeField(options = { unp: false, nullable: true }) {
  return new StringField({
    choices: options.unp
      ? TERIOCK.reference.statAttributes
      : TERIOCK.reference.attributes,
    hint: _loc("TERIOCK.SCHEMA.Attribute.hint"),
    initial: options.nullable ? null : "int",
    label: _loc("TERIOCK.SCHEMA.Attribute.label"),
    nullable: options.nullable,
    required: false,
  });
}

/**
 * Conditions that must be absent and present.
 * @returns {SchemaField}
 */
export function conditionRequirementsField() {
  return new SchemaField({
    absent: new SetField(
      new StringField({ choices: TERIOCK.reference.conditions }),
    ),
    present: new SetField(
      new StringField({ choices: TERIOCK.reference.conditions }),
    ),
  });
}

/**
 * Field for a movement action.
 * @returns {StringField}
 */
export function movementActionField() {
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
        (t) => t.label,
      ),
    ),
    initial: "walk",
    nullable: false,
  });
}
