import {
  TeriockRecordField,
  TeriockArrayField,
  TypedStringField,
  ConsequenceField,
  SimpleConsequenceField,
  CriticalConsequenceField,
  ModifiedConsequenceField,
} from "./_fields.mjs";
const { fields } = foundry.data;
import { consequenceOptions } from "../../../../../helpers/constants/consequence-options.mjs";

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
    dawn: new fields.BooleanField({
      initial: false,
      label: "Dawn Expiration",
      hint: "If true, the effect expires at dawn.",
    }),
    sustained: new fields.BooleanField({
      initial: false,
      label: "Sustained Expiration",
      hint: "If true, the effect expires if the ability sustaining it is lost or disabled.",
    }),
  });
}

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
      changes: new TeriockArrayField(
        new fields.SchemaField({
          key: new fields.StringField({ initial: "" }),
          mode: new fields.NumberField({ initial: 4 }),
          value: new fields.StringField({ initial: "" }),
          priority: new fields.NumberField({ initial: 20 }),
        }),
        {
          label: "Changes",
          hint: "The changes applied as part of the ongoing effect. These are applied to the target.",
        },
      ),
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

export function mutationsField() {
  return new fields.SchemaField({
    double: new fields.BooleanField({
      initial: false,
      label: "Double Dice on Crit",
      hint: "If true, double the number of dice rolled on a crit.",
    }),
  });
}

export function heightenedField() {
  return new fields.SchemaField({
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

export function modifiedConsequenceDataField() {
  return new ModifiedConsequenceField({
    overrides: simpleConsequenceDataField(),
    mutations: mutationsField(),
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
