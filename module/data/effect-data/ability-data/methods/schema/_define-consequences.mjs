import {
  ConsequenceField,
  CriticalConsequenceField,
  HeightenedField,
  ModifiedConsequenceField,
  MutationsField,
  SimpleConsequenceField,
  TeriockArrayField,
  TeriockRecordField,
} from "./_fields.mjs";
const { fields } = foundry.data;

/**
 * Creates a field for consequence rolls configuration.
 *
 * This field allows defining various roll formulas for different effect types:
 * - Damage, drain, wither rolls
 * - Healing and revitalization rolls
 * - Temporary HP/MP manipulation
 * - Sleep, kill, and other special effects
 *
 * Relevant wiki pages:
 * - [Damage types](https://wiki.teriock.com/index.php/Category:Damage_types)
 * - [Drain types](https://wiki.teriock.com/index.php/Category:Drain_types)
 *
 * @returns {TeriockRecordField} Field for configuring consequence rolls
 * @private
 *
 * @example
 * // Create rolls field
 * const rollsField = consequenceRollsField();
 */
export function consequenceRollsField() {
  return new TeriockRecordField(
    new fields.StringField({
      nullable: true,
    }),
    {
      label: "Rolls",
      hint: "The rolls that are made as part of the consequence.",
    },
  );
}

/**
 * Creates a field for consequence hacks configuration.
 *
 * Relevant wiki pages:
 * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
 *
 * @returns {TeriockRecordField} Field for configuring consequence hacks
 * @private
 *
 * @example
 * // Create hacks field
 * const hacksField = consequenceHacksField();
 */
export function consequenceHacksField() {
  return new TeriockRecordField(
    new fields.StringField({
      nullable: true,
    }),
    {
      label: "Hacks",
      hint: "The hacks that are applied as part of the consequence.",
    },
  );
}

/**
 * Creates a field for consequence expiration configuration.
 *
 * This field defines when and how consequences expire:
 * - Turn-based expiration (target, executor, every, other)
 * - Movement-based expiration
 * - Automatic vs. roll-based expiration
 *
 * @returns {SchemaField} Field for configuring consequence expirations
 * @private
 *
 * @example
 * // Create expirations field
 * const expirationsField = consequenceExpirationsField();
 */
export function consequenceExpirationsField() {
  return new fields.SchemaField({
    turn: new fields.SchemaField(
      {
        enabled: new fields.BooleanField({
          initial: false,
          label: "Turn Expiration",
          hint: "If true, the effect expires with respect to some turn.",
        }),
        who: new fields.StringField({
          choices: {
            target: "Target's Turn",
            executor: "Executor's Turn",
            every: "Every Turn",
            other: "Other",
          },
          initial: "target",
          label: "Who",
          hint: "Whose turn the effect expires on.",
        }),
        when: new fields.StringField({
          choices: {
            start: "Start of Turn",
            end: "End of Turn",
            other: "Other",
          },
          initial: "start",
          label: "When",
          hint: "When the effect expires during the turn.",
        }),
        how: new fields.StringField({
          choices: {
            roll: "Roll 2d4",
            auto: "Automatic",
          },
          initial: "roll",
          label: "How",
          hint: "How the expiration is determined.",
        }),
      },
      {
        label: "Turn Expiration",
        hint: "This field defines when the effect expires during a turn.",
      },
    ),
    movement: new fields.BooleanField({
      initial: false,
      label: "Movement Expiration",
      hint: "If true, the effect expires when the target moves.",
    }),
  });
}

/**
 * Creates a field for consequence changes configuration.
 *
 * This field defines changes that are applied to the target as part of the consequence.
 *
 * @returns {TeriockArrayField} Field for configuring consequence changes
 * @private
 *
 * @example
 * // Create changes field
 * const changesField = consequenceChangesField();
 */
export function consequenceChangesField() {
  return new TeriockArrayField(
    new fields.SchemaField({
      key: new fields.StringField({ initial: "" }),
      mode: new fields.NumberField({
        initial: 4,
        choices: {
          0: "Custom",
          1: "Multiply",
          2: "Add",
          3: "Downgrade",
          4: "Upgrade",
          5: "Override",
        },
      }),
      value: new fields.StringField({ initial: "" }),
      priority: new fields.NumberField({ initial: 20 }),
    }),
    {
      label: "Changes",
      hint: "The changes applied as part of the ongoing effect. These are applied to the target.",
    },
  );
}

/**
 * Creates a field for a complete consequence configuration.
 *
 * This field combines instant and ongoing effects:
 * - **Instant**: Rolls and hacks applied immediately
 * - **Ongoing**: Status effects, changes, duration, and expirations
 *
 * @returns {ConsequenceField} Field for configuring complete consequences
 * @private
 *
 * @example
 * // Create consequence field
 * const consequenceField = consequenceField();
 */
