import { DocumentSelector } from "../../../../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetSidebarPart(Base) {
  /** @mixin */
  class PlayableActorSheetSidebarPart extends Base {
    /**
     * Increases cover by a step.
     * @param {PointerEvent} event
     * @returns {Promise<void>}
     */
    static async #onIncreaseCover(event) {
      if (!game.teriock.checkEditable(this)) { return; }
      if (event.button === 0) {
        if (this.document.system.cover < 3) { await this.document.run("cover"); }
        else { await this.document.run("uncover", { amount: 3 }); }
      } else if (event.button === 2) {
        if (this.document.system.cover > 0) { await this.document.run("uncover"); }
        else { await this.document.run("cover", { amount: 3 }); }
      }
    }

    /**
     * Opens the sheet of some `data-wielding` armament.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onOpenWielder(_event, target) {
      await this.document.system.wielding[target.dataset.wielding]?.sheet.render(true);
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onQuickUse(event, target) {
      const id = target.dataset.id;
      const item = this.document.items.get(id);
      const options = { event };
      if (target.dataset.dealCommands === "false") { options.dealCommands = false; }
      if (target.dataset.dealCommands === "true") { options.dealCommands = true; }
      if (item) { await item.use(options); }
    }

    /**
     * Reset attack penalty to zero.
     * @returns {Promise<void>}
     */
    static async #onResetAttackPenalty() {
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({ "system.attackPenalty": 0 });
    }

    /**
     * Rolls a feat save.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onRollFeatSave(event, target) {
      await this.actor.run("feat", { attribute: target.dataset.attribute, event });
    }

    /**
     * Select some `data-wielding` armament.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onSelectWielder(event, target) {
      const role = target.dataset.wielding;
      const current = this.document.system.wielding[role];
      if (event.button === 2 || !this.isEditable) {
        await current?.sheet.render(true);
        return;
      }
      const field = this.document.system.schema.getField(["wielding", role]);
      const selected = await DocumentSelector.selectSingle(
        this.document.previewedTags.armament.filter(a => field.filter(a, this.document.system)),
        {
          auto: false,
          checked: current?.uuid,
          hint: _loc(`TERIOCK.SHEETS.Actor.ACTIONS.Select${role.capitalize()}.hint`),
          nullable: true,
          openable: true,
          textKey: role === "attacker" ? "system.summarizedAttack" : "system.summarizedBlock",
        },
      );
      if (selected !== false) { await this.document.update({ [`system.wielding.${role}`]: selected }); }
    }

    /**
     * Toggle which image is shown.
     * @returns {Promise<void>}
     * @this {PlayableActorSheetSidebarPart}
     */
    static async #onSwitchImage() {
      if (this.#imageToDisplay === "actor") {
        this.#imageToDisplay = "token";
      } else {
        this.#imageToDisplay = "actor";
      }
      await this.render({ parts: ["sidebar"] });
    }

    /**
     * Toggles if the character still has a reaction.
     * @returns {Promise<void>}
     */
    static async #onToggleReaction() {
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({
        "system.reactions": combatant.system.reactions ? 0 : TERIOCK.CONFIG.combat.maxReactions,
      });
    }

    /**
     * Toggles whether the prototype token has a ring.
     * @returns {Promise<void>}
     */
    static async #onToggleRing() {
      if (this.document.token) {
        await this.document.token.update({ "ring.enabled": !this.document.token._source.ring.enabled });
        await this.render({ parts: ["sidebar"] });
      } else {
        await this.document.update({
          "prototypeToken.ring.enabled": !this.document._source.prototypeToken.ring.enabled,
        });
      }
    }

    /**
     * Toggles the style bonus (sb) state.
     * @returns {Promise<void>}
     */
    static async #onToggleSb() {
      if (!game.teriock.checkEditable(this)) { return; }
      await this.document.update({ "system.offense.sb": !this.document._source.system.offense.sb });
    }

    /**
     * Use the specified ability.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onUseAbility(event, target) {
      await this.document.useDocument(target.dataset.ability, { event });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        increaseCover: { buttons: [0, 2], handler: this.#onIncreaseCover },
        openWielder: this.#onOpenWielder,
        quickUse: { buttons: [0, 2], handler: this.#onQuickUse },
        resetAttackPenalty: { buttons: [2], handler: this.#onResetAttackPenalty },
        rollFeatSave: { buttons: [0, 2], handler: this.#onRollFeatSave },
        selectWielder: { buttons: [0, 2], handler: this.#onSelectWielder },
        switchImage: this.#onSwitchImage,
        toggleReaction: this.#onToggleReaction,
        toggleRing: this.#onToggleRing,
        toggleSb: this.#onToggleSb,
        useAbility: { buttons: [0, 2], handler: this.#onUseAbility },
      },
    };

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      sidebar: { scrollable: [".actor-sidebar"], template: "teriock/sheets/actors/parts/sidebar" },
    };

    /** @type {"actor"|"token"} */
    #imageToDisplay = "actor";

    /**
     * Update the default combatant from an input without submitting the actor form.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    async #onChangeCombatantInput(event) {
      event.stopPropagation();
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      const input = /** @type {HTMLInputElement} */ (event.currentTarget);
      await combatant.update({ [input.dataset.name]: Number(input.value) });
    }

    /**
     * Tooltip to display for the current image.
     * @returns {string}
     */
    get displayedImgTooltip() {
      if (this.#imageToDisplay === "actor") { return _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgActor"); }
      return this.imgToken.ring.enabled
        ? _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgRing")
        : _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Avatar.imgToken");
    }

    /**
     * Path to the current image being edited.
     * @returns {string}
     */
    get editableImgPath() {
      if (this.#imageToDisplay === "actor") { return "img"; }
      return this.imgToken.ring.enabled
        ? `${this.tokenPrefix}.ring.subject.texture`
        : `${this.tokenPrefix}.texture.src`;
    }

    /**
     * The token with the image to edit.
     * @returns {TeriockTokenDocument}
     */
    get imgToken() {
      return this.document.token ?? this.document.prototypeToken;
    }

    /**
     * A prefix for image paths.
     * @returns {string}
     */
    get tokenPrefix() {
      return this.document.token ? "token" : "prototypeToken";
    }

    /** @inheritDoc */
    _attachPartListeners(partId, htmlElement, options) {
      super._attachPartListeners(partId, htmlElement, options);
      if (partId !== "sidebar") { return; }
      for (const input of htmlElement.querySelectorAll(".actor-combatant-input")) {
        input.addEventListener("change", this.#onChangeCombatantInput.bind(this));
      }
    }

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "sidebar") { return context; }
      Object.assign(context, {
        displayedImg: foundry.utils.getProperty(this.document, this.editableImgPath)
          || foundry.utils.getProperty(this.document, `${this.tokenPrefix}.texture.src`),
        displayedImgDocument: this.#imageToDisplay,
        displayedImgIcon: this.#imageToDisplay === "actor"
          ? teriock.data.systems.actors.PlayerCharacterSystem.metadata.icon
          : TERIOCK.DISPLAY.icons.manifest.document.token,
        displayedImgRing: this.#imageToDisplay === "token" && this.imgToken.ring.enabled,
        displayedImgTooltip: this.displayedImgTooltip,
        editableImgPath: this.editableImgPath,
        enrichedStyleDescription: await this._enrich(this.document.system.wielding.attacker?.system?.styleDescription),
        takeStatButtons: true,
      });
      const combatant = this.document.defaultCombatant;
      context.inCombat = Boolean(combatant);
      if (context.inCombat) {
        Object.assign(context, {
          actions: combatant.system.actions,
          attackPenalty: combatant.system.attackPenalty,
          combatantFields: combatant.system.schema.fields,
          reactions: combatant.system.reactions,
        });
      }
      const index = game.packs.get("teriock.player").index;
      context.attributeMacros = Object.fromEntries(
        Object.keys(TERIOCK.CONFIG.attribute).map(
          att => [att, index.getName(`Make ${att.toUpperCase()} Feat Save`)?.uuid]
        ),
      );
      const competenceIconClass = level =>
        TERIOCK.CONFIG.competence.levels[Math.clamp(level ?? 0, 0, 2)].simpleIconClass;
      context.attributeDisplay = Object.fromEntries(
        Object.keys(TERIOCK.CONFIG.attribute).map(key => {
          const attribute = this.document.system.attributes[key];
          const source = this.document.system._source.attributes[key];
          return [key, {
            competenceIconClass: competenceIconClass(attribute?.competence?.raw),
            sourceCompetenceIconClass: competenceIconClass(source?.competence?.raw),
          }];
        }),
      );
      return context;
    }
  }

  return PlayableActorSheetSidebarPart;
}
