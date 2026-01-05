import { sortObject } from "../../../helpers/utils.mjs";
import {
  EnhancedNumberField,
  EnhancedStringField,
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
    choices: {
      target: "Target",
      executor: "Executor",
      everyone: "Everyone",
    },
    hint: "Whose turn should this effect attempt to expire on?",
    initial: "target",
    label: "Who",
  });
}

/**
 * Field for a transformation.
 * @param {object} [options]
 * @param {boolean} [options.implementation] - Make this into an implementation.
 * @param {boolean} [options.configuration] - Make this into a configuration.
 * @returns {SchemaField}
 */
export function transformationField(options = {}) {
  const { implementation = false, configuration = false } = options;
  const schema = {
    enabled: new BooleanField({
      hint:
        'Whether this ability causes a transformation. Note that this isn\'t just for "transformation effect",' +
        " but for any case in which another species' stats should be applied (such as animating as an undead).",
      initial: false,
      label: "Causes Transformation",
      nullable: false,
      required: false,
    }),
    image: new FilePathField({
      categories: ["IMAGE"],
      hint: "Optional overriding art to apply to the target.",
      initial: null,
      label: "Token Art",
      nullable: true,
      required: false,
      trim: true,
    }),
    level: new StringField({
      choices: TERIOCK.options.effect.transformationLevel,
      hint: "How strong of a transformation this is.",
      initial: "minor",
      label: "Transformation Level",
      nullable: false,
      required: false,
    }),
    suppression: new SchemaField({
      bodyParts: new BooleanField({
        hint: "Whether this should suppress body parts not provided by the transformation.",
        initial: true,
        label: "Suppress Body Parts",
        nullable: false,
        required: false,
      }),
      equipment: new BooleanField({
        hint: "Whether this should suppress equipment not provided by the transformation.",
        initial: true,
        label: "Suppress Equipment",
        nullable: false,
        required: false,
      }),
      fluencies: new BooleanField({
        hint: "Whether this should suppress fluencies not provided by the transformation.",
        initial: true,
        label: "Suppress Fluencies",
        nullable: false,
        required: false,
      }),
      ranks: new BooleanField({
        hint: "Whether this should suppress ranks not provided by the transformation.",
        initial: true,
        label: "Suppress Ranks",
        nullable: false,
        required: false,
      }),
    }),
    uuids: new SetField(
      new DocumentUUIDField({
        hint: "A specific species this transforms the target into.",
        nullable: false,
        type: "Item",
        validate: (uuid) => typeValidator(uuid, ["species"]),
      }),
      {
        hint: "The species this transforms the target into.",
        initial: [],
        label: "Species",
        nullable: false,
        required: false,
        validate: (uuids) => arrayTypeValidator(uuids, ["species"]),
        validationError: "Only species can be transformed into.",
      },
    ),
    multiple: new BooleanField({
      hint: "Allow selection of multiple species to transform into at the same time.",
      initial: false,
      label: "Multiple Selection",
      nullable: false,
      required: false,
    }),
    resetHp: new BooleanField({
      hint: "Reset HP upon transformation.",
      label: "Reset HP",
      initial: true,
      required: false,
      nullable: false,
    }),
    resetMp: new BooleanField({
      hint: "Reset MP upon transformation.",
      label: "Reset MP",
      initial: false,
      required: false,
      nullable: false,
    }),
  };
  if (implementation) {
    schema.species = new ArrayField(new DocumentIdField());
  }
  if (configuration) {
    Object.assign(schema, {
      select: new BooleanField({
        hint: "Select a subset of the species to turn into instead of all of them.",
        label: "Select",
        nullable: false,
        required: false,
        initial: false,
      }),
      useFolder: new BooleanField({
        hint: "Use a folder of species instead of defining each individually.",
        label: "Use Folder",
        nullable: false,
        required: false,
        initial: false,
      }),
      uuid: new DocumentUUIDField({
        hint: "The folder of candidate species to transform into.",
        label: "Folder",
        nullable: true,
        required: false,
        type: "Folder",
      }),
    });
  }
  return new SchemaField(schema);
}

