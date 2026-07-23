import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { AttributeModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField, SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles attributes.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorAttributesPart(Base) {
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
        Object.entries(TERIOCK.config.attribute).forEach((
          [key, value],
        ) => (attributes[key] = new EmbeddedDataField(AttributeModel, {
          initial: { bonus: `2 * @${key}.score`, score: -3 },
          label: value.label,
        })));
        return Object.assign(super.defineSchema(), { attributes: new SchemaField(attributes) });
      }

      /**
       * Prepare presence.
       */
      #preparePresence() {
        this.presence.value = this.actor?.attunements.filter(a => a.active).reduce((sum, a) => sum + a.system.tier, 0);
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
      prepareSpecialData() {
        super.prepareSpecialData();
        this.#preparePresence();
      }

      /**
       * Convenience method to roll a feat save for the specified attribute.
       *
       * Relevant wiki pages:
       * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
       *
       * @param {Teriock.Keys.Attribute} attribute - The attribute to roll a feat save for.
       * @param {Partial<Teriock.Execution.ThresholdExecutionOptions>} [options] - Options for the roll.
       */
      async rollFeatSave(attribute, options = {}) {
        await this.attributes[attribute].use(options);
      }
    }
  );
}