export function consequenceField() {
  return new ConsequenceField({
    instant: new fields.SchemaField({
      rolls: consequenceRollsField(),
      hacks: consequenceHacksField(),
    }),
    ongoing: new fields.SchemaField({
      statuses: new fields.SetField(
        new fields.StringField({
          choices: CONFIG.TERIOCK.conditions,
        }),
        {
          label: "Conditions",
          hint: "The conditions applied as part of the ongoing effect. These are applied to the target.",
        },
      ),
      changes: consequenceChangesField(),
      duration: new fields.NumberField({
        initial: null,
        label: "Duration (seconds)",
        hint: "The duration of the ongoing effect in seconds. If not specified, will inherit from ability.",
        nullable: true,
      }),
      expirations: consequenceExpirationsField(),
    }),
  });
}

/**
 * Creates a field for consequence mutations configuration.
 *
 * This field defines special modifications to consequences:
 * - Double dice on critical hits
 * - Other mutation effects
 *
 * Relevant wiki pages:
 * - [Interactions](https://wiki.teriock.com/index.php/Core:Interactions)
 *
 * @returns {MutationsField} Field for configuring consequence mutations
 * @private
 *
 * @example
 * // Create mutations field
 * const mutationsField = mutationsField();
 */
export function mutationsField() {
  return new MutationsField({
    double: new fields.BooleanField({
      initial: false,
      label: "Double Dice on Crit",
      hint: "If true, double the number of dice rolled on a crit.",
    }),
  });
}

/**
 * Creates a field for heightened ability configuration.
 *
 * This field defines enhanced abilities with:
 * - Override consequences for heightened state
 * - Scaling effects (rolls and duration)
 * - Additional complexity and power
 *
 * Relevant wiki pages:
 * - [Heightening](https://wiki.teriock.com/index.php/Core:Heightening)
 *
 * @returns {HeightenedField} Field for configuring heightened abilities
 * @private
 *
 * @example
 * // Create heightened field
 * const heightenedField = heightenedField();
 */
export function heightenedField() {
  return new HeightenedField({
    enabled: new fields.BooleanField({
      initial: false,
      label: "Heightened Overrides",
      hint: "If true, the ability is heightened and has additional effects.",
    }),
    overrides: consequenceField(),
    scaling: new fields.SchemaField({
      rolls: consequenceRollsField(),
      duration: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0,
          label: "Extra Duration (seconds)",
          hint: "Additional duration in seconds added to the base duration of the ability.",
        }),
        rounding: new fields.NumberField({
          initial: 1,
          label: "Rounding (seconds)",
          hint: "Round to the nearest multiple of this value when calculating the duration.",
        }),
      }),
    }),
  });
}

/**
 * Creates a field for simple consequence data configuration.
 *
 * This field defines basic consequences with:
 * - Default consequence for normal use
 * - Critical consequence with overrides and mutations
 *
 * Relevant wiki pages:
 * - [Interactions](https://wiki.teriock.com/index.php/Core:Interactions)
 *
 * @returns {SimpleConsequenceField} Field for configuring simple consequences
 * @private
 *
 * @example
 * // Create simple consequence field
 * const simpleField = simpleConsequenceDataField();
 */
export function simpleConsequenceDataField() {
  return new SimpleConsequenceField({
    default: consequenceField(),
    crit: new CriticalConsequenceField({
      enabled: new fields.BooleanField({
        initial: false,
        label: "Critical Overrides",
        hint: "If true, default consequences are overridden on a crit.",
      }),
      overrides: consequenceField(),
      mutations: mutationsField(),
    }),
  });
}

/**
 * Creates a field for modified consequence data configuration.
 *
 * This field defines advanced consequences with:
 * - Static overrides for different proficiency levels
 * - Mutations that modify the consequences
 * - Heightened ability configuration
 *
 * Relevant wiki pages:
 * - [Interactions](https://wiki.teriock.com/index.php/Core:Interactions)
 * - [Heightening](https://wiki.teriock.com/index.php/Core:Heightening)
 *
 * @returns {ModifiedConsequenceField} Field for configuring modified consequences
 * @private
 *
 * @example
 * // Create modified consequence field
 * const modifiedField = modifiedConsequenceDataField();
 */
export function modifiedConsequenceDataField() {
  return new ModifiedConsequenceField({
    enabled: new fields.BooleanField({
      initial: false,
      label: "Static Overrides",
      hint: "If true, the ability has static overrides for its consequences.",
    }),
    overrides: simpleConsequenceDataField(),
    heightened: heightenedField(),
  });
}

export function consequenceDataField() {
  return new fields.SchemaField({
    base: new TeriockRecordField(simpleConsequenceDataField(), {
      label: "Base Consequences",
      hint: "The base consequences of the ability, applied by anyone that has it.",
    }),
    proficient: new TeriockRecordField(modifiedConsequenceDataField(), {
      label: "Proficient Consequences",
      hint: "The consequences of the ability when used by a proficient user.",
    }),
    fluent: new TeriockRecordField(modifiedConsequenceDataField(), {
      label: "Fluent Consequences",
      hint: "The consequences of the ability when used by a fluent user.",
    }),
  });
}

export function _defineConsequences(schema) {
  schema.consequences = consequenceDataField();
  return schema;
}
