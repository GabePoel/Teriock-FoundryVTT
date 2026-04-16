import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";
import { AttributeModel } from "../../../../../models/_module.mjs";

const { SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles attributes.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorAttributesPartData}
     * @mixin
     */
    class ActorAttributesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const attributes = {};
        Object.entries(TERIOCK.reference.attributes).forEach(
          ([key, value]) =>
            (attributes[key] = new EvaluationField({
              deterministic: false,
              initial: `2 * @${key}.score`,
              interval: 1,
              label: value,
              min: -Infinity,
              model: AttributeModel,
              score: -3,
            })),
        );
        return Object.assign(super.defineSchema(), {
          attributes: new SchemaField(attributes),
        });
      }

      /**
       * Ensure attributes have the correct keys assigned.
       */
      #prepareAttributes() {
        for (const [k, v] of Object.entries(this.attributes)) {
          v._key = k;
        }
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
          Object.assign(rollData, prefixObject(data, `${att.key}`));
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.#prepareAttributes();
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.#preparePresence();
        for (const att of Object.values(this.attributes)) {
          att.passive = 10 + att.value;
        }
      }

      /**
       * Convenience method to roll a feat save for the specified attribute.
       *
       * Relevant wiki pages:
       * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
       *
       * @param {Teriock.Keys.Attribute} attribute - The attribute to roll a feat save for.
       * @param {Partial<Teriock.Execution.FeatExecutionOptions>} [options] - Options for the roll.
       */
      async rollFeatSave(attribute, options = { attribute }) {
        await this.attributes[attribute].use(options);
      }
    }
  );
};
