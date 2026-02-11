import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";
import { AttributeModel } from "../../../../../models/_module.mjs";

const { SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles attributes.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorAttributesPartInterface}
     * @mixin
     */
    class ActorAttributesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const attributes = {};
        Object.entries(TERIOCK.index.attributes).forEach(
          ([key, value]) =>
            (attributes[key] = new EvaluationField({
              deterministic: false,
              initial: `2 * @att.${key}.score`,
              label: value,
              model: AttributeModel,
              score: -3,
            })),
        );
        return Object.assign(super.defineSchema(), {
          attributes: new SchemaField(attributes),
        });
      }

      /**
       * Prepare presence.
       */
      #preparePresence() {
        this.presence.overflow = this.presence.value > this.presence.max;
        this.presence.value = Math.min(this.presence.value, this.presence.max);
        this.attributes.unp.score = this.presence.max - this.presence.value;
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const att of Object.values(this.attributes)) {
          const data = att.getLocalRollData();
          Object.assign(rollData, prefixObject(data, `att.${att.key}`));
          Object.assign(rollData, prefixObject(data, `${att.key}`));
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.#preparePresence();
        for (const att of Object.values(this.attributes)) {
          att.passive = 10 + 2 * att.value;
        }
      }

      /**
       * Convenience method to roll a feat save for the specified attribute.
       *
       * Relevant wiki pages:
       * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
       *
       * @param {Teriock.Parameters.Actor.Attribute} attribute - The attribute to roll a feat save for.
       * @param {Partial<Teriock.Execution.FeatSaveExecutionOptions>} [options] - Options for the roll.
       */
      async rollFeatSave(attribute, options = { attribute }) {
        await this.attributes[attribute].use(options);
      }
    }
  );
};
