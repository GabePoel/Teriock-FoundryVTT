import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { parse } from "../helpers/parsers/parse.mjs";
import { buildMessage } from "../helpers/message-builders/build.mjs";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {ActiveEffect}
 */
export class TeriockEffect extends ActiveEffect {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareDerivedData() {
    if (this.system.forceProficient) {
      this.system.proficient = true;
    } else {
      this.system.proficient = this.parent.system.proficient;
    }
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
      if (this.parent.system.disabled) {
        await this.update({ disabled: true, 'system.forceDisabled': false });
      } else {
        await this.update({ disabled: false, 'system.forceDisabled': false });
      }
    }
  }

  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }

  async _wikiPull() {
    if (['ability'].includes(this.type)) {
      let pageTitle = this.system.wikiNamespace + ':'
      if (this.type === 'rank') {
        pageTitle = pageTitle + CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name;
      } else {
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

  /**
   * Override the default update method to include additional logic.
   * @override
   */
  // async _onCreate(data, options, userId) {
  //   super._onCreate(data, options, userId);
  //   console.log(this);
  //   const img = 'systems/teriock/assets/' + this.type + '.svg';
  //   this.update({
  //     img: img,
  //   });
  //   if (['ability', 'equipment'].includes(this.type)) {
  //     await this._wikiPull();
  //   }
  // }

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

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    let label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
