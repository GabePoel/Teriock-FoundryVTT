import {
  ImmunityExecution,
  ResistanceExecution,
} from "../../../../../../executions/activity-executions/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles protections.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorProtectionsPartInterface}
     * @mixin
     */
    class ActorProtectionsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          protections: new fields.SchemaField({
            resistances: protectionField("are resistant to"),
            immunities: protectionField("are immune to"),
            hexproofs: protectionField("are hexproof against"),
            hexseals: protectionField("are hexseal against"),
          }),
        });
        return schema;
      }

      /**
       * Checks if there's some protection against something
       *
       * Relevant wiki pages:
       * - [Protection keywords](https://wiki.teriock.com/index.php/Category:Protection_keywords)
       *
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
       * - [Hexseal](https://wiki.teriock.com/index.php/Keyword:Hexseal)
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
       * - [Hexproof](https://wiki.teriock.com/index.php/Keyword:Hexproof)
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
    damageTypes: protectionSetField("Damage Type", "Damage Types", tagline),
    drainTypes: protectionSetField("Drain Type", "Drain Types", tagline),
    statuses: protectionSetField(
      "Condition",
      "Conditions",
      tagline,
      TERIOCK.index.conditions,
    ),
    elements: protectionSetField(
      "Element",
      "Elements",
      tagline,
      TERIOCK.index.elements,
    ),
    effects: protectionSetField(
      "Effect Type",
      "Effect Types",
      tagline,
      TERIOCK.index.effectTypes,
    ),
    powerSources: protectionSetField(
      "Power Source",
      "Power Sources",
      tagline,
      TERIOCK.index.powerSources,
    ),
    abilities: protectionSetField("Ability", "Abilities", tagline),
    other: protectionSetField("Other", "Other Effects", tagline),
  });
}

/**
 * An individual entry for the protections fields.
 * @param {string} label
 * @param {string} tagline
 * @param {string} plural
 * @param {object} [choices]
 */
function protectionSetField(label, plural, tagline, choices) {
  return new fields.SetField(
    new fields.StringField({
      initial: "",
      label,
      choices,
    }),
    {
      label: `${label}s`,
      hint: `A list of ${plural.toLowerCase()} you ${tagline}.`,
    },
  );
}
