import { toKebabCase } from "../../../../helpers/string.mjs";
import { getName } from "../../../../helpers/utils.mjs";
import BaseVirtualModel from "../base-virtual-model/base-virtual-model.mjs";

const { fields } = foundry.data;

/**
 * Consolidate all the sources of a condition an actor has.
 * @todo Merge with {@link ActorConditionsPartData.conditionInformation}.
 */
export default class VirtualConditionModel extends BaseVirtualModel {
  /** @inheritDoc */
  static get VIRTUAL_NAME() {
    return "Condition";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      conditionKey: new fields.StringField({ required: true }),
      locked: new fields.BooleanField(),
      tooltip: new fields.HTMLField(),
    });
  }

  /**
   * The actual condition
   * @type {TeriockActiveEffect<"condition"> | null}
   */
  effect = null;

  /** @inheritDoc */
  get _embedIcons() {
    return [
      { icon: TERIOCK.display.icons.ui.locked, tooltip: _loc("SIDEBAR.PLACEABLES.ACTIONS.Locked") },
      ...super._embedIcons,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const color = foundry.utils.Color.from(TERIOCK.display.colors.palette.red);
    // A condition the actor merely carries renders from its own effect.
    if (!this.locked && this.effect) {
      const parts = this.effect.system.embedParts;
      return Object.assign(parts, {
        color,
        draggable: false,
        identifier: this.identifier,
        openable: false,
        text: this.text || parts.text,
        uuid: this.uuid,
      });
    }
    return Object.assign(super.embedParts, { color, tooltip: this.tooltip });
  }

  /** @inheritDoc */
  get id() {
    return this.conditionKey;
  }

  /** @inheritDoc */
  get identifier() {
    return `condition:${toKebabCase(this.conditionKey)}`;
  }

  /** @inheritDoc */
  get name() {
    return getName(this.identifier);
  }

  /** @inheritDoc */
  get uuid() {
    if (!this.locked && this.effect) { return this.effect.uuid; }
    return super.uuid;
  }

  /** @inheritDoc */
  onEmbed(element) {
    if (!this.locked && this.effect) { this.effect.onEmbed(element); }
    else { super.onEmbed(element); }
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.img ??= TERIOCK.statuses.conditions[this.conditionKey]?.img;
  }
}
