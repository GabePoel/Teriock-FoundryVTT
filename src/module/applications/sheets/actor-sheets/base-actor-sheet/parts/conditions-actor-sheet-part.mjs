import { pureUuid } from "../../../../../helpers/resolve.mjs";
import { conditionSort } from "../../../../../helpers/sort.mjs";
import { TeriockTextEditor } from "../../../../ux/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class ConditionsActorSheetPart extends Base {
    /**
     * Add conditions to rendering context.
     * @param {object} context
     */
    async _prepareConditionContext(context) {
      const removableConditions = this.actor.conditions.map(
        (c) => c.system.conditionKey,
      );
      const liveConditions = conditionSort(
        Array.from(this.actor.statuses || []).filter((c) =>
          Object.keys(TERIOCK.index.conditions).includes(c),
        ),
      );
      Object.assign(context, {
        conditions: liveConditions,
        removableConditions,
      });
      context.conditionsMap = {};
      for (const c of this.actor.conditions) {
        context.conditionsMap[c.system.conditionKey] = c;
      }
      context.conditionProviders = {};
      context.conditionTooltips = {};
      for (const condition of Object.keys(TERIOCK.index.conditions)) {
        context.conditionProviders[condition] = Array.from(
          this.document.system.conditionInformation[condition].reasons,
        );
        const panelParts = {
          bars: [],
          blocks: [
            {
              text: TERIOCK.data.conditions[condition].description,
              title: game.i18n.localize(
                "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
              ),
            },
          ],
          image: TERIOCK.data.conditions[condition].img,
          name: TERIOCK.data.conditions[condition].name,
          associations: [],
          icon: TERIOCK.options.document.condition.icon,
        };
        /** @type {TeriockTokenDocument[]} */
        const tokenDocs = Array.from(
          this.document.system.conditionInformation[condition]?.trackers,
        )
          .map((uuid) => fromUuidSync(pureUuid(uuid)))
          .filter((t) => t);
        if (tokenDocs.length > 0) {
          /** @type {Teriock.MessageData.MessageAssociation} */
          const association = {
            title: game.i18n.localize(
              "TERIOCK.SHEETS.Actor.CONDITIONS.Associations.title",
            ),
            icon: TERIOCK.options.document.creature.icon,
            cards: [],
          };
          for (const tokenDoc of tokenDocs) {
            association.cards.push({
              name: tokenDoc.name,
              uuid: tokenDoc.uuid,
              img: tokenDoc.texture.src,
              id: tokenDoc.id,
              type: "TokenDocument",
              rescale: tokenDoc.rescale,
              makeTooltip: false,
            });
          }
          panelParts.associations.push(association);
        }
        context.conditionTooltips[condition] =
          await TeriockTextEditor.makeTooltip(panelParts);
      }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      await this._prepareConditionContext(context);
      return context;
    }
  };
