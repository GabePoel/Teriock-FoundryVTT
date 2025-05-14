import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { parse } from "../helpers/parsers/parse.mjs";
import { buildMessage } from "../helpers/message-builders/build.mjs";
import { makeRoll } from "../helpers/rollers/rolling.mjs";

/**
 * @extends {ActiveEffect}
 */
export class TeriockEffect extends ActiveEffect {
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

  _buildMessage() {
    const abilityMessage = buildMessage(this);
    return abilityMessage.outerHTML;
  }

  async share() {
    await makeRoll(this, {});
  }
}
