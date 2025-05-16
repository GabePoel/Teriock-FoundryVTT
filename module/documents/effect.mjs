import { TeriockDocument } from "../mixins/document-mixin.mjs";
import { parseAbility } from "../helpers/parsers/parse-ability.mjs";

/**
 * @extends {ActiveEffect}
 */
export class TeriockEffect extends TeriockDocument(ActiveEffect) {

  async parse(rawHTML) {
    return parseAbility(rawHTML);
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
    } else {
      if ((!this.system.consumable) || (this.system.consumable && this.system.quantity >= 1)) {
        if (this.parent.system.disabled) {
          await this.update({ disabled: true, 'system.forceDisabled': false });
        } else {
          await this.update({ disabled: false, 'system.forceDisabled': false });
        }
      }
    }
  }

  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }
}
