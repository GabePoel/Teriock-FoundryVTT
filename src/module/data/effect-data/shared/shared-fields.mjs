const { fields } = foundry.data;

/**
 * Field for an effect hierarchy.
 * @returns {SchemaField} Hierarchy field.
 */
export function hierarchyField() {
  return new fields.SchemaField({
    rootUuid: new fields.DocumentUUIDField({
      hint: "The UUID of the document this ability is embedded in.",
      label: "Root UUID",
    }),
    subIds: new fields.SetField(new fields.DocumentIdField(), {
      hint: "The IDs of the abilities that this ability provides, if there are any.",
      label: "Sub IDs",
    }),
    supId: new fields.DocumentIdField({
      hint: "The ID of the ability or effect that provides this ability, if there is one.",
      initial: null,
      label: "Super Ability ID",
      nullable: true,
    }),
  });
}

/**
 * Field for source portion of combat expiration.
 * @returns {StringField}
 */
export function combatExpirationSourceTypeField() {
  return new fields.StringField({
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
 * @returns {SchemaField}
 * @param {boolean} [expanded]
 */
export function transformationField(expanded = false) {
  const schema = {
    enabled: new fields.BooleanField({
      hint: "Whether this ability causes a transformation.",
      initial: false,
      label: "Causes Transformation",
      nullable: false,
      required: false,
    }),
    image: new fields.FilePathField({
      categories: ["IMAGE"],
      hint: "Optional overriding art to apply to the target.",
      initial: null,
      label: "Token Art",
      nullable: true,
      required: false,
      trim: true,
    }),
    level: new fields.StringField({
      choices: TERIOCK.options.effect.transformationLevel,
      hint: "How strong of a transformation this is.",
      initial: "minor",
      label: "Transformation Level",
      nullable: false,
      required: false,
    }),
    suppression: new fields.SchemaField({
      bodyParts: new fields.BooleanField({
        hint: "Whether this should suppress body parts not provided by the transformation.",
        initial: true,
        label: "Suppress Body Parts",
        nullable: false,
        required: false,
      }),
      equipment: new fields.BooleanField({
        hint: "Whether this should suppress equipment not provided by the transformation.",
        initial: true,
        label: "Suppress Equipment",
        nullable: false,
        required: false,
      }),
      fluencies: new fields.BooleanField({
        hint: "Whether this should suppress fluencies not provided by the transformation.",
        initial: true,
        label: "Suppress Fluencies",
        nullable: false,
        required: false,
      }),
      ranks: new fields.BooleanField({
        hint: "Whether this should suppress ranks not provided by the transformation.",
        initial: true,
        label: "Suppress Ranks",
        nullable: false,
        required: false,
      }),
    }),
    uuids: new fields.SetField(
      new fields.DocumentUUIDField({
        hint: "A specific species this transforms the target into.",
        nullable: false,
        type: "Item",
      }),
      {
        hint: "The species this transforms thr target into.",
        initial: [],
        label: "Species",
        nullable: false,
        required: false,
      },
    ),
    resetHp: new fields.BooleanField({
      hint: "Reset HP upon transformation.",
      label: "Reset HP",
      initial: true,
      required: false,
      nullable: false,
    }),
    resetMp: new fields.BooleanField({
      hint: "Reset MP upon transformation.",
      label: "Reset MP",
      initial: false,
      required: false,
      nullable: false,
    }),
  };
  if (expanded) {
    schema.species = new fields.ArrayField(new fields.DocumentIdField());
  }
  return new fields.SchemaField(schema);
}

/**
 * Field for method portion of combat expiration.
 * @returns {SchemaField} Timing field.
 */
export function combatExpirationMethodField() {
  return new fields.SchemaField({
    roll: new fields.StringField({
      hint: "If this expires on a roll, what is the roll that needs to be made?",
      initial: "2d4kh1",
      label: "Roll",
    }),
    threshold: new fields.NumberField({
      hint: "What is the minimum value that needs to be rolled in order for this to expire?",
      initial: 4,
      label: "Threshold",
    }),
    type: new fields.StringField({
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
 * @returns {SchemaField} Method field.
 */
export function combatExpirationTimingField() {
  return new fields.SchemaField({
    skip: new fields.NumberField({
      hint: "A number of instances of the trigger firing to skip before this effect expires.",
      initial: 0,
      label: "Skip",
    }),
    time: new fields.StringField({
      choices: {
        start: "Start",
        end: "End",
      },
      hint: "What is the timing for the trigger of this effect expiring?",
      initial: "start",
      label: "When",
    }),
    trigger: new fields.StringField({
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
 * Field that represents a change.
 * @returns {SchemaField}
 */
export function changeField() {
  return new fields.SchemaField({
    key: new fields.StringField({ initial: "" }),
    mode: new fields.NumberField({
      choices: TERIOCK.options.effect.changeMode,
      initial: 4,
    }),
    priority: new fields.NumberField({ initial: 20 }),
    value: new fields.StringField({ initial: "" }),
  });
}

/**
 * Field that represents panel associations.
 * @returns {ArrayField}
 */
export function associationsField() {
  return new fields.ArrayField(
    new fields.SchemaField({
      cards: new fields.ArrayField(
        new fields.SchemaField({
          color: new fields.StringField({
            nullable: true,
            required: false,
          }),
          id: new fields.DocumentIdField(),
          img: new fields.StringField(),
          name: new fields.StringField(),
          rescale: new fields.BooleanField({
            initial: false,
            required: false,
          }),
          type: new fields.StringField({
            initial: "base",
            required: false,
          }),
          uuid: new fields.DocumentUUIDField(),
        }),
        {
          initial: [],
          required: false,
        },
      ),
      icon: new fields.StringField({
        nullable: true,
        required: false,
        initial: null,
      }),
      title: new fields.StringField({
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
  return new fields.ArrayField(
    new fields.SchemaField({
      elements: new fields.StringField({ nullable: true }),
      italic: new fields.BooleanField({
        initial: false,
        required: false,
      }),
      special: new fields.StringField({ nullable: true }),
      text: new fields.StringField({ nullable: true }),
      title: new fields.StringField(),
    }),
  );
}
