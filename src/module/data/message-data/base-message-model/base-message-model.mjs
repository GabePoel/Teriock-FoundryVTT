import { bindCommonActions } from "../../../applications/shared/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { buildHTMLButton } from "../../../helpers/html.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import {
  associationsField,
  blocksField,
} from "../../fields/helpers/builders.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.TeriockBaseMessageModelInterface}
 */
export default class TeriockBaseMessageModel extends TypeDataModel {
  /**
   * @inheritDoc
   * @returns {Record<string, DataField>}
   */
  static defineSchema() {
    const schema = {};
    schema.avatar = new fields.StringField({
      initial: null,
      nullable: true,
      required: false,
    });
    schema.columns = new fields.NumberField({ initial: 2 });
    schema.overlay = new fields.HTMLField({
      initial: null,
      nullable: true,
      required: false,
    });
    schema.panels = new fields.ArrayField(
      new fields.SchemaField({
        associations: associationsField(),
        bars: new fields.ArrayField(
          new fields.SchemaField({
            icon: new fields.StringField({
              initial: "",
              required: false,
            }),
            label: new fields.StringField({
              nullable: true,
              required: false,
            }),
            wrappers: new fields.ArrayField(new fields.StringField(), {
              initial: [],
              required: false,
            }),
          }),
          {
            initial: [],
            required: false,
          },
        ),
        blocks: blocksField(),
        classes: new fields.StringField({
          nullable: true,
          initial: null,
          required: false,
        }),
        color: new fields.StringField({
          initial: null,
          nullable: true,
          required: false,
        }),
        font: new fields.StringField({
          nullable: true,
          initial: null,
          required: false,
        }),
        icon: new fields.StringField({
          nullable: true,
          initial: null,
          required: false,
        }),
        image: new fields.StringField({
          initial: null,
          nullable: true,
          required: false,
        }),
        label: new fields.StringField({
          nullable: true,
          initial: null,
          required: false,
        }),
        name: new fields.StringField({
          initial: null,
          nullable: true,
          required: false,
        }),
        uuid: new fields.DocumentUUIDField({
          initial: null,
          nullable: true,
          required: false,
        }),
      }),
      {
        initial: [],
        required: false,
      },
    );
    schema.buttons = new fields.ArrayField(
      new fields.SchemaField({
        label: new fields.StringField(),
        dataset: new fields.TypedObjectField(
          new fields.StringField({
            initial: "",
            required: false,
          }),
        ),
        classes: new fields.SetField(new fields.StringField(), {
          initial: ["teriock-chat-button"],
          required: false,
        }),
        icon: new fields.StringField({
          initial: "",
          required: false,
        }),
        type: new fields.StringField({
          initial: "",
          required: false,
        }),
        disabled: new fields.BooleanField({ required: false }),
      }),
      {
        initial: [],
        required: false,
      },
    );
    schema.tags = new fields.ArrayField(new fields.StringField(), {
      initial: [],
      required: false,
    });
    schema.extraContent = new fields.HTMLField({
      initial: "",
      required: false,
    });
    schema.source = new fields.DocumentUUIDField({
      nullable: true,
      initial: null,
      required: false,
    });
    return schema;
  }

  /**
   * Construct the footer element with tags and buttons
   * @returns {HTMLElement} The footer element
   * @protected
   */
  _constructFooter() {
    const footer = document.createElement("footer");
    footer.className = "teriock-message-footer";

    // Create and add a tag container
    const tagContainer = this._createTagContainer();
    if (tagContainer) {
      footer.appendChild(tagContainer);
    }

    // Create and add a button container
    const buttonContainer = this._createButtonContainer();
    if (buttonContainer) {
      footer.appendChild(buttonContainer);
    }

    return footer;
  }

  /**
   * Build an array of buttons to insert into the footer of the document
   * @returns {HTMLButtonElement[]}
   * @protected
   */
  _constructFooterButtons() {
    return this.buttons.map((button) => buildHTMLButton(button));
  }

