import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import { makeIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import {
  TransformationDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import { combatExpirationMethodField } from "../../shared/fields/helpers/field-builders.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";

const { fields } = foundry.data;

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockBaseEffectModel}
 * @mixes TransformationDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockConditionModel extends TransformationDataMixin(
  WikiDataMixin(TeriockBaseEffectModel),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Condition",
    type: "condition",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      expirations: new fields.SchemaField({
        combat: new fields.SchemaField({
          what: combatExpirationMethodField(),
        }),
      }),
    });
  }

  /**
   * Context menu entries to display for cards that represent the parent document.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  get cardContextMenuEntries() {
    return [
      {
        name: this.useText,
        icon: makeIcon(this.useIcon, "contextMenu"),
        callback: this.use.bind(this),
        condition: this.constructor.metadata.usable,
        group: "usage",
      },
      {
        name: "Delete",
        icon: makeIcon("trash", "contextMenu"),
        callback: async () => {
          await this.parent.parent.deleteEmbeddedDocuments(
            this.parent.documentName,
            [this.parent.id],
          );
        },
        condition: () =>
          this.parent.parent.sheet?.editable && this.parent.isOwner,
        group: "document",
      },
    ];
  }

  /**
   * A key corresponding to this condition.
   * @returns {string}
   */
  get conditionKey() {
    if (
      Object.values(TERIOCK.data.conditions)
        .map((c) => c._id)
        .includes(this.parent.id)
    ) {
      return Object.values(TERIOCK.data.conditions).find(
        (c) => c._id === this.parent.id,
      ).id;
    } else {
      return toCamelCase(this.parent.name);
    }
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      blocks: [
        {
          title: "Description",
          text: this.description,
        },
      ],
    };
  }

  /** @inheritDoc */
  get useIcon() {
    return "dice-d4";
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
  }

  async expire() {
    if (
      Object.values(TERIOCK.index.conditions).includes(this.conditionKey) &&
      this.actor
    ) {
      await this.actor.system.removeCondition(this.conditionKey);
    } else {
      await super.expire();
    }
  }

  /**
   * Trigger in-combat expiration.
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /** @inheritDoc */
  async roll(_options) {
    await this.inCombatExpiration(true);
  }
}
