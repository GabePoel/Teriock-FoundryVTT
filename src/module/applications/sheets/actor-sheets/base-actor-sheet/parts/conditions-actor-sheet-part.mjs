import { conditionSort } from "../../../../../helpers/sort.mjs";
import { toCamelCase } from "../../../../../helpers/string.mjs";
import { TeriockTextEditor } from "../../../../ux/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof TeriockBaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {TeriockBaseActorSheet}
   * @mixin
   */
  class ConditionsActorSheetPart extends Base {
    /**
     * Add conditions to rendering context.
     * @param {object} context
     */
    async _prepareConditionContext(context) {
      const conditions = conditionSort(
        Array.from(this.actor.statuses || []).filter((c) =>
          Object.keys(TERIOCK.index.conditions).includes(c),
        ),
      );
      Object.assign(context, {
        conditions: conditions,
        removableConditions: conditions.filter((c) =>
          this.actor.effectKeys.condition.has(c),
        ),
      });
      context.conditionsMap = {};
      for (const c of this.actor.conditions) {
        context.conditionsMap[toCamelCase(c.name)] = c;
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
              title: "Description",
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
          .map((uuid) => fromUuidSync(uuid))
          .filter((t) => t);
        if (tokenDocs.length > 0) {
          /** @type {Teriock.MessageData.MessageAssociation} */
          const association = {
            title: "Associated Creatures",
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
