import { TeriockDocument } from "./child-mixin.mjs";
import parse from "../logic/parsers/parse.mjs";

/**
 * @extends {ActiveEffect}
 */
export default class TeriockEffect extends TeriockDocument(ActiveEffect) {

  async parse(rawHTML) {
    return parse(rawHTML, this);
  }

  async softEnable() {
    if (!this.system.forceDisabled) {
      await this.update({ disabled: false });
    }
  }

  async softDisable() {
    await this.update({ disabled: true });
  }

  async setSoftDisabled(bool) {
    if (bool) {
      await this.softDisable();
    } else {
      await this.softEnable();
    }
  }

  async toggleSoftDisabled() {
    await this.setSoftDisabled(!this.disabled);
  }

  async setForceDisabled(bool) {
    if (bool) {
      await this.update({ disabled: true, 'system.forceDisabled': true });
      return;
    }

    const shouldEnable =
      (!this.system.consumable) ||
      (this.system.consumable && this.system.quantity >= 1);

    const disabled = this.parent?.system?.disabled ?? false;

    await this.update({
      disabled: disabled,
      'system.forceDisabled': false
    });

    if (shouldEnable && !disabled) {
      await this.update({ disabled: false, 'system.forceDisabled': false });
    }
  }

  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }

  async disable() {
    await this.setForceDisabled(true);
  }

  async enable() {
    await this.setForceDisabled(false);
  }
}
