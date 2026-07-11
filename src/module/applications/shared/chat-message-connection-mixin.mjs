import { BaseApplicationMixin } from "../api/mixins/_module.mjs";

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
      const actor = /** @type {TeriockActor} */ await fromUuid(target.dataset.actorUuid);
      if (actor?.isOwner) { await actor.sheet.render(true); }
    }

    /**
     * Control (left-click) or release (right-click) the token for a roll target.
     * @this {ChatMessageConnection}
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    static async #selectTarget(event, target) {
      const tokenDocument = /** @type {TeriockTokenDocument} */ await fromUuid(target.dataset.tokenUuid);
      if (!tokenDocument) { return; }
      if (event.button === 2) { tokenDocument.object?.release(); }
      else if (tokenDocument.isOwner) { tokenDocument.object.control({ releaseOthers: !event.shiftKey }); }
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        activateActivation: { buttons: [0, 2], handler: this.#activateActivation },
        selectTarget: { buttons: [0, 2], handler: this.#selectTarget },
      },
      doubles: { selectTarget: this.#openTargetSheet },
    };

    /**
     * Suppress default context menus for elements that have a right click button.
     * @param {MouseEvent} event
     */
    #suppressContextMenu(event) {
      const target = /** @type {HTMLElement} */ (event.target).closest("[data-action]");
      const action = target && this.options.actions[target.dataset.action];
      if (action?.buttons?.includes(2)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    /** @inheritDoc */
    _attachFrameListeners() {
      super._attachFrameListeners();
      this.element.addEventListener("contextmenu", this.#suppressContextMenu.bind(this));
    }
  }

  return ChatMessageConnection;
}
