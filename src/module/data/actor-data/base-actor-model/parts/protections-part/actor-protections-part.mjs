import { ResistanceExecution } from "../../../../../executions/activity-executions/_module.mjs";
import ImmunityExecution from "../../../../../executions/activity-executions/immunity-execution/immunity-execution.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles protections.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ActorProtectionsPartInterface}
     * @mixin
     */
    class ActorProtectionsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          protections: new fields.SchemaField({
            resistances: protectionField("resist"),
            immunities: protectionField("are immune to"),
            hexproofs: protectionField("hexproof"),
            hexseals: protectionField("hexseal"),
          }),
        });
        return schema;
      }

      /**
       * Checks if there's some protection against something
       * @param {ProtectionDataKey} key - Category of protection
       * @param {ProtectionDataValue} value - Specific protection
       * @returns {boolean} Whether or not there's some protection against the specified key and value
       */
      isProtected(key, value) {
        let hasProtection = false;
        for (const protectionData of Object.values(this.protections)) {
          if ((protectionData[key] || new Set()).has(value)) {
            hasProtection = true;
          }
        }
        return hasProtection;
      }

      /**
       * Rolls an immunity save (these always succeed).
       *
       * Relevant wiki pages:
       * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
       *
       * @param {Teriock.Execution.ImmunityExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollImmunity(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollImmunity", data);
        if (data.cancel) {
          return;
        }
        options.actor = this.parent;
        const execution = new ImmunityExecution(options);
        await execution.execute();
      }

      /**
       * Rolls a resistance save.
       *
       * Relevant wiki pages:
       * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
       *
       * @param {Teriock.Execution.ResistanceExecutionOptions} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollResistance(options = {}) {
        const data = { options };
        await this.parent.hookCall("rollResistance", data);
        if (data.cancel) {
          return;
        }
        options.actor = this.parent;
        const execution = new ResistanceExecution(options);
        await execution.execute();
      }
    }
  );
};

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
 * @param {string} tagline - The tagline of the protection type (e.g., "resist", "are immune to")
 */
function protectionField(tagline) {
  return new fields.SchemaField({
    damageTypes: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Damage Type`,
      }),
      {
        label: `Damage Types`,
        hint: `A list of damage types you ${tagline}.`,
      },
    ),
    drainTypes: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Drain Type`,
      }),
      {
        label: `Drain Types`,
        hint: `A list of drain types you ${tagline}.`,
      },
    ),
    statuses: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Condition`,
        choices: TERIOCK.index.conditions,
      }),
      {
        label: `Conditions`,
        hint: `A list of conditions you ${tagline}.`,
      },
    ),
    elements: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Element`,
        choices: TERIOCK.index.elements,
      }),
      {
        label: `Elements`,
        hint: `A list of elements you ${tagline}.`,
      },
    ),
    effects: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Effect`,
        choices: TERIOCK.index.effectTypes,
      }),
      {
        label: `Effects`,
        hint: `A list of effects you ${tagline}.`,
      },
    ),
    powerSources: new fields.SetField(
      new fields.StringField({
        initial: "",
        label: `Power Source`,
        choices: TERIOCK.index.powerSources,
      }),
      {
        label: `Power Sources`,
        hint: `A list of power sources you ${tagline}.`,
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
  });
}
