const { api, ux } = foundry.applications;
import { rollEquipment } from "../../logic/rollers/equipment.mjs";
import TeriockBaseItem from "./base.mjs";
import TeriockConsumableMixin from "../mixins/consumable-mixin.mjs";
import TeriockWikiMixin from "../mixins/wiki-mixin.mjs";

export default class TeriockEquipment extends TeriockWikiMixin(TeriockConsumableMixin(TeriockBaseItem)) {

  /** @override */
  getWikiPage() {
    return `Equipment:${this.system.equipmentType}`;
  }

  /** @override */
  async roll(options) {
    await rollEquipment(this, options);
  }

  async shatter() {
    await this.update({ 'system.shattered': true });
    await this.disable();
  }

  async repair() {
    await this.update({ 'system.shattered': false });
    if (this.system.equipped) {
      await this.enable();
    }
  }

  async setShattered(bool) {
    if (bool) {
      await this.shatter();
    } else {
      await this.repair();
    }
  }

  async toggleShattered() {
    await this.setShattered(!this.system.shattered);
  }

  async dampen() {
    await this.update({ 'system.dampened': true });
    await this.disable();
  }

  async undampen() {
    await this.update({ 'system.dampened': false });
    if (this.system.equipped) {
      await this.enable();
    }
  }

  async setDampened(bool) {
    if (bool) {
      await this.dampen();
    } else {
      await this.undampen();
    }
  }

  async toggleDampened() {
    await this.setDampened(!this.system.dampened);
  }

  async unequip() {
    await this.update({ 'system.equipped': false });
    await this.disable();
  }

  async equip() {
    if ((!this.consumable) || (this.system.consumable && this.system.quantity >= 1)) {
      await this.update({ 'system.equipped': true });
      if (!this.system.shattered) {
        await this.enable();
      }
      if (this.system.reference && !this.system.identified) {
        let doEquip = true;
        const ref = await foundry.utils.fromUuid(this.system.reference);
        // NOTE:Uncomment below to re-enable equip confirmation dialog for unidentified items.
        // const users = game.users.filter(u => u.active && u.isGM);
        // const referenceName = ref ? ref.name : 'Unknown';
        // let doEquip = false;
        // for (const user of users) {
        //   doEquip = await api.DialogV2.query(user, 'confirm', {
        //     title: 'Equip Item',
        //     content: `Should ${game.user.name} equip and learn the tier of unidentified ${referenceName}?`,
        //     modal: true,
        //   })
        // }
        if (doEquip && ref) {
          await this.update({
            'system.tier': ref.system.tier,
          })
        }
      }
    }
  }

  async setEquipped(bool) {
    if (bool) {
      await this.equip();
    } else {
      await this.unequip();
    }
  }

  async toggleEquipped() {
    if (this.system.equipped) {
      await this.unequip();
    } else {
      await this.equip();
    }
  }

  async unidentify() {
    if (this.system.identified) {
      const reference = this.uuid;
      const copy = await this.duplicate();
      const name = 'Unidentified ' + this.system.equipmentType;
      const description = 'This item has not been identified.';
      const effects = copy.transferredEffects;
      const unidentifiedProperties = CONFIG.TERIOCK.equipmentOptions.unidentifiedProperties;
      const idsToRemove = effects.filter(e => e.type !== 'property' || !unidentifiedProperties.includes(e.name)).map(e => e._id);
      await copy.update({
        'name': name,
        'system.reference': reference,
        'system.description': description,
        'system.powerLevel': 'unknown',
        'system.tier': 0,
        'system.identified': false,
        'system.flaws': '',
        'system.notes': '',
        'system.fullTier': '',
        'system.manaStoring': '',
        'system.font': '',
      })
      await copy.deleteEmbeddedDocuments('ActiveEffect', idsToRemove);
      await copy.unequip();
    } else if (this.type === 'equipment') {
      ui.notifications.warn("This item is already unidentified.");
    }
  }

  async readMagic() {
    if (this.system.reference && !this.system.identified) {
      const users = game.users.filter(u => u.active && u.isGM);
      let doReadMagic = false;
      const ref = await foundry.utils.fromUuid(this.system.reference);
      const referenceName = ref ? ref.name : 'Unknown';
      const referenceUuid = ref ? ref.uuid : 'Unknown';
      ui.notifications.info(`Asking GMs to approve reading magic on ${this.name}.`);
      const content = await ux.TextEditor.enrichHTML(`<p>Should ${game.user.name} read magic on @UUID[${referenceUuid}]{${referenceName}}?</p>`);
      for (const user of users) {
        doReadMagic = await api.DialogV2.query(user, 'confirm', {
          title: 'Read Magic',
          content: content,
          modal: false,
        })
      }
      if (doReadMagic) {
        if (ref) {
          await this.update({
            'system.powerLevel': ref.system.powerLevel,
          })
        }
        ui.notifications.success(`${this.name} was successfully read.`);
      } else {
        ui.notifications.error(`${this.name} was not successfully read.`);
      }
    }
  }

  async identify() {
    if (this.system.reference && !this.system.identified) {
      const users = game.users.filter(u => u.active && u.isGM);
      let doIdentify = false;
      const ref = await foundry.utils.fromUuid(this.system.reference);
      const referenceName = ref ? ref.name : 'Unknown';
      const referenceUuid = ref ? ref.uuid : 'Unknown';
      ui.notifications.info(`Asking GMs to approve identification of ${this.name}.`);
      const content = await ux.TextEditor.enrichHTML(`<p>Should ${game.user.name} identify @UUID[${referenceUuid}]{${referenceName}}?</p>`);
      for (const user of users) {
        doIdentify = await api.DialogV2.query(user, 'confirm', {
          title: 'Identify Item',
          content: content,
          modal: false,
        })
      }
      if (doIdentify) {
        const knownEffectNames = this.transferredEffects.map(e => e.name);
        const unknownEffects = ref.transferredEffects.filter(e => !knownEffectNames.includes(e.name));
        const unknownEffectData = unknownEffects.map(e => foundry.utils.duplicate(e));
        await this.createEmbeddedDocuments('ActiveEffect', unknownEffectData);
        const equipped = this.system.equipped;
        if (ref) {
          await this.update({
            'name': ref.name,
            'system': ref.system,
          })
        }
        if (equipped) {
          await this.equip();
        } else {
          await this.unequip();
        }
        ui.notifications.success(`${this.name} was successfully identified.`);
      } else {
        ui.notifications.error(`${this.name} was not successfully identified.`);
      }
    }
  }
}