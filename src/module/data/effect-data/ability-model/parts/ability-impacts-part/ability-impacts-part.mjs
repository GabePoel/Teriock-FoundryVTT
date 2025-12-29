import { pseudoHooks } from "../../../../../constants/system/pseudo-hooks.mjs";
import { pureUuid } from "../../../../../helpers/resolve.mjs";
import { FormulaField, RecordField } from "../../../../fields/_module.mjs";
import { builders } from "../../../../fields/helpers/_module.mjs";
import { qualifyChange } from "../../../../shared/migrations/migrate-changes.mjs";

const { fields } = foundry.data;

/**
 * Ability impacts part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @implements {Teriock.Models.AbilityImpactsPartInterface}
     * @mixin
     */
    class AbilityImpactsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          impacts: new fields.SchemaField({
            base: abilityImpactField(),
            proficient: abilityImpactField(),
            fluent: abilityImpactField(),
            heightened: abilityImpactField(),
            macros: new fields.TypedObjectField(
              new fields.StringField({
                choices: pseudoHooks,
              }),
            ),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        migrateProtections(data);
        migrateImpacts(data, changeMigration);

        // Impact migration
        if (foundry.utils.hasProperty(data, "applies")) {
          data.impacts = foundry.utils.getProperty(data, "applies");
          foundry.utils.deleteProperty(data, "applies");
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      get changes() {
        const changes = super.changes;
        if (this.maneuver === "passive") {
          if (this.impacts.base.changes.length > 0) {
            changes.push(...this.impacts.base.changes);
          }
          if (
            this.parent.isProficient &&
            this.impacts.proficient.changes.length > 0
          ) {
            changes.push(...this.impacts.proficient.changes);
          }
          if (this.parent.isFluent && this.impacts.fluent.changes.length > 0) {
            changes.push(...this.impacts.fluent.changes);
          }
          changes.push(...this.pseudoHookChanges);
        }
        return changes;
      }

      /**
       * Changes corresponding to pseudo-hooks.
       * @returns {Teriock.Changes.QualifiedChangeData[]}
       */
      get pseudoHookChanges() {
        return Object.entries(this.impacts.macros).map(
          ([safeUuid, pseudoHook]) => {
            return {
              key: `system.hookedMacros.${pseudoHook}`,
              mode: 2,
              priority: 5,
              qualifier: "1",
              target: "Actor",
              time: "normal",
              value: pureUuid(safeUuid),
            };
          },
        );
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.impacts.boosts =
          /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} */ {};
      }
    }
  );
};

/**
 * Creates a field for impact rolls configuration.
 *
 * Relevant wiki pages:
 * - [Damage types](https://wiki.teriock.com/index.php/Category:Damage_types)
 * - [Drain types](https://wiki.teriock.com/index.php/Category:Drain_types)
 *
 * @returns {RecordField} Field for configuring impact rolls
 */
export function impactRollsField() {
  return new RecordField(
    new FormulaField({
      nullable: true,
      deterministic: false,
    }),
    {
      label: "Rolls",
      hint: "The rolls that are made as part of the consequence.",
    },
    undefined,
  );
}

/**
 * Creates a field for impact changes configuration.
 */
export function impactChangesField() {
  return new fields.ArrayField(builders.qualifiedChangeField(), {
    label: "Changes",
    hint: "Changes made to the target actor as part of the ability's ongoing effect.",
  });
}

/**
 * Creates a field for ability-specific expiration data.
 */
function impactExpirationField() {
  return new fields.SchemaField({
    combat: new fields.SchemaField({
      who: new fields.SchemaField({
        type: builders.combatExpirationSourceTypeField(),
      }),
      what: builders.combatExpirationMethodField(),
      when: builders.combatExpirationTimingField(),
    }),
  });
}

/**
 * Creates a field for impact data configuration.
 */
