const { fields } = foundry.data;
import { abilityOptions } from "../../../../../helpers/constants/ability-options.mjs";
import { conditions as conditionsList } from "../../../../../helpers/constants/generated/conditions.mjs";
import { AbilityData } from "../../../../effect-data/_module.mjs";

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
 * @returns {foundry.data.fields.SchemaField}
 *
 * @typedef {Object} ProtectionSchema
 * @property {foundry.data.fields.SetField} damageTypes - A list of damage types.
 * @property {foundry.data.fields.SetField} drainTypes - A list of drain types.
 * @property {foundry.data.fields.SetField} statuses - A list of conditions.
 * @property {foundry.data.fields.SetField} elements - A list of elements.
 * @property {foundry.data.fields.SetField} effects - A list of effects.
 * @property {foundry.data.fields.SetField} powerSources - A list of power sources.
 * @property {foundry.data.fields.SetField} abilities - A list of abilities.
 * @property {foundry.data.fields.SetField} other - A list of other protections.
//  * @property {foundry.data.fields.SetField} combos - A list of key-value pairs that define specific types of abilities.
 */
function protectionField(name) {
  return new fields.SchemaField({
    damageTypes: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Damage Type`,
      }),
      {
        label: `Damage Types`,
        hint: `A list of damage types you ${name}.`,
      },
    ),
    drainTypes: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Drain Type`,
      }),
      {
        label: `Drain Types`,
        hint: `A list of drain types you ${name}.`,
      },
    ),
    statuses: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Condition`,
        choices: conditionsList,
      }),
      {
        label: `Conditions`,
        hint: `A list of conditions you ${name}.`,
      },
    ),
    elements: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Element`,
        choices: abilityOptions.elements,
      }),
      {
        label: `Elements`,
        hint: `A list of elements you ${name}.`,
      },
    ),
    effects: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Effect`,
        choices: abilityOptions.effects,
      }),
      {
        label: `Effects`,
        hint: `A list of effects you ${name}.`,
      },
    ),
    powerSources: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Power Source`,
        choices: abilityOptions.powerSources,
      }),
      {
        label: `Power Sources`,
        hint: `A list of power sources you ${name}.`,
      },
    ),
    abilities: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Ability`,
      }),
    ),
    other: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Other`,
      }),
    ),
    // combos: new fields.SetField(
    //   new fields.ArrayField(
    //     new fields.SchemaField(
    //       {
    //         key: new fields.StringField({
    //           initial: "",
    //           label: `Key`,
    //         }),
    //         value: new fields.AnyField({
    //           label: `Value`,
    //         }),
    //       },
    //       {
    //         label: `Check`,
    //         hint: `A key-value pair that defines specific types of abilities you ${name}.`,
    //       },
    //     ),
    //     {
    //       label: `Combos`,
    //       hint: `A list of key-value pairs that define specific types of abilities you ${name}.`,
    //     },
    //   ),
    // ),
  });
}

/**
 * Defines the schema for actor resistances and immunities.
 *
 * Relevant wiki pages:
 * - [Resistance](https://wiki.teriock.com/index.php/Keyword:Resistance)
 * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
 *
 * @param {Object} schema - The schema object to extend with resistances and immunities fields
 * @returns {Object} The modified schema object with resistances and immunities fields added
 *
 * @example
 * ```javascript
 * const schema = {};
 * const protectionsSchema = _defineProtections(schema);
 * // protectionsSchema now contains: resistances and immunities fields
 * ```
 *
 * @typedef {Object} ProtectionsSchema
 * @property {foundry.data.fields.SchemaField} resistances - A schema field for actor resistances.
 * @property {foundry.data.fields.SchemaField} immunities - A schema field for actor immunities.
 */
export function _defineProtections(schema) {
  schema.resistances = protectionField("resist");
  schema.immunities = protectionField("are immune to");
  return schema;
}
