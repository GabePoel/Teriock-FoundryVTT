import { attributeField, competenceField } from "../../../../../fields/tools/builders.mjs";
import { initialText } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

/**
 * Ability improvements part.
 * @param {typeof AbilitySystem} Base
 */
export default function AbilityUpgradesPart(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityUpgradesPartData}
     * @mixin
     */
    class AbilityUpgradesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          upgrades: new fields.SchemaField({
            competence: new fields.SchemaField({
              attribute: attributeField({ nullable: true, unp: true }),
              text: initialText(),
              value: competenceField(),
            }),
            score: new fields.SchemaField({
              attribute: attributeField({ nullable: true, unp: false }),
              text: initialText(),
              value: new fields.NumberField({ initial: 0, max: 5, min: -3, nullable: false }),
            }),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        if (source.improvements) {
          source.upgrades = {
            competence: { attribute: source.improvements.featSaveImprovement.attribute, value: 1 },
            score: {
              attribute: source.improvements.attributeImprovement.attribute,
              value: source.improvements.attributeImprovement.minVal,
            },
          };
          switch (source.improvements.featSaveImprovement.amount) {
            case "fluency":
              source.upgrades.competence.value = 2;
              break;
            case "proficiency":
              source.upgrades.competence.value = 1;
              break;
            default:
              source.upgrades.competence.value = 0;
              break;
          }
          delete source.improvements;
        }
        return super.migrateData(source, options, state);
      }

      /** @inheritDoc */
      get _displayInputs() {
        return [...super._displayInputs, ...this._displayInputsUpgrades];
      }

      /**
       * Upgrades display inputs.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayInputsUpgrades() {
        const inputs = ["system.upgrades.score.attribute"];
        if (this.upgrades.score.attribute) { inputs.push("system.upgrades.score.value"); }
        inputs.push("system.upgrades.competence.attribute");
        if (this.upgrades.competence.attribute) { inputs.push("system.upgrades.competence.value"); }
        return inputs;
      }

      /** @inheritDoc */
      get canChange() {
        return super.canChange || Boolean(this.upgrades.score.attribute) || Boolean(this.upgrades.competence.attribute);
      }

      /** @inheritDoc */
      get qualifiedChanges() {
        const changes = super.qualifiedChanges;
        if (this.upgrades.score.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.score.attribute}.score`,
            phase: TERIOCK.config.change.defaultPhase,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            type: "upgrade",
            value: this.upgrades.score.value.toString(),
          });
        }
        if (this.upgrades.competence.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.competence.attribute}.competence.raw`,
            phase: TERIOCK.config.change.defaultPhase,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            type: "upgrade",
            value: this.upgrades.competence.value.toString(),
          });
        }
        return changes;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.upgrades.score.attribute) {
          const attribute = attributeLink(this.upgrades.score.attribute);
          const value = this.upgrades.score.value;
          this.upgrades.score.text = `<p>${
            _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.score.description", { attribute, value })
          }</p>`;
        } else {
          this.upgrades.score.text = "";
        }
        if (this.upgrades.competence.value === 0) { this.upgrades.competence.attribute = null; }
        if (this.upgrades.competence.attribute) {
          const attribute = attributeLink(this.upgrades.competence.attribute);
          const amount = this.upgrades.competence.value;
          const identifier = TERIOCK.config.competence.levels[amount].identifier;
          const level = TERIOCK.config.competence.levels[amount].label;
          const upgrade = `@Identifier[${identifier}]{${level.toLowerCase()}}`;
          const savesLabel = _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.saves");
          const saves = `@Identifier[core:feat-interaction]{${savesLabel}}`;
          this.upgrades.competence.text = `<p>${
            _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.description", { attribute, saves, upgrade })
          }</p>`;
        } else {
          this.upgrades.competence.text = "";
        }
      }
    }
  );
}

/**
 * Build an attribute link.
 * @param {Teriock.Keys.Attribute} attribute
 * @returns {string}
 */
function attributeLink(attribute) {
  if (!TERIOCK.config.attribute[attribute]) { return ""; }
  const identifier = TERIOCK.config.attribute[attribute].identifier;
  const label = TERIOCK.config.attribute[attribute].abbreviation;
  return `@Identifier[${identifier}]{${label}}`;
}
