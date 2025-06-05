import { buildMessage } from "../logic/messages/build.mjs";
import { evaluateSync } from "../helpers/utils.mjs";
import { fetchWikiPageHTML, openWikiPage } from "../helpers/wiki.mjs";
import { makeRoll } from "../logic/rollers/roller.mjs";

export const TeriockDocument = (Base) => class TeriockDocument extends Base {

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.system?.consumable) {
      if (this.system?.maxQuantityRaw) {
        this.system.maxQuantity = evaluateSync(this.system.maxQuantityRaw, this.getActor().getRollData());
      }
      this.system.quantity = Math.min(this.system.maxQuantity || 0, this.system.quantity || 0);
    }
  }

  async parse(rawHTML) {
    return {
      "this.system.description": "Description.",
    }
  }

  async chat() {
    let content = await this.buildMessage();
    content = `<div class="teriock">${content}</div>`;
    await ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
    });
  }

  async chatImage() {
    const img = this.img;
    if (img) {
      await ChatMessage.create({
        content: `<div class="timage" data-src="${img}" style="display: flex; justify-content: center;"><img src="${img}" alt="${this.name}" class="teriock-image"></div>`,
        speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
      });
    }
  }

  async roll(options) {
    if (['ability', 'equipment', 'resource', 'fluency'].includes(this.type)) {
      await makeRoll(this, options);
    } else {
      await this.chat();
    }
    this.useOne();
  }

  async secretRoll(options) {
    if (['ability', 'equipment', 'resource', 'fluency'].includes(this.type)) {
      await secretRoll(this, options);
    } else {
      await this.chat();
    }
    this.useOne();
  }

  async useOne() {
    if (this.system.consumable) {
      const quantity = this.system.quantity;
      await this.update({
        'system.quantity': Math.max(0, quantity - 1),
      });
      if (this.system.quantity <= 0 && this.type === 'equipment') {
        await this.unequip();
      } else if (this.system.quantity <= 0 && this.type === 'resource') {
        await this.setForceDisabled(true);
      }
    }
  }

  async gainOne() {
    if (this.system.consumable) {
      let quantity = this.system.quantity;
      let maxQuantity = this.system.maxQuantity;
      if (maxQuantity) {
        quantity = Math.min(maxQuantity, quantity + 1);
      } else {
        quantity = Math.max(0, quantity + 1);
      }
      await this.update({
        'system.quantity': quantity,
      });
      if (this.type === 'resource') {
        await this.setForceDisabled(false);
      }
    }
  }

  async buildMessage(options = {}) {
    return buildMessage(this, options).outerHTML;
  }

  getWikiPage() {
    if (this.system.wikiNamespace) {
      let pageTitle = this.system.wikiNamespace + ':';
      if (this.type === 'rank') {
        pageTitle = pageTitle + CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name;
      } else if (this.type === 'equipment') {
        pageTitle = pageTitle + this.system.equipmentType;
      } else {
        pageTitle = pageTitle + this.name;
      }
      return pageTitle;
    }
    return null;
  }

  async wikiPull() {
    if (this.system.wikiNamespace) {
      const pageTitle = this.getWikiPage();
      const wikiPage = await fetchWikiPageHTML(pageTitle);
      if (wikiPage) {
        const parsed = await this.parse(wikiPage, this.document);
        await this.update(parsed);
      }
    }
  }

  async wikiOpen() {
    if (this.system.wikiNamespace) {
      const pageTitle = this.getWikiPage();
      openWikiPage(pageTitle);
    }
  }

  getActor() {
    if (this.documentName === 'Actor') {
      return this;
    } else if (this.parent?.documentName === 'Actor') {
      return this.parent;
    } else {
      return this.parent?.parent;
    }
  }
};