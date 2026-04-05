import { bindCommonActions } from "../../../../applications/shared/_module.mjs";
import { TeriockContextMenu } from "../../../../applications/ux/_module.mjs";
import {
  TeriockChatMessage,
  TeriockItem,
} from "../../../../documents/_module.mjs";
import { makeIcon } from "../../../../helpers/utils.mjs";
import { panelsField } from "../../../fields/helpers/builders.mjs";
import * as activations from "../../../pseudo-documents/activations/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";
import { BaseSystem } from "../../abstract/_module.mjs";
import { ActivatableSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.BaseMessageSystemData}
 * @extends {Teriock.Data.BaseMessageData}
 * @mixes ActivatableSystem
 */
export default class BaseMessageSystem extends ActivatableSystemMixin(
  BaseSystem,
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
      avatar: new fields.StringField(),
      columns: new fields.NumberField({ initial: 2 }),
      panels: panelsField(),
      tags: new fields.ArrayField(new fields.StringField()),
      extraContent: new fields.HTMLField(),
      source: new fields.DocumentUUIDField(),
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
   * Generate the data for a collection object with take amounts updated.
   * @param {number} amount
   * @returns {Record<ID<V>, Object>}
   */
  #amountAlteredCollection(amount) {
    const collectionObject =
      teriock.data.pseudoDocuments.abstract.PseudoDocument.toCollectionObject(
        this.activations.contents,
      );
    for (const obj of Object.values(collectionObject)) {
      if (obj.type === "take") obj.amount = amount;
    }
    return collectionObject;
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

    // Add an extra content div at the start of message-content if it exists
    if (this.extraContent) {
      const messageContent = element.querySelector(".message-content");
      if (messageContent) {
        const extraContentDiv = document.createElement("div");
        extraContentDiv.classList.add("extra-content");
        extraContentDiv.innerHTML = this.extraContent;
        messageContent.insertAdjacentElement("afterbegin", extraContentDiv);
      }
    }

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
          if (actor?.isOwner) {
            await actor.sheet.render(true);
          }
        });
      },
    );

    bindCommonActions(element);

    for (const roll of this.document.rolls) {
      const id = roll.id;
      new TeriockContextMenu(
        element,
        `.dice-formula[data-id="${id}"]`,
        [
          {
            name: "TERIOCK.DIALOGS.Boost.FIELDS.boosts.single",
            icon: makeIcon(TERIOCK.display.icons.roll.boost, "contextMenu"),
            callback: async () => {
              const boostedRoll = await roll.boost(roll.options);
              await boostedRoll.toMessage({
                speaker: TeriockChatMessage.getSpeaker(),
                system: {
                  activations: this.#amountAlteredCollection(boostedRoll.total),
                },
              });
            },
          },
          {
            name: "TERIOCK.DIALOGS.Boost.FIELDS.deboosts.single",
            icon: makeIcon(TERIOCK.display.icons.roll.deboost, "contextMenu"),
            callback: async () => {
              const deboostedRoll = await roll.deboost(roll.options);
              await deboostedRoll.toMessage({
                speaker: TeriockChatMessage.getSpeaker(),
                system: {
                  activations: this.#amountAlteredCollection(
                    deboostedRoll.total,
                  ),
                },
              });
            },
          },
        ],
        {
          fixed: false,
          jQuery: false,
        },
      );
    }
  }

  /**
   * Prepare chat message render context.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async _prepareContext(options = {}) {
    return {
      system: this,
      isContentVisible: this.document.isContentVisible,
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
    if (defaultCollapse === "closed") {
      autoCollapse = true;
    } else if (defaultCollapse === "open") {
      autoCollapse = false;
    } else {
      autoCollapse =
        this.document.timestamp <
        Date.now() -
          game.teriock.getSetting("automaticPanelCollapseTime") * 60 * 1000;
    }
    TeriockItem.toggleCollapse(htmlElement, {
      autoCollapse: true,
      collapseAll: autoCollapse,
    });
  }
}
