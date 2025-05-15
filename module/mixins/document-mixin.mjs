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
        if (this.type === 'ability' || this.type === 'equipment') {
            await makeRoll(this);
        } else {
            await this.chat();
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