  /**
   * Create the button container with grid layout
   * @returns {HTMLElement|null} The button container element or null if no buttons
   * @protected
   */
  _createButtonContainer() {
    const buttons = this._constructFooterButtons();
    if (buttons.length === 0) {
      return null;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("teriock-buttons");

    const totalButtons = buttons.length;
    const columns = this.columns;
    const remainder = totalButtons % columns;

    if (remainder === 0) {
      // Clean multiple - all buttons the same width
      buttonContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      buttons.forEach((button) => {
        button.classList.remove("full-width", "full-row");
        buttonContainer.appendChild(button);
      });
    } else {
      // Uneven distribution - top row gets special treatment
      const topRowButtons = remainder;
      const topRowButtonWidth = columns / topRowButtons;

      // Set up a grid for the full layout
      buttonContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

      // Add top row buttons with special spanning
      for (let i = 0; i < topRowButtons; i++) {
        const button = buttons[i];
        button.classList.remove("full-width", "full-row");
        button.style.gridColumn = `span ${topRowButtonWidth}`;
        buttonContainer.appendChild(button);
      }

      // Add remaining buttons in a normal grid
      for (let i = topRowButtons; i < totalButtons; i++) {
        const button = buttons[i];
        button.classList.remove("full-width", "full-row");
        buttonContainer.appendChild(button);
      }
    }

    return buttonContainer;
  }

  /**
   * Create the tag container element
   * @returns {HTMLElement|null} The tag container element or null if no tags
   * @protected
   */
  _createTagContainer() {
    if (!this.tags || this.tags.length === 0) {
      return null;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "tmessage teriock-bottom-tags";

    const barBox = document.createElement("div");
    barBox.className = "tmes-bar-box";

    const bar = document.createElement("div");
    bar.className = "abm-bar";

    const tags = document.createElement("div");
    tags.className = "abm-bar-tags";

    for (const tag of this.tags) {
      const labelDiv = document.createElement("div");
      labelDiv.className = "abm-label tsubtle";
      labelDiv.textContent = tag;
      tags.appendChild(labelDiv);
    }

    bar.appendChild(tags);
    barBox.appendChild(bar);
    messageElement.appendChild(barBox);

    return messageElement;
  }

  /**
   * Perform subtype-specific alterations to the final chat message html
   * @param {HTMLLIElement} htmlElement The pending HTML
   */
  async alterMessageHTML(htmlElement) {
    htmlElement.classList.add("teriock");

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
        this.parent.timestamp <
        Date.now() -
          game.settings.get("teriock", "automaticPanelCollapseTime") *
            60 *
            1000;
    }
    if (autoCollapse) {
      htmlElement.querySelectorAll(".collapsable").forEach((el) => {
        el.classList.toggle("collapsed", true);
      });
    }

    htmlElement
      .querySelectorAll("[data-action='toggle-collapse']")
      .forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const target = /** @type {HTMLElement} */ e.target;
          const collapsable =
            /** @type {HTMLElement} */ target.closest(".collapsable");
          collapsable.classList.toggle("collapsed");
        });
      });

    // Add an extra content div at the start of message-content if it exists
    if (this.extraContent) {
      const messageContent = htmlElement.querySelector(".message-content");
      if (messageContent) {
        const extraContentDiv = document.createElement("div");
        extraContentDiv.classList.add("extra-content");
        extraContentDiv.innerHTML = this.extraContent;
        messageContent.insertAdjacentElement("afterbegin", extraContentDiv);
      }
    }

    const hasContent =
      (this.tags && this.tags.length > 0) || this.buttons.length > 0;
    if (hasContent) {
      const footer = this._constructFooter();
      htmlElement.insertAdjacentElement("beforeend", footer);
    }

    if (this.overlay) {
      const overlay = document.createElement("div");
      overlay.innerHTML = this.overlay;
      htmlElement.insertAdjacentElement(
        "afterbegin",
        overlay.firstElementChild,
      );
      htmlElement.style.position = "relative";
    }

    htmlElement.querySelectorAll(".teriock-target-container").forEach(
      /** @param {HTMLElement} container */ (container) => {
        let clickTimeout = null;

        container.addEventListener("click", async (event) => {
          event.stopPropagation();
          const uuid = container.getAttribute("data-uuid");
          if (!uuid) {
            return;
          }
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            return;
          }
          clickTimeout = setTimeout(async () => {
            const doc = /** @type {TeriockActor} */ await fromUuid(uuid);
            if (doc.isOwner) {
              if (doc.token?.object) {
                doc.token.object.control();
              } else {
                doc.getActiveTokens()[0]?.control();
              }
            }
            clickTimeout = null;
          }, 200);
        });

        container.addEventListener("dblclick", async (event) => {
          event.stopPropagation();
          const uuid = container.getAttribute("data-uuid");
          if (!uuid) {
            return;
          }
          if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
          }
          const doc = /** @type {TeriockActor} */ await fromUuid(uuid);
          if (
            doc &&
            doc.sheet &&
            doc.isOwner &&
            typeof doc.sheet.render === "function"
          ) {
            await doc.sheet.render(true);
          }
        });
      },
    );

    bindCommonActions(htmlElement);

    for (const roll of this.parent.rolls) {
      const id = roll.id;
      new TeriockContextMenu(
        htmlElement,
        `.dice-formula[data-id="${id}"]`,
        [
          {
            name: "Boost",
            icon: makeIcon("arrow-up-from-arc", "contextMenu"),
            callback: async () => {
              const boostedRoll = /** @type {TeriockRoll} */ await roll.boost(
                roll.options,
              );
              await boostedRoll.toMessage({
                system: {
                  buttons: this.buttons,
                },
              });
            },
          },
          {
            name: "Deboost",
            icon: makeIcon("arrow-down-from-arc", "contextMenu"),
            callback: async () => {
              const deboostedRoll =
                /** @type {TeriockRoll} */ await roll.deboost(roll.options);
              await deboostedRoll.toMessage({
                system: {
                  buttons: this.buttons,
                },
              });
            },
          },
        ],
        {
          fixed: true,
          jQuery: false,
        },
      );
    }
  }
}
