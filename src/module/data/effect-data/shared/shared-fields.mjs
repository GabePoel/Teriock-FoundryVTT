const { fields } = foundry.data;

/**
 * Field for an effect hierarchy.
 * @returns {SchemaField} Hierarchy field.
 */
export function hierarchyField() {
  return new fields.SchemaField({
    rootUuid: new fields.DocumentUUIDField({
      label: "Root UUID",
      hint: "The UUID of the document this ability is embedded in.",
    }),
    subIds: new fields.SetField(new fields.DocumentIdField(), {
      label: "Sub IDs",
      hint: "The IDs of the abilities that this ability provides, if there are any.",
    }),
    supId: new fields.DocumentIdField({
      initial: null,
      nullable: true,
      label: "Super Ability ID",
      hint: "The ID of the ability or effect that provides this ability, if there is one.",
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
    label: "Who",
    hint: "Whose turn should this effect attempt to expire on?",
    initial: "target",
  });
}

/**
 * Field for method portion of combat expiration.
 * @returns {SchemaField} Timing field.
 */
export function combatExpirationMethodField() {
  return new fields.SchemaField({
    type: new fields.StringField({
      choices: {
        forced: "Expires Automatically",
        rolled: "Expires on Roll",
        none: "Does not Expire on Turn",
      },
      label: "What",
      hint: "What is the type of thing that causes this to expire?",
      initial: "none",
    }),
    roll: new fields.StringField({
      initial: "2d4kh1",
      label: "Roll",
      hint: "If this expires on a roll, what is the roll that needs to be made?",
    }),
    threshold: new fields.NumberField({
      initial: 4,
      label: "Threshold",
      hint: "What is the minimum value that needs to be rolled in order for this to expire?",
    }),
  });
}

/**
 * Field for timing portion of combat expiration.
 * @returns {SchemaField} Method field.
 */
export function combatExpirationTimingField() {
  return new fields.SchemaField({
    time: new fields.StringField({
      choices: {
        start: "Start",
        end: "End",
      },
      initial: "start",
      label: "When",
      hint: "What is the timing for the trigger of this effect expiring?",
    }),
    trigger: new fields.StringField({
      choices: {
        turn: "Turn",
        combat: "Combat",
        action: "Action",
      },
      initial: "turn",
      label: "Trigger",
      hint: "What is the trigger for this effect expiring?",
    }),
    skip: new fields.NumberField({
      initial: 0,
      label: "Skip",
      hint: "A number of instances of the trigger firing to skip before this effect expires.",
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
      initial: 4,
      choices: TERIOCK.options.effect.changeMode,
    }),
    value: new fields.StringField({ initial: "" }),
    priority: new fields.NumberField({ initial: 20 }),
  });
}

/**
 * Field that represents panel associations.
 * @returns {ArrayField}
 */
export function associationsField() {
  return new fields.ArrayField(
    new fields.SchemaField({
      title: new fields.StringField({ initial: "Associations" }),
      icon: new fields.StringField({ nullable: true }),
      cards: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField(),
          img: new fields.StringField(),
          color: new fields.StringField({ nullable: true }),
          uuid: new fields.DocumentUUIDField(),
          id: new fields.DocumentIdField(),
          type: new fields.StringField(),
          rescale: new fields.BooleanField({ initial: false }),
        }),
      ),
    }),
  );
}

/**
 * Field that represents panel blocks.
 * @returns {ArrayField}
 */
export function blocksField() {
  return new fields.ArrayField(
    new fields.SchemaField({
      title: new fields.StringField(),
      text: new fields.StringField({ nullable: true }),
      special: new fields.StringField({ nullable: true }),
      elements: new fields.StringField({ nullable: true }),
      italic: new fields.BooleanField({ initial: false }),
    }),
  );
}
