import { makeIcon, mixClasses } from "../../../utils/_module.mjs";
import { BaseApplicationMixin, DragDropApplicationMixin } from "../../api/mixins/_module.mjs";
import { TeriockContextMenu } from "../../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { ApplicationV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Mixin for applications that render chat messages.
 * @template {MixinBase<typeof ApplicationV2>} T
 * @param {T} Base
 */
export default function ChatMessageConnectionMixin(Base) {
  /**
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
      const message = activation.getNearestDocument();
      const yes = await message.system?._preActivateActivation?.(activation);
      if (yes === false) { return; }
      if (event.button === 2) { await activation.secondaryAction(); }
      else { await activation.primaryAction(); }
      const deleteMessage = game.settings.get("teriock", "deleteTriggerOnActivation") !== event.ctrlKey;
      if (deleteMessage && message?.type === "triggered" && message.isOwner) { await message.delete(); }
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
      const token = fromUuidSync(target.dataset.uuid)?.object;
      if (!token) { return; }
      if (event.button === 0 && token.isOwner) {
        if (token.controlled) { token.release(); }
        else { token.control({ releaseOthers: !event.shiftKey }); }
      } else if (token.isOwner || token.isVisible) { canvas.animatePan(token.center); }
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
     * @param {HTMLElement} root
     */
    #connectImageContextMenu(root) {
      new TeriockContextMenu(root, "img", [{
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.ui.image, "contextMenu"),
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
      }], { fixed: true, jQuery: false });
    }

    /**
     * Connect the context menus for roll formulas and totals.
     * @param {HTMLElement} root
     */
    #connectRollContextMenus(root) {
      const resolve = this._resolveRoll.bind(this);
      const connect = (selector, getEntries) =>
        new TeriockContextMenu(root, selector, [], {
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

    /** @inheritDoc */
    _attachRootListeners(root) {
      super._attachRootListeners(root);
      this.#connectImageContextMenu(root);
      this.#connectRollContextMenus(root);
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
      return roll ? { config: { message, messageData: { type: message.type } }, roll } : null;
    }
  }

  return ChatMessageConnection;
}
