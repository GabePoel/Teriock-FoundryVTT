import { bindCommonActions } from "../../../../applications/shared/_module.mjs";
import { TeriockItem } from "../../../../documents/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { panelsField } from "../../../fields/helpers/builders.mjs";
import * as activations from "../../../pseudo-documents/activations/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";
import {
  ActivatableSystemMixin,
  BaseSystemMixin,
} from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.BaseMessageSystemData}
 * @extends {Teriock.Data.BaseMessageData}
 * @mixes BaseSystem
 * @mixes ActivatableSystem
 */
export default class BaseMessageSystem extends mix(
  TypeDataModel,
  BaseSystemMixin,
  ActivatableSystemMixin,
) {
  static get _activationTypes() {
    return Object.values(activations).filter((a) =>
      foundry.utils.isSubclass(a, BaseActivation),
    );
  }

  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      avatar: new fields.FilePathField({ categories: ["IMAGE"] }),
      content: new fields.HTMLField(),
      panels: panelsField(),
      source: new fields.DocumentUUIDField(),
      tags: new fields.ArrayField(new fields.StringField()),
    });
  }

  /** @returns {TeriockActor|null} */
  get actor() {
    return game.actors.default;
  }

  /** @returns {TeriockChatMessage} */
  get document() {
    return this.parent;
  }

  /**
   * Perform subtype-specific alterations to the final chat message HTML.
   * @param {object} _context
   * @param {object} options
   * @param {HTMLLIElement} options.element
   */
  async _onRender(_context, options) {
    const element = options.element;
    if (!element) return;
    element.classList.add("teriock");
    TeriockItem.bindPanelListeners(element);
    this._connectActivationListeners(element);
    this.collapsePanels(element);

    // Remove custom content if it shouldn't be visible
    if (!this.document.isContentVisible) {
      element
        .querySelectorAll(".teriock-target-container, .teriock-dice-total-icon")
        .forEach((el) => el.remove());
      element
        .querySelectorAll(".dice-total.teriock-dice-total")
        .forEach((el) => {
          el.className = "dice-total teriock-dice-total";
        });
      element
        .querySelectorAll(".dice-formula.teriock-dice-formula")
        .forEach((el) => {
          el.className = "dice-formula teriock-dice-formula";
        });
      element.querySelectorAll(".dice-total, .dice-formula").forEach(
        /** @param {HTMLElement} el */ (el) => {
          delete el.dataset.tooltip;
          delete el.dataset.tooltipHtml;
        },
      );
    }

    // Add target selection listeners
    element.querySelectorAll(".teriock-target-container").forEach(
      /** @param {HTMLElement} container */ (container) => {
        let clickTimeout = null;

        container.addEventListener("contextmenu", async (event) => {
          event.stopPropagation();
          const tokenDocument = /** @type {TeriockDocument} */ await fromUuid(
            container.dataset.tokenUuid,
          );
          if (tokenDocument) tokenDocument.object.release();
        });

        container.addEventListener("click", async (event) => {
          event.stopPropagation();
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            return;
          }
          clickTimeout = setTimeout(async () => {
            const tokenDocument =
              /** @type {TeriockTokenDocument} */ await fromUuid(
                container.dataset.tokenUuid,
              );
            if (tokenDocument?.isOwner) {
              tokenDocument.object.control({
                releaseOthers: !event.shiftKey,
              });
            }
            clickTimeout = null;
          }, 200);
        });

        container.addEventListener("dblclick", async (event) => {
          event.stopPropagation();
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          const actor = /** @type {TeriockActor} */ await fromUuid(
            container.dataset.actorUuid,
          );
          if (actor?.isOwner) await actor.sheet.render(true);
        });
      },
    );

    // Bind common listeners
    bindCommonActions(element);

    // Add roll context menus
    for (const roll of this.document.rolls) {
      roll.bindContextMenus(element);
    }
  }

  /**
   * Prepare chat message render context.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async _prepareContext(options = {}) {
    return {
      isContentVisible: this.document.isContentVisible,
      system: this,
      ...options,
    };
  }

  /**
   * Auto-collapse panels.
   * @param {HTMLLIElement} htmlElement
   */
  collapsePanels(htmlElement) {
    let autoCollapse;
    const defaultCollapse = game.settings.get(
      "teriock",
      "defaultPanelCollapseState",
    );
    if (defaultCollapse === "closed") autoCollapse = true;
    else if (defaultCollapse === "open") autoCollapse = false;
    else {
      autoCollapse =
        this.document.timestamp <
        Date.now() -
          game.teriock.getSetting("autoPanelCollapseTime") * 60 * 1000;
    }
    TeriockItem.toggleCollapse(htmlElement, {
      autoCollapse: true,
      collapseAll: autoCollapse,
    });
  }
}
