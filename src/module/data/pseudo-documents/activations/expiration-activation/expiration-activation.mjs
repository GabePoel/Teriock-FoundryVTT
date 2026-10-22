import { mergeMetadata } from "../../../../utils/_module.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Activation that resolves a pending expiration check from a triggered chat message.
 */
export default class ExpirationActivation extends BaseActivation {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.pseudoDocument.expiration,
    type: "expiration",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { expiration: new fields.StringField() });
  }

  /**
   * The expiration this resolves.
   * @returns {BaseExpiration|null}
   */
  get expirationDocument() {
    return fromUuidSync(this.expiration) ?? null;
  }

  /** @inheritDoc */
  get label() {
    return this.display.label
      || _loc(
        this.expirationDocument?.method === "roll"
          ? "TERIOCK.EXPIRATIONS.Base.EXECUTION.roll"
          : "TERIOCK.EXPIRATIONS.Base.EXECUTION.expire",
      );
  }

  /** @inheritDoc */
  get typeIcon() {
    return this.display.icon
      || (this.expirationDocument?.method === "roll"
        ? TERIOCK.DISPLAY.icons.manifest.ui.dice
        : TERIOCK.DISPLAY.icons.manifest.pseudoDocument.expiration)
      || this.metadata.icon;
  }

  /** @inheritDoc */
  async primaryAction() {
    await this.expirationDocument?.use();
  }
}
