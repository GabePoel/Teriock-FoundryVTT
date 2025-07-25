const { fields } = foundry.data;
import inCombatExpirationDialog from "../../../helpers/dialogs/in-combat-expiration-dialog.mjs";
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { combatExpirationMethodField } from "../shared/shared-fields.mjs";

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockConditionData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * Metadata for this effect.
   *
   * @returns {Teriock.EffectMetadata}
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "condition",
    });
  }

  /**
   * Defines the schema for the condition data model.
   *
   * @returns {object} The schema definition for the condition data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Condition",
        gmOnly: true,
      }),
      expirations: new fields.SchemaField({
        combat: new fields.SchemaField({
          what: combatExpirationMethodField(),
        }),
      }),
    });
  }

  /**
   * Trigger in-combat expiration.
   *
   * @returns {Promise<void>}
   */
  async inCombatExpiration() {
    await inCombatExpirationDialog(this.parent);
  }

  /**
   * Rolls the condition. Alias for {@link inCombatExpiration}.
   *
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll() {
    await this.inCombatExpiration();
  }
}
