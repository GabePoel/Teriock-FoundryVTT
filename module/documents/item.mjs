import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { parse } from "../helpers/parsers/parse.mjs";
import { buildMessage } from "../helpers/message-builders/build.mjs";
/**
 * @extends {Item}
 */
export class TeriockItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    const rollData = { ...this.system };
    if (!this.actor) return rollData;
    rollData.actor = this.actor.getRollData();
    return rollData;
  }

  async disable() {
    if (!this.system.disabled) {
      this.update({ 'system.disabled': true });
      for (const effect of this.effects) {
        await effect.softDisable();
      }
    }
  }

  async enable() {
    if (this.system.disabled) {
      this.update({ 'system.disabled': false });
      for (const effect of this.effects) {
        await effect.softEnable();
      }
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
      await this.update({ 'system.equipped': true });
      if (!this.system.shattered) {
        await this.enable();
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

  async _wikiPull() {
    if (['ability', 'equipment', 'rank'].includes(this.type)) {
      let pageTitle = this.system.wikiNamespace + ':'
      if (this.type === 'rank') {
        pageTitle = pageTitle + CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name;
      } else if (this.type === 'equipment') {
        pageTitle = pageTitle + this.system.equipmentType;
      }
      else {
        pageTitle = pageTitle + this.name;
      }
      console.log('Fetching wiki page', pageTitle);
      const wikiContent = await fetchWikiPageHTML(pageTitle);
      if (!wikiContent) {
        return;
      }
      const changes = await parse(this, wikiContent);
      this.update(changes);
      return;
    }
  }

  _messageLabel(text, icon = null, classes = []) {
    const label = document.createElement('div');
    label.classList.add('abm-label', ...classes);
    if (icon) {
      const iconElement = document.createElement('i');
      iconElement.classList.add('fa-solid', icon);
      label.appendChild(iconElement);
    }
    label.innerHTML += text;
    return label;
  }


  async share() {
    const abilityMessage = buildMessage(this);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: document.name,
      content: abilityMessage.outerHTML,
    });
    return;
  }

  // async roll() {
  //   const speaker = ChatMessage.getSpeaker({ actor: this.parent });
  //   const rollMode = game.settings.get('core', 'rollMode');
  // }
}
