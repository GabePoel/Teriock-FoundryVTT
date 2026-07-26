import { mixClasses } from "../../helpers/construction.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import { BaseApplicationMixin, DragDropApplicationMixin } from "../api/mixins/_module.mjs";
import { TeriockContextMenu } from "../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * Mixin for applications that render chat messages.
 * @template {Constructor<ApplicationV2>} T
 * @param {T} Base
 */
export default function ChatMessageConnectionMixin(Base) {
  /**
   * @extends {ApplicationV2}
   * @mixes BaseApplication
   * @mixes DragDropApplication
   * @mixin
   */
  class ChatMessageConnection extends mixClasses(Base, BaseApplicationMixin, DragDropApplicationMixin) {
    /**
     * Run an activation's primary (left-click) or secondary (right-click) action.
     * @this {ChatMessageConnection}
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {ChatMessageConnection}
     */
    static async #activateActivation(event, target) {
      /** @type {BaseActivation} */
      const activation = await fromUuid(target.dataset.uuid);
      if (!activation) { return; }
      activation.event = event;
      if (event.button === 2) { await activation.secondaryAction(); }
      else { await activation.primaryAction(); }
    }

    /**
     * Open a roll target's actor sheet.
     * @this {ChatMessageConnection}
     * @param {MouseEvent} _event
     * @param {HTMLElement} target
     */
    static async #openTargetSheet(_event, target) {
      /** @type {TeriockActor} */
      const actor = await fromUuid(target.dataset.actorUuid);
      if (actor?.isOwner) { await actor.sheet.render(true); }
    }

    /**
     * Control/release a token or pan to it.
     * @this {ChatMessageConnection}
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    static async #selectTarget(event, target) {
      /** @type {TeriockToken} */
      const token = fromUuidSync(target.dataset.tokenUuid)?.object;
      if (event.button === 0 && token.isOwner) {
        const selected = new Set(game.canvas?.tokens.controlled ?? []);
        if (selected.has(token)) { token.release(); }
        else { token.control({ releaseOthers: !event.shiftKey }); }
      } else if (event.button === 2 && token.isOwner || token.isVisible) { canvas.animatePan(token.center); }
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        activateActivation: { buttons: [0, 2], handler: this.#activateActivation, suppressContextMenu: true },
        selectTarget: { buttons: [0, 2], handler: this.#selectTarget, suppressContextMenu: false },
      },
      doubles: { openTarget: this.#openTargetSheet },
    };

    /**
     * Connect the context menu that opens openable chat message images.
     */
    #connectImageContextMenu() {
      this._createContextMenu(
        () => [{
          icon: makeIcon(TERIOCK.display.icons.ui.image, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Child.MENU.openImage",
          onClick: async (_ev, target) => {
            await new ImagePopout({
              src: target.getAttribute("src"),
              window: { title: target.getAttribute("alt") || "TERIOCK.SYSTEMS.Child.MENU.imagePreview" },
            }).render(true);
          },
          visible: target => {
            const src = target.getAttribute("src");
            return src
              && src.length
              && target.getAttribute("data-openable")
              && (game.user.isGM || game.settings.get("teriock", "openChatImages"));
          },
        }],
        "img",
        { eventName: "contextmenu", fixed: true },
      );
    }

    /**
     * Connect the context menus for roll formulas and totals.
     */
    #connectRollContextMenus() {
      const resolve = this._resolveRoll.bind(this);
      const connect = (selector, getEntries) =>
        new TeriockContextMenu(this.element, selector, [], {
          fixed: true,
          jQuery: false,
          onOpen(target) {
            const resolved = resolve(target);
            this.menuItems = resolved ? getEntries(resolved) : [];
          },
        });
      connect(".dice-formula[data-id]", ({ config, roll }) => roll._getFormulaContextOptions(config));
      connect(".dice-total[data-id]", ({ config, roll }) => roll._getTotalContextOptions(config));
    }

    /**
     * Suppress default context menus for elements that have a right click button.
     * @param {MouseEvent} event
     */
    #suppressContextMenu(event) {
      const target = /** @type {HTMLElement} */ event.target.closest("[data-action]");
      const action = target && this.options.actions[target.dataset.action];
      if (action?.suppressContextMenu || event.target.closest("[data-suppress-context-menu]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    /** @inheritDoc */
    _attachFrameListeners() {
      super._attachFrameListeners();
      this.element.addEventListener("contextmenu", this.#suppressContextMenu.bind(this));
      this.#connectImageContextMenu();
      this.#connectRollContextMenus();
    }

    /**
     * Resolve a roll from its ID in a chat message.
     * @param {HTMLElement} target
     * @returns {{ config: Teriock.Dice.RollContextMenuConfig, roll: BaseRoll }|null}
     */
    _resolveRoll(target) {
      const message = game.messages.get(target.closest("[data-message-id]")?.dataset.messageId);
      if (!message?.isContentVisible) { return null; }
      const roll = message.rolls.find(roll => roll.id === target.dataset.id);
      return roll ? { config: { message }, roll } : null;
    }
  }

  return ChatMessageConnection;
}