function abilityImpactField() {
  return new fields.SchemaField({
    changes: impactChangesField(),
    checks: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.tradecrafts,
      }),
      {
        label: "Tradecraft Checks",
        hint: "Tradecraft checks that may be made as part of the ability.",
      },
    ),
    common: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.options.consequence.common,
      }),
      {
        label: "Common Consequences",
        hint: "Common consequences shared by lots of abilities.",
      },
    ),
    duration: new fields.NumberField({
      hint:
        "Increase in the duration (in seconds) of an effect made as part of the ability. If this is nonzero, it " +
        "overrides the default duration.",
      initial: 0,
      label: "Duration",
    }),
    endStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Remove Conditions",
        hint:
          "Conditions that may be immediately removed when the ability is used This only works on conditions that " +
          "exist independently of the ability.",
      },
    ),
    expiration: new fields.SchemaField({
      normal: impactExpirationField(),
      crit: impactExpirationField(),
      changeOnCrit: new fields.BooleanField({
        initial: false,
        label: "Special Crit Expiration",
        hint: "Should the combat timing expiration change on a crit?",
      }),
      doesExpire: new fields.BooleanField({
        initial: false,
        label: "Override Expiration",
        hint: "Should custom expiration timing be applied?",
      }),
    }),
    hacks: new fields.SetField(
      new fields.StringField({
        choices: {
          arm: "Arm",
          leg: "Leg",
          body: "Body",
          eye: "Eye",
          ear: "Ear",
          mouth: "Mouth",
          nose: "Nose",
        },
      }),
      {
        label: "Hacks",
        hint: "Types of hack damage that may be applied by the ability.",
      },
    ),
    macroButtonUuids: new fields.SetField(
      new fields.DocumentUUIDField({
        type: "Macro",
      }),
      {
        hint:
          "Macros to turn into buttons that are displayed in the chat message rather than automatically executed." +
          " These macros do not have the full roll config in their scope. They are missing ability data, chat data," +
          " and some parameters the use data.",
        initial: [],
        label: "Macro Execution Buttons",
        nullable: false,
        required: false,
      },
    ),
    noTemplate: new fields.BooleanField({
      hint: "Do not place a template when using this ability even if it has an area of effect.",
      initial: false,
      label: "No Template",
      nullable: false,
      required: false,
    }),
    abilityButtonNames: new fields.SetField(new fields.StringField(), {
      hint: "Names of specific abilities that this can cause to be used. These will be displayed as chat buttons.",
      initial: [],
      label: "Ability Use Buttons",
      nullable: false,
      required: false,
    }),
    range: new FormulaField({
      deterministic: true,
    }),
    rolls: impactRollsField(),
    startStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Apply Conditions",
        hint:
          "Conditions that may be immediately applied when the ability is used. They exist independently of the " +
          "ability.",
      },
    ),
    statuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Conditions",
        hint:
          "Conditions applied as part of the ability's ongoing effect. These are not applied as separate conditions, " +
          "but merged into an ongoing effect.",
      },
    ),
    critStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Critical Conditions",
        hint:
          "Conditions applied as part of the ability's ongoing effect if it crits. These are not applied as separate" +
          " conditions, but merged into an ongoing effect.",
      },
    ),
    transformation: builders.transformationField({
      configuration: true,
    }),
  });
}

/**
 * @param {EffectChangeData} change
 */
function migrateProtection(change) {
  change.key = change.key.replace(
    "system.resistances",
    "system.protections.resistances",
  );
  change.key = change.key.replace(
    "system.immunities",
    "system.protections.immunities",
  );
  change.key = change.key.replace(
    "system.hexproofs",
    "system.protections.hexproofs",
  );
  change.key = change.key.replace(
    "system.hexseals",
    "system.protections.hexseals",
  );
}

/**
 * Migrate protection data. Maintain the old `applies` field.
 * @param {TeriockAbilityModel} data
 */
function migrateProtections(data) {
  for (const application of ["base", "proficient", "fluent", "heightened"]) {
    for (const prefix of ["applies", "impacts"]) {
      if (foundry.utils.hasProperty(data, `${prefix}.${application}.changes`)) {
        const changes = foundry.utils.getProperty(
          data,
          `${prefix}.${application}.changes`,
        );
        for (const change of changes) {
          migrateProtection(change);
        }
      }
    }
  }
}

/**
 * Migrate impact changes.
 * @param {AbilityImpact} impact
 * @returns {AbilityImpact}
 */
function changeMigration(impact) {
  impact.changes = impact.changes.map((c) => qualifyChange(c));
  return impact;
}

/**
 * Migrate impacts.
 * @param {object} data
 * @param {Function}migrationFunction
 */
function migrateImpacts(data, migrationFunction) {
  for (const application of ["base", "proficient", "fluent", "heightened"]) {
    for (const prefix of ["applies", "impacts"]) {
      if (foundry.utils.hasProperty(data, `${prefix}.${application}`)) {
        const impact = foundry.utils.getProperty(
          data,
          `${prefix}.${application}`,
        );
        foundry.utils.setProperty(
          data,
          `impacts.${application}`,
          migrationFunction(impact),
        );
      }
    }
  }
}
