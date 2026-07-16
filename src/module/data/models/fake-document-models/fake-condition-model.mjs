import { toKebabCase } from "../../../helpers/string.mjs";
import { getName } from "../../../helpers/utils.mjs";
import BaseFakeDocumentModel from "./base-fake-document-model.mjs";

const { fields } = foundry.data;

/**
 * A condition an actor currently has. Conditions the actor is forced into have no effect of their own to render, so
 * they are shown as fakes; ones the actor merely carries render from their real effect.
 * @extends {BaseFakeDocumentModel}
 * @property {Teriock.Keys.Condition} conditionKey
 * @property {boolean} locked
 * @property {string} tooltip
 */
export default class FakeConditionModel extends BaseFakeDocumentModel {
  /** @inheritDoc */
  static get FAKE_NAME() {
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
   * The real condition effect on the actor, if it has one. Set by the sheet, since documents cannot live in a schema.
   * @type {TeriockCondition | null}
   */
  effect = null;

  /**
   * Something is forcing this condition, so it cannot simply be removed.
   * @inheritDoc
   */
  get _embedIcons() {
    return [
      { icon: TERIOCK.display.icons.ui.locked, tooltip: _loc("TERIOCK.SHEETS.Actor.CONDITIONS.locked") },
      ...super._embedIcons,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const color = TERIOCK.display.colors.palette.red;
    // A condition the actor merely carries renders from its own effect.
    if (!this.locked && this.effect) {
      const parts = this.effect.system.embedParts;
      return Object.assign(parts, {
        color,
        draggable: false,
        identifier: this.identifier,
        openable: false,
        // Nothing is forcing this condition, so let the effect speak for itself.
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

  /**
   * Points at the real effect when there is one, so that the preview matches the card it rendered.
   * @inheritDoc
   */
  get uuid() {
    if (!this.locked && this.effect) { return this.effect.uuid; }
    return super.uuid;
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.img ??= TERIOCK.data.conditions[this.conditionKey]?.img;
  }
}
