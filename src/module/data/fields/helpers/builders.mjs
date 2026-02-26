import { abilityOptions } from "../../../constants/options/ability-options.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { sortObject } from "../../../helpers/utils.mjs";
import {
  EnhancedNumberField,
  EnhancedStringField,
  EvaluationField,
  FormulaField,
  TextField,
} from "../_module.mjs";
import { arrayTypeValidator, typeValidator } from "./validators.mjs";

const {
  ArrayField,
  BooleanField,
  DocumentIdField,
  DocumentUUIDField,
  FilePathField,
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
 * Field for a transformation.
 * @param {object} [options]
 * @param {boolean} [options.implementation] - Make this into an implementation.
 * @param {boolean} [options.configuration] - Make this into a configuration.
 * @param {boolean} [options.alwaysEnabled] - Do not include an enabled key.
 * @returns {SchemaField}
 */
export function transformationField(options = {}) {
  const { implementation = false, configuration = false } = options;
  const schema = {
    enabled: new BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.enabled.hint",
      initial: false,
      label: "TERIOCK.SCHEMA.Transformation.enabled.label",
      nullable: false,
      required: false,
    }),
    image: new FilePathField({
      categories: ["IMAGE"],
      hint: "TERIOCK.SCHEMA.Transformation.image.hint",
      initial: null,
      label: "TERIOCK.SCHEMA.Transformation.image.label",
      nullable: true,
      required: false,
      trim: true,
    }),
    level: new StringField({
      choices: TERIOCK.options.effect.transformationLevel,
      hint: "TERIOCK.SCHEMA.Transformation.level.hint",
      initial: "minor",
      label: "TERIOCK.SCHEMA.Transformation.level.label",
      nullable: false,
      required: false,
    }),
    multiple: new BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.multiple.hint",
      initial: false,
      label: "TERIOCK.SCHEMA.Transformation.multiple.label",
      nullable: false,
      required: false,
    }),
    resetHp: new BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.resetHp.hint",
      label: "TERIOCK.SCHEMA.Transformation.resetHp.label",
      initial: true,
      required: false,
      nullable: false,
    }),
    resetMp: new BooleanField({
      hint: "TERIOCK.SCHEMA.Transformation.resetMp.hint",
      label: "TERIOCK.SCHEMA.Transformation.resetMp.label",
      initial: false,
      required: false,
      nullable: false,
    }),
    suppression: new SchemaField({
      bodyParts: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.suppression.bodyParts.hint",
        initial: true,
        label: "TERIOCK.SCHEMA.Transformation.suppression.bodyParts.label",
        nullable: false,
        required: false,
      }),
      equipment: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.suppression.equipment.hint",
        initial: true,
        label: "TERIOCK.SCHEMA.Transformation.suppression.equipment.label",
        nullable: false,
        required: false,
      }),
      fluencies: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.suppression.fluencies.hint",
        initial: true,
        label: "TERIOCK.SCHEMA.Transformation.suppression.fluencies.label",
        nullable: false,
        required: false,
      }),
      ranks: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.suppression.ranks.hint",
        initial: true,
        label: "TERIOCK.SCHEMA.Transformation.suppression.ranks.label",
        nullable: false,
        required: false,
      }),
    }),
    uuids: new SetField(
      new DocumentUUIDField({
        hint: "TERIOCK.SCHEMA.Transformation.uuids.itemHint",
        nullable: false,
        type: "Item",
        validate: (uuid) => typeValidator(uuid, ["species"]),
      }),
      {
        hint: "TERIOCK.SCHEMA.Transformation.uuids.hint",
        initial: [],
        label: "TERIOCK.SCHEMA.Transformation.uuids.label",
        nullable: false,
        required: false,
        validate: (uuids) => arrayTypeValidator(uuids, ["species"]),
        validationError: game.i18n.localize(
          "TERIOCK.SCHEMA.Transformation.uuids.validationError",
        ),
      },
    ),
  };
  if (implementation) {
    schema.species = new ArrayField(new DocumentIdField());
  }
  if (configuration) {
    Object.assign(schema, {
      select: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.select.hint",
        label: "TERIOCK.SCHEMA.Transformation.select.label",
        nullable: false,
        required: false,
        initial: false,
      }),
      useFolder: new BooleanField({
        hint: "TERIOCK.SCHEMA.Transformation.useFolder.hint",
        label: "TERIOCK.SCHEMA.Transformation.useFolder.label",
        nullable: false,
        required: false,
        initial: false,
      }),
      uuid: new DocumentUUIDField({
        hint: "TERIOCK.SCHEMA.Transformation.folder.hint",
        label: "TERIOCK.SCHEMA.Transformation.folder.label",
        nullable: true,
        required: false,
        type: "Folder",
      }),
    });
  }
  if (options.alwaysEnabled) delete schema.enabled;
  return new SchemaField(schema);
}

/**
 * Field for method portion of combat expiration.
 * @returns {SchemaField} Timing field.
 */
