import { makeIcon } from "../../helpers/icon.mjs";
import { BaseApplicationMixin } from "../api/mixins/_module.mjs";
import { TeriockContextMenu } from "../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * Mixin for applications that render chat messages.
 * @param {typeof ApplicationV2} Base
 */
export default function ChatMessageConnectionMixin(Base) {
  /**
   * @extends {ApplicationV2}
   * @mixin
   */
  class ChatMessageConnection extends BaseApplicationMixin(Base) {
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
     * Open a roll target's actor sheet on double-click.
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
     * Control (left-click) or release (right-click) the token for a roll target.
     * @this {ChatMessageConnection}
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    static async #selectTarget(event, target) {
      /** @type {TeriockToken} */
      const token = fromUuidSync(target.dataset.tokenUuid)?.object;
      if (!token?.isVisible) { return; }
      if (event.ctrlKey) {
        canvas.animatePan(token.center);
        return;
      }
      if (event.button === 2) { token.release(); }
      else if (token.isOwner) { token.control({ releaseOthers: !event.shiftKey }); }
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
      new TeriockContextMenu(this.element, "img", [{
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
      }], { eventName: "contextmenu", fixed: true, jQuery: false });
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
    }
  }

  return ChatMessageConnection;
}
