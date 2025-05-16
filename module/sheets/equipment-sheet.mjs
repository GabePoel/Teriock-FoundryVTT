const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from "./teriock-item-sheet.mjs";
import { cleanCapitalization } from "../helpers/clean.mjs";
import { powerLevelContextMenu, fontContextMenu } from "./context-menus/equipment-context-menus.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockEquipmentSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'equipment', 'ability'],
        form: {
            submitOnChange: true,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.equipment.icon,
        },
        position: {
            width: 560,
        },
    }
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/common/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/sheets/equipment-template/equipment-template.hbs',
        }
    }

    /** @override */
    async _prepareContext() {
        const context = await super._prepareContext();
        context.enrichedSpecialRules = await this._editor(this.item.system.specialRules);
        context.enrichedDescription = await this._editor(this.item.system.description);
        context.enrichedFlaws = await this._editor(this.item.system.flaws);
        context.enrichedNotes = await this._editor(this.item.system.notes);
        context.enrichedTier = await this._editor(this.item.system.fullTier);
        context.enrichedManaStoring = await this._editor(this.item.system.manaStoring);
        return context;
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);

        if (!this.isEditable) return;

        const powerLevelContextMenuOptions = powerLevelContextMenu(this.item);
        this._connectContextMenu('.power-level-box', powerLevelContextMenuOptions, 'click');
        const fontContextMenuOptions = fontContextMenu(this.item);
        this._connectContextMenu('.ab-title', fontContextMenuOptions, 'contextmenu');
        this.element.querySelector('.equipped-box').addEventListener('click', (event) => {
            event.preventDefault();
            this.item.toggleEquipped();
        });
        this.element.querySelectorAll('.capitalization-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanCapitalization);
        });

        const html = $(this.element);
        this._activateTags(html);
        this._activateMenu(html);
    }

    _activateTags(html) {
        const equipment = this.document;
        function _connectTag(cssClass, parameter) {
            html.on('click', cssClass, (event) => {
                event.preventDefault();
                equipment.update({ [parameter]: false });
            });
        }
        this._connect('.flag-tag-dampened', 'click', (event) => {
            this.document.undampen();
        });
        this._connect('.flag-tag-shattered', 'click', (event) => {
            this.document.repair();
        });
        _connectTag('.flag-tag-glued', 'system.glued');
        this._connect('.equipment-class-tag', 'click', (event) => {
            const element = event.currentTarget.getAttribute('value');
            const equipmentClasses = this.document.system.equipmentClasses.filter(e => e !== element);
            this.document.update({ 'system.equipmentClasses': equipmentClasses });
        });
        this._connect('.property-tag', 'click', (event) => {
            const element = event.currentTarget.getAttribute('value');
            const properties = this.document.system.properties.filter(e => e !== element);
            this.document.update({ 'system.properties': properties });
        });
        this._connect('.magical-property-tag', 'click', (event) => {
            const element = event.currentTarget.getAttribute('value');
            const magicalProperties = this.document.system.magicalProperties.filter(e => e !== element);
            this.document.update({ 'system.magicalProperties': magicalProperties });
        });
        this._connect('.material-property-tag', 'click', (event) => {
            const element = event.currentTarget.getAttribute('value');
            const materialProperties = this.document.system.materialProperties.filter(e => e !== element);
            this.document.update({ 'system.materialProperties': materialProperties });
        });
    }

    _activateMenu(html) {
        const equipment = this.document;
        function _connectButton(cssClass, parameter) {
            html.on('click', cssClass, (event) => {
                event.preventDefault();
                const text = 'Insert effect here.';
                const update = {};
                update[parameter] = text;
                equipment.update(update);
            });
        }

        const menu = this.element.querySelector('.ab-menu');
        const menuToggle = this.element.querySelector('.ab-menu-toggle');
        if (menu && this._menuOpen) {
            menu.classList.add('no-transition');
            menu.classList.add('ab-menu-open');
            menu.offsetHeight;
            menu.classList.remove('no-transition');
            menuToggle.classList.add('ab-menu-toggle-open');
        }
        this.element.querySelector('.ab-menu-toggle').addEventListener('click', (event) => {
            event.preventDefault();
            console.log(this._menuOpen);
            this._menuOpen = !this._menuOpen;
            if (menu) {
                menu.classList.toggle('ab-menu-open', this._menuOpen);
                menuToggle.classList.toggle('ab-menu-toggle-open', this._menuOpen);
            }
        });
        this.element.querySelector('.shatter-checkbox').addEventListener('click', (event) => {
            event.preventDefault();
            const checkbox = event.currentTarget;
            const value = checkbox.checked;
            this.item.setShattered(value);
        });
        this.element.querySelector('.dampen-checkbox').addEventListener('click', (event) => {
            event.preventDefault();
            const checkbox = event.currentTarget;
            const value = checkbox.checked;
            this.item.setDampened(value);
        });

        _connectButton('.ab-special-rules-button', 'system.specialRules');
        _connectButton('.ab-description-button', 'system.description');
        _connectButton('.ab-flaws-button', 'system.flaws');
        _connectButton('.ab-notes-button', 'system.notes');
        _connectButton('.ab-tier-button', 'system.fullTier');
        _connectButton('.ab-mana-storing-button', 'system.manaStoring');
    }
}