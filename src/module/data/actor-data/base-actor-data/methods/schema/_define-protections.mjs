const { fields } = foundry.data;

/**
 * Creates a schema field definition for protection types.
 *
 * Relevant wiki pages:
 * - [Damage types](https://wiki.teriock.com/index.php/Category:Damage_types)
 * - [Drain types](https://wiki.teriock.com/index.php/Category:Drain_types)
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 * - [Elemental abilities](https://wiki.teriock.com/index.php/Category:Elemental_abilities)
 * - [Effects](https://wiki.teriock.com/index.php/Category:Effects)
 * - [Powered abilities](https://wiki.teriock.com/index.php/Category:Powered_abilities)
 *
 * @param {string} name - The name of the protection type (e.g., "resist", "are immune to")
 * @returns {SchemaField}
 */
function protectionField(name) {
  return new fields.SchemaField({
    damageTypes: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Damage Type`,
    }), {
      label: `Damage Types`,
      hint: `A list of damage types you ${name}.`,
    }),
    drainTypes: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Drain Type`,
    }), {
      label: `Drain Types`,
      hint: `A list of drain types you ${name}.`,
    }),
    statuses: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Condition`,
      choices: TERIOCK.index.conditions,
    }), {
      label: `Conditions`,
      hint: `A list of conditions you ${name}.`,
    }),
    elements: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Element`,
      choices: TERIOCK.index.elements,
    }), {
      label: `Elements`,
      hint: `A list of elements you ${name}.`,
    }),
    effects: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Effect`,
      choices: TERIOCK.index.effectTypes,
    }), {
      label: `Effects`,
      hint: `A list of effects you ${name}.`,
    }),
    powerSources: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Power Source`,
      choices: TERIOCK.index.powerSources,
    }), {
      label: `Power Sources`,
      hint: `A list of power sources you ${name}.`,
    }),
    abilities: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Ability`,
    })),
    other: new fields.SetField(new fields.StringField({
      initial: "",
      label: `Other`,
    })),
  });
}

/**
 * Defines the schema for actor resistances and immunities.
 *
 * Relevant wiki pages:
 * - [Resistance](https://wiki.teriock.com/index.php/Keyword:Resistance)
 * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
 *
 * @param {object} schema - The schema object to extend with resistances and immunities fields
 * @returns {object} The modified schema object with resistances and immunities fields added
 */
export function _defineProtections(schema) {
  schema.resistances = protectionField("resist");
  schema.immunities = protectionField("are immune to");
  return schema;
}
