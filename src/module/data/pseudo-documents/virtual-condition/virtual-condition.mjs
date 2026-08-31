import { Panel } from "../_module.mjs";
import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { dotJoin, toId } from "../../../helpers/string.mjs";
import { EmbeddableDataMixin, PanelDataMixin, UsableDataMixin } from "../../mixins/_module.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @todo Rename to `TrackedCondition`.
 * @mixes PanelData
 * @mixes UsableData
 * @mixes EmbeddableData
 */
export default class VirtualCondition
  extends mixClasses(BasePseudoDocument, PanelDataMixin, UsableDataMixin, EmbeddableDataMixin)
{
  static #ALLOWED_STATUSES;

  static get ALLOWED_STATUSES() {
    if (!this.#ALLOWED_STATUSES) { this.#ALLOWED_STATUSES = new Set(Object.keys(TERIOCK.statuses.conditions)); }
    return this.#ALLOWED_STATUSES;
  }

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.document.ExpirationExecution;
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

  /**
   * @inheritDoc
   * @todo Deal with this duplicated code.
   */
  get _embedActions() {
    return Object.assign(super._embedActions, {
      useDoc: {
        primary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
        secondary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
      },
    });
  }

  /** @returns {Partial<Teriock.Embeds.EmbedIcon>[]} */
  get _embedIcons() {
    const icons = [];
    if (this.locked) {
      icons.push({ icon: TERIOCK.display.icons.ui.locked, tooltip: _loc("SIDEBAR.PLACEABLES.ACTIONS.Locked") });
    } else {
      icons.push({ icon: TERIOCK.display.icons.ui.unlocked, tooltip: _loc("SIDEBAR.PLACEABLES.ACTIONS.Unlocked") });
    }
    return icons;
  }

  /**
   * A color for this.
   * @returns {Color}
   */
  get color() {
    return foundry.utils.Color.from(TERIOCK.display.colors.palette.red);
  }

  /** @inheritDoc */
  get embedParts() {
    return {
      action: this.statusEffect ? "useDoc" : undefined,
      color: this.color,
      draggable: false,
      icons: this._embedIcons,
      identifier: this.typedIdentifier,
      img: this.img,
      openable: true,
      subtitle: _loc("TYPES.ActiveEffect.condition"),
      text: dotJoin(Array.from(this.sourceNames)),
      title: this.name,
      usable: Boolean(this.statusEffect),
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
    return this.#sourceNames.size > 0 || this.#sourceDocuments.size > 1
      || (this.#sourceDocuments.size === 1 && !this.statusEffect);
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
   * The associated status ActiveEffect.
   * @returns {TeriockActiveEffect<"condition"> | null}
   */
  get statusEffect() {
    return this.actor?.effects.get(this.id) ?? null;
  }

  /**
   * The identifier for this condition.
   * @returns {TypedIdentifier<TeriockActiveEffect<"condition">>}
   */
  get typedIdentifier() {
    return `condition:${this.status}`;
  }

  /** @inheritDoc */
  async _use(data = {}, options = {}) {
    if (!this.statusEffect) { return; }
    return super._use(data, Object.assign(options, { source: this.statusEffect }));
  }

  /**
   * Register something as being a source of this condition.
   * @param {TeriockDocument|string} source
   */
  addSource(source) {
    if (typeof source === "string") { this.#sourceNames.add(source); }
    else { this.#sourceDocuments.add(source); }
  }

  /**
   * The condition document.
   * @returns {Promise<TeriockActiveEffect<"condition">>}
   */
  async getCondition() {
    return this.statusEffect ?? await teriock.fromIdentifier(this.typedIdentifier);
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

  /** @inheritDoc */
  async getPanelParts() {
    // TODO: Add named sources to the associations list?
    const effect = await this.getCondition();
    const trackers = await this.getTrackers();
    return Object.assign(await effect?.getPanelParts?.() ?? {}, {
      associations: [
        Panel.toAssociation(
          Array.from(this.#sourceDocuments),
          _loc("TERIOCK.SHEETS.DocumentSettings.FIELDS.sources.legend"),
          TERIOCK.display.icons.ui.document,
        ),
        Panel.toAssociation(trackers, undefined, TERIOCK.display.icons.ability.target),
      ],
      color: this.color,
      icon: TERIOCK.config.document.condition.icon,
      img: this.img,
      name: this.name,
    });
  }

  /**
   * A temporary stop-gap to connect the old trackers schema to VirtualConditions until I make a better solution.
   * @deprecated
   * @returns {Promise<TeriockDocument[]>}
   */
  async getTrackers() {
    return Promise.all(
      Array.from(this.actor.system?.conditionInformation[this.status]?.trackers ?? []).map(uuid => fromUuid(uuid)),
    );
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
}
