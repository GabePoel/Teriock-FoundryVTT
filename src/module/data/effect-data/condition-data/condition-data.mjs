import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { makeIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { combatExpirationMethodField } from "../shared/shared-fields.mjs";

const { fields } = foundry.data;

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockBaseEffectData}
 * @mixes WikiDataMixin
 */
export default class TeriockConditionData extends WikiDataMixin(
  TeriockBaseEffectData,
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
