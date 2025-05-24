const { DialogV2 } = foundry.applications.api;
import { TeriockDocument } from "../mixins/document-mixin.mjs";
import { fetchCategoryMembers } from "../helpers/wiki.mjs";
import { createAbility } from "../helpers/create-effects.mjs";
import parseEquipment from "../logic/parsers/parse-equipment.mjs";
import parseRank from "../logic/parsers/parse-rank.mjs";

/**
 * @extends {Item}
 */
export class TeriockItem extends TeriockDocument(Item) {

  async parse(rawHTML) {
    if (this.type === 'equipment') {
      return parseEquipment(rawHTML);
    } else if (this.type === 'rank') {
      return await parseRank(rawHTML, this);
    } else {
      return {};
    }
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

  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === 'pages' ? 'Ability' : 'Category';
    let toPull;
    await DialogV2.prompt({
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
      const dialog = new DialogV2({
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
