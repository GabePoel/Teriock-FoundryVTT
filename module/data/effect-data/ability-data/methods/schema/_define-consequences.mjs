const { fields } = foundry.data;

function consequenceRollsField() {
  return new fields.TypedObjectField(new fields.StringField(), {
    label: "Rolls",
  });
}

function consequenceHacksField() {
  return new fields.TypedObjectField(new fields.StringField(), {
    label: "Hacks",
  });
}

function consequenceExpirationsField() {
  return new fields.SchemaField({
    turn: new fields.SchemaField(
      {
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

function consequenceField() {
  return new fields.SchemaField({
    instant: new fields.SchemaField({
      rolls: consequenceRollsField(),
      hacks: consequenceHacksField(),
    }),
    ongoing: new fields.SchemaField({
      statuses: new fields.ArrayField(new fields.StringField()),
      changes: new fields.ArrayField(
        new fields.SchemaField({
          key: new fields.StringField({ initial: "" }),
          mode: new fields.NumberField({ initial: 4 }),
          value: new fields.StringField({ initial: "" }),
          priority: new fields.NumberField({ initial: 20 }),
        }),
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

function mutationsField() {
  return new fields.SchemaField({
    double: new fields.BooleanField({
      initial: false,
      label: "Double Dice",
      hint: "If true, double the number of dice rolled.",
    }),
  });
}

function heightenedField() {
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

function simpleConsequenceDataField() {
  return new fields.SchemaField({
    default: consequenceField(),
    crit: new fields.SchemaField({
      overrides: consequenceField(),
      mutations: mutationsField(),
    }),
  });
}

function modifiedConsequenceDataField() {
  return new fields.SchemaField({
    overrides: simpleConsequenceDataField(),
    mutations: mutationsField(),
    heightened: heightenedField(),
  });
}

function consequenceDataField() {
  return new fields.SchemaField({
    base: new fields.TypedObjectField(simpleConsequenceDataField(), {
      label: "Base Consequences",
      hint: "The base consequences of the ability, applied by anyone that has it.",
    }),
    proficient: new fields.TypedObjectField(modifiedConsequenceDataField(), {
      label: "Proficient Consequences",
      hint: "The consequences of the ability when used by a proficient user.",
    }),
    fluent: new fields.TypedObjectField(modifiedConsequenceDataField(), {
      label: "Fluent Consequences",
      hint: "The consequences of the ability when used by a fluent user.",
    }),
  });
}

export function _defineConsequences(schema) {
  schema.consequences = consequenceDataField();
  return schema;
}
