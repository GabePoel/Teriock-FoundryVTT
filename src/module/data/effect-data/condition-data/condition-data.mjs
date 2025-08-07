import inCombatExpirationDialog from "../../../applications/dialogs/in-combat-expiration-dialog.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
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
 * @extends {ChildData}
 */
export default class TeriockConditionData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: false,
    namespace: "Condition",
    pageNameKey: "name",
    type: "condition",
    usable: true,
    wiki: true,
  });

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
  get useIcon() {
    return "dice-d4";
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Condition",
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

  /** @inheritDoc */
  async roll(_options) {
    await this.inCombatExpiration(true);
  }
}
