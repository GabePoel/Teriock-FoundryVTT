import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { buildMessage } from "../helpers/message-builders/build.mjs";
import { makeRoll } from "../helpers/rollers/rolling.mjs";

export const TeriockDocument = (Base) => class TeriockDocument extends Base {

    async parse(rawHTML) {
        return {
            'system.description': rawHTML,
        }
    }

    async chat() {
        ChatMessage.create({
            content: await this.buildMessage(),
            speaker: ChatMessage.getSpeaker({ actor: this.getActor() }),
        });
    }

    async roll() {
        if (['ability', 'equipment', 'resource'].includes(this.type)) {
            await makeRoll(this);
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

    async buildMessage() {
        return buildMessage(this).outerHTML;
    }

    async wikiPull() {
        if (this.system.wikiNamespace) {
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
            const wikiHTML = await fetchWikiPageHTML(pageTitle);
            if (!wikiHTML) {
                return;
            }
            const changes = await this.parse(wikiHTML);
            console.log('Parsed wiki page', changes);
            if (changes) {
                await this.update(changes);
            }
            return;
        }
    }

    getActor() {
        if (this.documentName === 'Actor') {
            return this;
        } else if (this.parent.documentName === 'Actor') {
            return this.parent;
        } else {
            return this.parent.parent;
        }
    }
};