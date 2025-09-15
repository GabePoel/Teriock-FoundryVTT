import { createAbility } from "../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../helpers/wiki/_module.mjs";
import { ChildDocumentMixin, CommonDocumentMixin, ParentDocumentMixin } from "./mixins/_module.mjs";

const { api } = foundry.applications;
const { Item } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Item} implementation.
 * @extends {Item}
 * @mixes ChildDocumentMixin
 * @mixes ClientDocumentMixin
 * @mixes CommonDocumentMixin
 * @mixes ParentDocumentMixin
 * @property {"Item"} documentName
 * @property {EmbeddedCollection<string, TeriockEffect>} effects
 * @property {Readonly<TeriockEffect[]>} transferredEffects
 * @property {Teriock.Documents.ItemType} type
 * @property {Teriock.UUID<TeriockItem>} uuid
 * @property {TeriockBaseItemModel} system
 * @property {TeriockBaseItemSheet} sheet
 * @property {boolean} isOwner
 * @property {boolean} limited
 */
export default class TeriockItem extends ParentDocumentMixin(ChildDocumentMixin(CommonDocumentMixin(Item))) {
  /**
   * Modified to prevent {@link TeriockMechanic} and {@link TeriockWrapper} creation.
   * @inheritDoc
   * @todo Make a less destructive way to accomplish this.
   */
  static get TYPES() {
    /** @type {string[]} */
    const types = super.TYPES;
    return types.filter((t) => ![
      "mechanic",
      "wrapper",
    ].includes(t));
  }

  // noinspection ES6ClassMemberInitializationOrder
  /**
   * An object that tracks which tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides = this.overrides ?? {};

  /**
   * @inheritDoc
   * @returns {TeriockActor|null}
   */
  get actor() {
    return super.actor;
  }

  /**
   * Checks if the item is disabled.
   * @returns {boolean} True if the item is disabled, false otherwise.
   */
  get disabled() {
    return this.system.disabled;
  }

  /**
   * @inheritDoc
   * @returns {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  get metadata() {
    return /** @type {Readonly<Teriock.Documents.ItemModelMetadata>} */ super.metadata;
  }

  /**
   * @inheritDoc
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return this.transferredEffects;
  }

  /**
   * Helper method for bulk wiki pulling operations.
   * @param {string} pullType - The type of pull operation ("pages" or "categories").
   * @returns {Promise<void>} Promise that resolves when the bulk pull is complete.
   * @private
   */
  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === "pages" ? "Ability" : "Category";
    let toPull;
    await api.DialogV2.prompt({
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        callback: (_event, button) => {
          let input = button.form.elements.namedItem("pullInput").value;
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        },
        label: "Pull",
      },
      window: { title: "Pulling " + pullTypeName },
    });
    if (pullType === "categories") {
      const pages = await fetchCategoryMembers(toPull);
      const progress = ui.notifications.info(`Pulling Category:${toPull} from wiki.`, { progress: true });
      let pct = 0;
      for (const page of pages) {
        progress.update({
          message: `Pulling ${page.title} from wiki.`,
          pct: pct,
        });
        if (page.title.startsWith("Ability:")) {
          await createAbility(this, page.title.replace(/^Ability:/, ""), {
            notify: false,
          });
        }
        pct += 1 / pages.length;
        progress.update({
          message: `Pulling ${page.title} from wiki.`,
          pct: pct,
        });
      }
      progress.update({ pct: 1 });
    } else {
      await createAbility(this, toPull.replace(/^Ability:/, ""));
    }
  }

  /** @inheritDoc */
  async _preCreate(data, operations, user) {
    this.updateSource({ sort: game.time.serverTime });
    return await super._preCreate(data, operations, user);
  }

  /**
   * Get all ActiveEffects that may apply to this Item.
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  * allApplicableEffects() {
    for (const effect of this.effects) {
      if (effect.system.modifies !== this.documentName) {
        continue;
      }
      yield effect;
    }
  }

  /**
   * Apply any transformation to the Item data which are caused by ActiveEffects.
   */
  applyActiveEffects() {
    const overrides = {};

    // Organize non-disabled effects by their application priority
    const changes = [];
    for (const effect of this.allApplicableEffects()) {
      if (!effect.active) {
        continue;
      }
      changes.push(...effect.changes.map((change) => {
        const c = foundry.utils.deepClone(change);
        c.effect = effect;
        c.priority ??= c.mode * 10;
        return c;
      }));
    }
    changes.sort((a, b) => a.priority - b.priority);

    // Apply all changes
    for (const change of changes) {
      if (!change.key) {
        continue;
      }
      const changes = change.effect.apply(this, change);
      Object.assign(overrides, changes);
    }

    // Expand the set of final overrides
    this.overrides = foundry.utils.expandObject(overrides);
  }

  /**
   * Initiates a bulk wiki pull operation for supported item types.
   * @returns {Promise<void>} Promise that resolves when the bulk pull dialog is complete.
   * @deprecated
   */
  async bulkWikiPull() {
    if ([
      "ability",
      "equipment",
      "rank",
      "power",
    ].includes(this.type)) {
      const dialog = new api.DialogV2({
        buttons: [
          {
            action: "pages",
            default: true,
            label: "Page",
          },
          {
            action: "categories",
            default: false,
            label: "Category",
          },
        ],
        content: "What would you like to pull?",
        submit: async (result) => {
          await dialog.close();
          await this._bulkWikiPullHelper(result);
        },
        window: { title: "Bulk Wiki Pull" },
      });
      await dialog.render(true);
    }
  }

  /**
   * @inheritDoc
   * @param {"ActiveEffect"} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<TeriockEffect[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    this._filterDocumentCreationData(embeddedName, data);
    return await super.createEmbeddedDocuments(embeddedName, data, operation);
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    if (!this.actor || this.actor._embeddedPreparation) {
      this.applyActiveEffects();
    }
  }

  /** @inheritDoc */
  async roll(options) {
    await this.system.roll(options);
  }
}
