import { icons } from "../../../../constants/display/icons.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Activation that resolves a pending expiration check from a triggered chat message.
 */
export default class ExpirationActivation extends BaseActivation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Base.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: icons.pseudoDocument.expiration });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "expiration";
  }

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
  get icon() {
    return this.display.icon
      || (this.expirationDocument?.method === "roll" ? icons.ui.dice : icons.pseudoDocument.expiration);
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
  async primaryAction() {
    await this.expirationDocument?.use();
  }
}
