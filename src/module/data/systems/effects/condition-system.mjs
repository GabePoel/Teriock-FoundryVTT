import { makeIcon, mergeMetadata, mixClasses, objectMap } from "../../../utils/_module.mjs";
import { TransformationSystemMixin, WikiSystemMixin } from "../mixins/_module.mjs";
import { ApplicableEffectSystem } from "./abstract/_module.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
 */

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {ApplicableEffectSystem}
 * @mixes WikiSystem
 * @mixes TransformationSystem
 */
export default class ConditionSystem
  extends mixClasses(ApplicableEffectSystem, WikiSystemMixin, TransformationSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["species"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.condition,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.condition,
    initialKind: "flaw",
    type: "condition",
  });

  /** @inheritDoc */
  get _embedIcons() {
    return [{
      action: "removeConditionDoc",
      icon: "mdi-dice-d4",
      tooltip: _loc("TERIOCK.SYSTEMS.Condition.EMBED.rollToRemove"),
      visible: true,
      onClick: async () => this.parent.use(),
    }];
  }

  /**
   * A key corresponding to this condition.
   * @returns {string|null}
   */
  get conditionKey() {
    return foundry.utils.invertObject(objectMap(TERIOCK.STATUSES.conditions, (c) => c._id))[this.parent.id] ?? null;
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: "" });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    // If this is a known condition, have it use the static ID.
    if (data?.system?.identifier && Object.hasOwn(TERIOCK.STATUSES.conditions, data.system.identifier)) {
      options.keepId = true;
    }
    if (data.disabled === true) { return false; }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (changes.disabled === true) { return false; }
  }

  /** @inheritDoc */
  async expire(options = {}) {
    const actor = this.actor;
    const key = this.conditionKey;
    const expired = await super.expire(options);
    if (expired) { await actor?.toggleStatusEffect(key, { active: false }); }
    return expired;
  }

  /** @inheritDoc */
  getEmbedContextMenuEntries(_doc) {
    return /** @type {ContextMenuEntry[]} */ ([{
      group: "usage",
      icon: makeIcon(this.useIcon, "contextMenu"),
      label: this.useText,
      onClick: this.use.bind(this),
      visible: this.parent.isOwner,
    }]);
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.parent.disabled = false;
  }
}
