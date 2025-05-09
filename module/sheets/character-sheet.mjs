const { sheets, ux, api } = foundry.applications
import { openWikiPage } from "../helpers/wiki.mjs";

export class TeriockCharacterSheet extends sheets.ActorSheet {
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
    };

    /** @override */
    async _prepareContext() {
        return {
            config: CONFIG.TERIOCK,
            editable: this.isEditable,
            actor: this.actor,
            limited: this.document.limited,
            owner: this.document.isOwner,
            system: this.actor.system,
        };
    }
}