/**
 * Field for method portion of combat expiration.
 * @returns {SchemaField} Timing field.
 */
export function combatExpirationMethodField() {
  return new SchemaField({
    roll: new StringField({
      hint: "If this expires on a roll, what is the roll that needs to be made?",
      initial: "2d4kh1",
      label: "Roll",
    }),
    threshold: new NumberField({
      hint: "What is the minimum value that needs to be rolled in order for this to expire?",
      initial: 4,
      label: "Threshold",
    }),
    type: new StringField({
      choices: {
        forced: "Expires Automatically",
        rolled: "Expires on Roll",
        none: "Does not Expire on Turn",
      },
      hint: "What is the type of thing that causes this to expire?",
      initial: "none",
      label: "What",
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
      hint: "A number of instances of the trigger firing to skip before this effect expires.",
      initial: 0,
      label: "Skip",
    }),
    time: new StringField({
      choices: {
        start: "Start",
        end: "End",
      },
      hint: "What is the timing for the trigger of this effect expiring?",
      initial: "start",
      label: "When",
    }),
    trigger: new StringField({
      choices: {
        turn: "Turn",
        combat: "Combat",
        action: "Action",
      },
      hint: "What is the trigger for this effect expiring?",
      initial: "turn",
      label: "Trigger",
    }),
  });
}

/**
 * Field that represents an expanded change.
 * @returns {SchemaField}
 */
export function qualifiedChangeField() {
  const allTypes = {
    Actor: "Actors",
    Item: "Items",
    ActiveEffect: "Active Effects",
    parent: "Parent",
  };
  const subTypes = {
    armament: "Armaments",
  };
  for (const v of Object.values(TERIOCK.system.documentTypes)) {
    Object.assign(subTypes, v);
  }
  Object.assign(allTypes, sortObject(subTypes));
  return new SchemaField({
    key: new EnhancedStringField({ initial: "", label: "Key" }),
    mode: new EnhancedNumberField({
      choices: TERIOCK.options.effect.changeMode,
      initial: 4,
      label: "Mode",
    }),
    priority: new EnhancedNumberField({
      initial: 20,
      label: "Priority",
    }),
    time: new EnhancedStringField({
      choices: TERIOCK.options.change.timeLabels,
      initial: "normal",
      label: "Timing",
      nullable: false,
    }),
    target: new EnhancedStringField({
      choices: allTypes,
      initial: "Actor",
      label: "Target Document Type",
      nullable: false,
    }),
    value: new EnhancedStringField({ initial: "", label: "Value" }),
    qualifier: new FormulaField({
      deterministic: true,
      initial: "1",
      label: "Qualifier",
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
  const { initial = "medium", label = "Child" } = options;
  return new StringField({
    initial,
    choices: TERIOCK.options.display.sizes,
    label: `${label} Block Size`,
    hint: `Size that ${label.toLowerCase()} blocks will be displayed at on this document's sheet.`,
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
  const { initial = false, label = "Child" } = options;
  return new BooleanField({
    initial,
    label: `${label} Block Gapless`,
    hint: `Whether there shouldn't be gaps between ${label.toLowerCase()} blocks on this document's sheet.`,
  });
}

/**
 * Build a cost adjustment.
 * @param {string} [label]
 * @returns {SchemaField}
 */
export function costAdjustment(label = "Adjustment") {
  return new SchemaField({
    enabled: new BooleanField({ label }),
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
 * @param {string} [options.label]
 * @returns {SchemaField}
 */
export function costField(options = { extraChoices: {}, label: "Cost" }) {
  return new SchemaField({
    type: new StringField({
      initial: "none",
      choices: {
        none: "None",
        static: "Static",
        formula: "Formula",
        variable: "Variable",
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
        label: options.label,
      }),
    }),
  });
}
