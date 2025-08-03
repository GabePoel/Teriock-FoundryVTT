const { fields } = foundry.data;
import inCombatExpirationDialog from "../../../applications/dialogs/in-combat-expiration-dialog.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
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

  /**
   * Context menu entries to display for cards that represent the parent document.
   *
   * @returns {Teriock.ContextMenuEntry[]}
   */
  get cardContextMenuEntries() {
    return [
      {
        name: this.useText,
        icon: makeIcon(this.useIcon, "contextMenu"),
        callback: this.use.bind(this),
        condition: this.constructor.USABLE,
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
  get useIcon() {
    return "dice-d4";
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
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
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /**
   * Rolls the condition. Forced alias for {@link inCombatExpiration}.
   *
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll() {
    await this.inCombatExpiration(true);
  }
}
