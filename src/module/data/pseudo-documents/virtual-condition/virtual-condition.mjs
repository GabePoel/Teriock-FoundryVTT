import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { dotJoin, toId } from "../../../helpers/string.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @implements {Teriock.Embeds.Embeddable}
 * @todo Rename to `TrackedCondition`.
 */
export default class VirtualCondition extends BasePseudoDocument {
  static #ALLOWED_STATUSES;

  static get ALLOWED_STATUSES() {
    if (!this.#ALLOWED_STATUSES) { this.#ALLOWED_STATUSES = new Set(Object.keys(TERIOCK.statuses.conditions)); }
    return this.#ALLOWED_STATUSES;
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "VirtualCondition" });
  }

  /**
   * Add a virtual condition to an Actor.
   * @param {TeriockActor} actor
   * @param {Teriock.Keys.Condition} status
   * @param {TeriockDocument|string} source
   * @returns {VirtualCondition|null}
   */
  static addVirtualCondition(actor, status, source) {
    if (!this.ALLOWED_STATUSES.has(status)) { return null; }
    const conditionId = toId(status, { hash: false });
    let condition = actor.system.virtualConditions.get(conditionId);
    if (!condition) {
      condition = new VirtualCondition({ _id: conditionId, status }, { parent: actor.system });
      actor.system.virtualConditions.set(conditionId, condition);
    }
    if (source) {
      condition.addSource(source);
    }
    return condition;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      status: new fields.StringField({
        choices: TERIOCK.reference.conditions,
        initial: Object.keys(TERIOCK.reference.conditions)[0],
        label: "TERIOCK.COMMON.Condition",
        required: true,
      }),
    });
  }

  /** @type {Set<TeriockDocument>} */
  #sourceDocuments = new Set();

  /** @type {Set<string>} */
  #sourceNames = new Set();

  /** @inheritDoc */
  get _embedActions() {
    return { openDoc: { primary: async () => this.openCondition() } };
  }

  /** @returns {Partial<Teriock.Embeds.EmbedIcon>[]} */
  get _embedIcons() {
    const icons = [];
    if (this.locked) {
      icons.push({ icon: TERIOCK.display.icons.ui.locked, tooltip: _loc("SIDEBAR.PLACEABLES.ACTIONS.Locked") });
    }
    return icons;
  }

  /** @inheritDoc */
  get embedParts() {
    return {
      draggable: false,
      icons: this._embedIcons,
      identifier: this.typedIdentifier,
      img: this.img,
      openable: true,
      subtitle: _loc("TYPES.ActiveEffect.condition"),
      text: dotJoin(Array.from(this.sourceNames)),
      title: this.name,
      uuid: this.uuid,
    };
  }

  /**
   * An image for this condition.
   * @returns {Teriock.System.ImageString}
   */
  get img() {
    return TERIOCK.statuses.conditions[this.status]?.img;
  }

  /**
   * Whether this condition is locked.
   * @returns {boolean}
   */
  get locked() {
    return this.#sourceNames.size > 0 || this.#sourceDocuments.size > 1 || !this.#sourceDocuments.has(this.id);
  }

  /**
   * A name for this condition.
   * @returns {string}
   */
  get name() {
    return TERIOCK.statuses.conditions[this.status]?.name;
  }

  /**
   * The names of the sources for this condition.
   * @returns {Set<string>}
   */
  get sourceNames() {
    return new Set([
      ...Array.from(this.#sourceNames).map(n => _loc(n)),
      ...Array.from(this.#sourceDocuments).map((d) => d.fullName ?? d.name),
    ]);
  }

  /**
   * The identifier for this condition.
   * @returns {TypedIdentifier<TeriockActiveEffect<"condition">>}
   */
  get typedIdentifier() {
    return `condition:${this.status}`;
  }

  /**
   * Register something as being a source of this condition.
   * @param {TeriockDocument|string} source
   */
  addSource(source) {
    if (typeof source === "string") {
      this.#sourceNames.add(source);
    } else {
      this.#sourceDocuments.add(source);
    }
  }

  /**
   * The condition document.
   * @returns {Promise<TeriockActiveEffect>}
   */
  async getCondition() {
    let condition = this.actor.effects.get(this.id);
    if (!condition) {
      condition = teriock.fromIdentifier(this.typedIdentifier);
    }
    return condition;
  }

  /** @inheritDoc */
  getEmbedContextMenuEntries(_relative) {
    return [{
      group: "open",
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
      onClick: async () => await this.openSource(),
      visible: () => this.#sourceDocuments.size > 0,
    }];
  }

  /**
   * @inheritDoc
   * @todo Remove duplicated {@link BaseAffinity} code
   */
  onEmbed(element) {
    const menuEntries = this.getEmbedContextMenuEntries();
    if (!menuEntries.length) {
      return;
    }
    element.addEventListener("contextmenu", (event) => {
      const action = /** @type {HTMLElement} */ (event.target).closest("[data-action]")?.dataset.action;
      if (action && action === this.embedParts.action) {
        event.stopImmediatePropagation();
      }
    });
    new TeriockContextMenu(element, ".teriock-block", menuEntries, {
      eventName: "contextmenu",
      fixed: true,
      jQuery: false,
    });
  }

  /**
   * Open the sheet for this condition.
   * @returns {Promise<void>}
   */
  async openCondition() {
    const condition = await this.getCondition();
    if (condition) {
      await condition.sheet?.render(true);
    }
  }

  /**
   * Open a source of this condition.
   * @returns {Promise<void>}
   */
  async openSource() {
    const source = await DocumentSelector.selectSingle(this.#sourceDocuments.filter((d) => d?.isViewer), {
      hint: _loc("TERIOCK.DIALOGS.Select.Source.hint"),
      openable: true,
      title: "TERIOCK.DIALOGS.Select.Source.title",
    });
    await source?.sheet?.render(true);
  }

  /**
   * Get a tooltip for this condition.
   * @returns {Promise<*>}
   * @todo Implement full panel handling with associated source documents, etc.
   */
  async toTooltip() {
    const condition = await this.getCondition();
    if (condition) { return condition.toTooltip(); }
  }
}
