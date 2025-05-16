const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from "./teriock-item-sheet.mjs";
import { cleanCapitalization } from "../helpers/clean.mjs";
import { powerLevelContextMenu, fontContextMenu } from "./context-menus/equipment-context-menus.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockEquipmentSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['equipment'],
        actions: {
            toggleEquipped: this._toggleEquipped,
            toggleShattered: this._toggleShattered,
            toggleDampened: this._toggleDampened,
        },
        window: {
            icon: `fa-solid fa-${documentOptions.equipment.icon}`,
        },
    };

    static PARTS = {
        header: { template: 'systems/teriock/templates/common/header.hbs' },
        all: { template: 'systems/teriock/templates/sheets/equipment-template/equipment-template.hbs' },
    };

    static async _toggleEquipped() {
        this.document.toggleEquipped();
    }

    static async _toggleShattered() {
        this.document.toggleShattered();
    }

    static async _toggleDampened() {
        this.document.toggleDampened();
    }

    /** @override */
    async _prepareContext() {
        const context = await super._prepareContext();
        const { system } = this.item;

        const enrichments = {
            enrichedSpecialRules: system.specialRules,
            enrichedDescription: system.description,
            enrichedFlaws: system.flaws,
            enrichedNotes: system.notes,
            enrichedTier: system.fullTier,
            enrichedManaStoring: system.manaStoring,
        };

        for (const [key, value] of Object.entries(enrichments)) {
            context[key] = await this._editor(value);
        }

        return context;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        if (!this.isEditable) return;

        const item = this.item;

        this._connectContextMenu('.power-level-box', powerLevelContextMenu(item), 'click');
        this._connectContextMenu('.ab-title', fontContextMenu(item), 'contextmenu');

        this.element.querySelectorAll('.capitalization-input').forEach((el) => {
            this._connectInput(el, el.getAttribute('name'), cleanCapitalization);
        });

        const html = $(this.element);
        this._activateTags(html);
        const buttonMap = {
            '.ab-special-rules-button': 'system.specialRules',
            '.ab-description-button': 'system.description',
            '.ab-flaws-button': 'system.flaws',
            '.ab-notes-button': 'system.notes',
            '.ab-tier-button': 'system.fullTier',
            '.ab-mana-storing-button': 'system.manaStoring',
        };
        this._connectButtonMap(buttonMap);
    }

    _activateTags(html) {
        const doc = this.document;

        const flagTags = {
            '.flag-tag-glued': 'system.glued',
        };

        for (const [selector, path] of Object.entries(flagTags)) {
            html.on('click', selector, (e) => {
                e.preventDefault();
                doc.update({ [path]: false });
            });
        }

        const arrayTags = {
            '.equipment-class-tag': 'equipmentClasses',
            '.property-tag': 'properties',
            '.magical-property-tag': 'magicalProperties',
            '.material-property-tag': 'materialProperties',
        };

        for (const [selector, path] of Object.entries(arrayTags)) {
            this._connect(selector, 'click', (e) => {
                const val = e.currentTarget.getAttribute('value');
                const current = doc.system[path].filter((v) => v !== val);
                doc.update({ [`system.${path}`]: current });
            });
        }

        this._connect('.flag-tag-dampened', 'click', () => doc.undampen());
        this._connect('.flag-tag-shattered', 'click', () => doc.repair());
    }
}