export function combatExpirationMethodField() {
  return new SchemaField({
    roll: new StringField({
      hint: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.roll.hint",
      ),
      initial: "2d4kh1",
      label: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.roll.label",
      ),
    }),
    threshold: new NumberField({
      hint: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.threshold.hint",
      ),
      initial: 4,
      label: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.threshold.label",
      ),
    }),
    type: new StringField({
      choices: localizeChoices({
        forced: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.forced",
        rolled: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.forced",
        none: "TERIOCK.SCHEMA.CombatExpiration.what.type.choices.none",
      }),
      hint: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.type.hint",
      ),
      initial: "none",
      label: game.i18n.localize(
        "TERIOCK.SCHEMA.CombatExpiration.what.type.label",
      ),
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
    mode: new EnhancedNumberField({
      choices: TERIOCK.options.effect.changeMode,
      initial: 4,
      label: "TERIOCK.SCHEMA.QualifiedChange.mode.label",
    }),
    priority: new EnhancedNumberField({
      initial: 20,
      label: "TERIOCK.SCHEMA.QualifiedChange.priority.label",
    }),
    time: new EnhancedStringField({
      choices: TERIOCK.options.change.timeLabels,
      initial: "normal",
      label: "TERIOCK.SCHEMA.QualifiedChange.time.label",
      nullable: false,
    }),
    target: new EnhancedStringField({
      choices: localizeChoices(allTypes),
      initial: "Actor",
      label: "TERIOCK.SCHEMA.QualifiedChange.target.label",
      nullable: false,
    }),
    value: new EnhancedStringField({
      initial: "",
      label: "TERIOCK.SCHEMA.QualifiedChange.value.label",
    }),
    qualifier: new FormulaField({
      deterministic: true,
      initial: "1",
      label: "TERIOCK.SCHEMA.QualifiedChange.qualifier.label",
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
          color: new StringField({
            nullable: true,
            required: false,
          }),
          id: new DocumentIdField(),
          img: new StringField(),
          makeTooltip: new BooleanField({
            initial: false,
            required: false,
          }),
          name: new StringField(),
          rescale: new BooleanField({
            initial: false,
            required: false,
          }),
          type: new StringField({
            initial: "base",
            required: false,
          }),
          uuid: new DocumentUUIDField(),
        }),
        {
          initial: [],
          required: false,
        },
      ),
      icon: new StringField({
        nullable: true,
        required: false,
        initial: null,
      }),
      title: new StringField({
        initial: "Associations",
        required: false,
      }),
    }),
    {
      initial: [],
      required: false,
    },
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
      italic: new BooleanField({
        initial: false,
        required: false,
      }),
      special: new StringField({ nullable: true }),
      text: new StringField({ nullable: true }),
      title: new StringField(),
    }),
  );
}

/**
 * Field that sets block sizes.
 * @param {object} [options]
 * @param {Teriock.Parameters.Shared.CardDisplaySize} [options.initial]
 * @param {string} [options.label]
 * @returns {StringField}
 */
export function blockSizeField(options = {}) {
  const {
    initial = "medium",
    label = game.i18n.localize("TERIOCK.SCHEMA.BlockSize.default"),
  } = options;
  return new StringField({
    initial,
    choices: TERIOCK.options.display.sizes,
    label: game.i18n.format("TERIOCK.SCHEMA.BlockSize.label", { name: label }),
    hint: game.i18n.format("TERIOCK.SCHEMA.BlockSize.hint", {
      name: label.toLocaleLowerCase(),
    }),
  });
}

/**
 * Field that sets block gaps.
 * @param {object} [options]
 * @param {boolean} [options.initial]
 * @param {string} [options.label]
 * @returns {BooleanField}
 */
export function blockGaplessField(options = {}) {
  const {
    initial = false,
    label = game.i18n.localize("TERIOCK.SCHEMA.BlackGapless.default"),
  } = options;
  return new BooleanField({
    initial,
    label: game.i18n.format("TERIOCK.SCHEMA.BlackGapless.label", {
      name: label,
    }),
    hint: game.i18n.format("TERIOCK.SCHEMA.BlackGapless.hint", {
      name: label.toLocaleLowerCase(),
    }),
  });
}

/**
 * Build a cost adjustment.
 * @returns {SchemaField}
 */
export function costAdjustment() {
  return new SchemaField({
    enabled: new BooleanField(),
    amount: new NumberField({
      initial: 0,
      min: 0,
      integer: true,
    }),
  });
}

/**
 * Build a cost schema.
 * @param {object} [options]
 * @param {Record<string, string>} [options.extraChoices]
 * @returns {SchemaField}
 */
export function costField(options = { extraChoices: {} }) {
  return new SchemaField({
    type: new StringField({
      initial: "none",
      choices: {
        ...abilityOptions.cost,
        ...options.extraChoices,
      },
    }),
    value: new SchemaField({
      static: new NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      formula: new FormulaField({
        initial: "",
        deterministic: false,
      }),
      variable: new TextField({
        initial: "",
      }),
    }),
  });
}

/**
 * Competence field.
 * @returns {NumberField}
 */
export function competenceField() {
  return new NumberField({
    choices: localizeChoices(
      {
        0: "TERIOCK.SCHEMA.Competence.choices.0",
        1: "TERIOCK.SCHEMA.Competence.choices.1",
        2: "TERIOCK.SCHEMA.Competence.choices.2",
      },
      { sort: false },
    ),
    hint: game.i18n.localize("TERIOCK.SCHEMA.Competence.hint"),
    initial: 0,
    label: game.i18n.localize("TERIOCK.SCHEMA.Competence.label"),
    max: 2,
    min: 0,
    nullable: false,
    required: false,
  });
}

/**
 * Damage field.
 * @param {boolean} [twoHanded]
 * @returns {SchemaField}
 */
export function damageField(twoHanded = false) {
  const schema = {
    base: new EvaluationField({
      deterministic: false,
      model: teriock.data.models.DamageModel,
    }),
    types: new SetField(new StringField()),
  };
  if (twoHanded) {
    schema.twoHanded = new EvaluationField({
      deterministic: false,
      model: teriock.data.models.DamageModel,
    });
  }
  return new SchemaField(schema);
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
    hint: game.i18n.localize("TERIOCK.SCHEMA.Attribute.hint"),
    initial: options.nullable ? null : "int",
    label: game.i18n.localize("TERIOCK.SCHEMA.Attribute.label"),
    nullable: options.nullable,
    required: false,
  });
}
