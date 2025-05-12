const { HandlebarsApplicationMixin } = foundry.applications.api;
import { TeriockItemSheet } from "./teriock-item-sheet.mjs";
import { cleanAv, cleanBv, cleanStr, cleanDamage, cleanCapitalization } from "../helpers/clean.mjs";
import { powerLevelContextMenu } from "./context-menus/equipment-context-menus.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockEquipmentSheet extends HandlebarsApplicationMixin(TeriockItemSheet) {
    static DEFAULT_OPTIONS = {
        classes: ['teriock', 'equipment', 'ability'],
        actions: {
            onEditImage: this._onEditImage,
            onChat: this._onChat,
            createAbility: this._createAbility,
        },
        form: {
            submitOnChange: true,
        },
        window: {
            // resizable: true,
            icon: "fa-solid fa-" + documentOptions.equipment.icon,
        }
    }
    static PARTS = {
        header: {
            template: 'systems/teriock/templates/parts/header.hbs',
        },
        all: {
            template: 'systems/teriock/templates/equipment-template.hbs',
        }
    }

    /** @override */
    constructor(...args) {
        super(...args);
        this._menuOpen = false;
    }

    /** @override */
    async _prepareContext() {
        const context = await super._prepareContext();
        context.enrichedSpecialRules = await this._editor(this.item.system.specialRules);
        context.enrichedDescription = await this._editor(this.item.system.description);
        return context;
    }

    static async _onChat(event, target) {
        this.item.share();
    }

    /** @override */
    _onRender(context, options) {
        super._onRender(context, options);
        const powerLevelContextMenuOptions = powerLevelContextMenu(this.item);
        this._connectContextMenu('.power-level-box', powerLevelContextMenuOptions, 'click');
        this.element.querySelector('.equipped-box').addEventListener('click', (event) => {
            event.preventDefault();
            this.item.toggleDisabled();
        });
        this.element.querySelectorAll('.av-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanAv);
        });
        this.element.querySelectorAll('.bv-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanBv);
        });
        this.element.querySelectorAll('.str-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanStr);
        });
        this.element.querySelectorAll('.damage-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanDamage);
        });
        this.element.querySelectorAll('.capitalization-input').forEach((element) => {
            this._connectInput(element, element.getAttribute('name'), cleanCapitalization);
        });
        this._activateMenu(this.element);
    }

    _activateMenu(html) {
        const ability = this.document;
        function _connectButton(cssClass, parameter) {
            html.on('click', cssClass, (event) => {
                event.preventDefault();
                const text = 'Insert effect here.';
                const update = {};
                update[parameter] = text;
                ability.update(update);
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
            console.log('Menu toggle clicked');
            console.log(this._menuOpen);
            this._menuOpen = !this._menuOpen;
            if (menu) {
                console.log('Menu open:', this._menuOpen);
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
    }
}