const { sheets, ux, api } = foundry.applications
import { openWikiPage } from "../helpers/wiki.mjs";

export class TeriockCharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'character'],
        actions: {
            onEditImage: this._onEditImage,
        },
        form: {
            submitOnChange: true,
        }
    }
    static PARTS = {
        tabs: {
            template: 'templates/generic/tab-navigation.hbs',
        },
        all: {
            template: 'systems/teriock/templates/character-template.hbs',
        },
    };

    /** @override */
    async _prepareContext() {
        const allItems = this.actor.itemTypes
        return {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
            abilities: allItems.ability,
            equipment: allItems.equipment,
            fluencies: allItems.fluency,
            ranks: allItems.rank,
        };
    }
}