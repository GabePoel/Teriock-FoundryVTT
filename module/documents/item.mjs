const { api, ux } = foundry.applications;
import { createAbility } from "../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../helpers/wiki.mjs";
import { TeriockChild } from "./child-mixin.mjs";
import { toCamelCase } from "../helpers/utils.mjs";
import parse from "../logic/parsers/parse.mjs";

/**
 * @extends {Item}
 */
export default class TeriockItem extends TeriockChild(Item) {

  async parse(rawHTML) {
    return parse(rawHTML, this);
  }

  async disable() {
    if (!this.system.disabled) {
      this.update({ 'system.disabled': true });
      const updates = this.effects.map((effect) => {
        return { _id: effect._id, disabled: true };
      });
      this.updateEmbeddedDocuments('ActiveEffect', updates);
    }
  }

  async enable() {
    if (this.system.disabled) {
      this.update({ 'system.disabled': false });
      const toUpdate = this.effects.filter((effect) => !effect.system.forceDisabled);
      const updates = toUpdate.map((effect) => {
        return { _id: effect._id, disabled: false };
      });
      this.updateEmbeddedDocuments('ActiveEffect', updates);
    }
  }

  async setDisabled(bool) {
    if (bool) {
      await this.disable();
    } else {
      await this.enable();
    }
  }

  async toggleDisabled() {
    await this.setDisabled(!this.system.disabled);
  }

  async shatter() {
    if (this.type === 'equipment') {
      await this.update({ 'system.shattered': true });
      await this.disable();
    }
  }

  async repair() {
    if (this.type === 'equipment') {
      await this.update({ 'system.shattered': false });
      if (this.system.equipped) {
        await this.enable();
      }
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
    if (this.type === 'equipment') {
      await this.update({ 'system.dampened': true });
      await this.disable();
    }
  }

  async undampen() {
    if (this.type === 'equipment') {
      await this.update({ 'system.dampened': false });
      if (this.system.equipped) {
        await this.enable();
      }
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
    if (this.type === 'equipment') {
      await this.update({ 'system.equipped': false });
      await this.disable();
    }
  }

  async equip() {
    if (this.type === 'equipment') {
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
  }

  async setEquipped(bool) {
    if (bool) {
      await this.equip();
    } else {
      await this.unequip();
    }
  }

  async toggleEquipped() {
    if (this.type === 'equipment') {
      if (this.system.equipped) {
        await this.unequip();
      } else {
        await this.equip();
      }
    }
  }

  async duplicate() {
    const copy = foundry.utils.duplicate(this);
    const copyDocument = await this.parent.createEmbeddedDocuments(this.documentName, [copy]);
    return copyDocument[0];
  }

  async unidentify() {
    if (this.type === 'equipment' && this.system.identified) {
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
    if (this.type === 'equipment' && this.system.reference && !this.system.identified) {
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
    if (this.type === 'equipment' && this.system.reference && !this.system.identified) {
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

  _buildEffectTypes() {
    const effectTypes = {};
    const effectKeys = {};
    for (const effect of this.transferredEffects) {
      const type = effect.type;
      if (!effectTypes[type]) effectTypes[type] = [];
      if (!effectKeys[type]) effectKeys[type] = new Set();
      effectTypes[type].push(effect);
      effectKeys[type].add(toCamelCase(effect.name));
    }
    return { effectTypes, effectKeys };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const { effectTypes, effectKeys } = this._buildEffectTypes();
    this.effectTypes = effectTypes;
    this.effectKeys = effectKeys;
  }

  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === 'pages' ? 'Ability' : 'Category';
    let toPull;
    await api.DialogV2.prompt({
      window: { title: 'Pulling ' + pullTypeName },
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        label: "Pull",
        callback: (event, button, dialog) => {
          let input = button.form.elements.pullInput.value
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        }
      }
    })
    const pages = await fetchCategoryMembers(toPull);
    for (const page of pages) {
      if (page.title.startsWith('Ability:')) {
        createAbility(this, page.title.replace(/^Ability:/, ''));
      }
    }
  }

  async _bulkWikiPull() {
    if (['ability', 'equipment', 'rank', 'power'].includes(this.type)) {
      const dialog = new api.DialogV2({
        window: { title: 'Bulk Wiki Pull' },
        content: 'What would you like to pull?',
        buttons: [{
          action: 'pages',
          label: 'Page',
          default: true,
        }, {
          action: 'categories',
          label: 'Category',
          default: false,
        }],
        submit: async (result) => this._bulkWikiPullHelper(result),
      });
      await dialog.render(true);
    }
  }

  async rollResourceDie(type) {
    if (this.type !== 'rank') return;
    const dieKey = type === 'hit' ? 'hitDie' : 'manaDie';
    const spentKey = type === 'hit' ? 'hitDieSpent' : 'manaDieSpent';
    const resourceKey = type === 'hit' ? 'hp' : 'mp';
    if (this.system[spentKey]) return;

    const die = this.system[dieKey];
    const roll = new Roll(die);
    await roll.evaluate({ async: true });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${type === 'hit' ? 'Hit' : 'Mana'} Die`,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rollMode: game.settings.get("core", "rollMode"),
      create: true,
    });
    await this.update({ [`system.${spentKey}`]: true });
    await this.actor.update({
      [`system.${resourceKey}.value`]: Math.min(
        this.actor.system[resourceKey].max,
        this.actor.system[resourceKey].value + roll.total
      ),
    });
  }

  async rollHitDie() {
    return this.rollResourceDie('hit');
  }

  async rollManaDie() {
    return this.rollResourceDie('mana');
  }
}
