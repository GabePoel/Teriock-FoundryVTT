import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIcon, makeIconClass, mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

/**
 * {@link TeriockFluency} sheet.
 * @extends {BaseEffectSheet}
 * @mixes UseButtonSheet
 * @property {TeriockFluency} document
 */
export default class FluencySheet extends mix(
  BaseEffectSheet,
  mixins.UseButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["fluency"],
    window: {
      icon: makeIconClass(documentOptions.fluency.icon, "title"),
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/effect-templates/fluency-template/fluency-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Context menu for selecting a field.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  #fieldContextMenuEntries() {
    const options = [];
    for (const [fKey, fData] of Object.entries(TERIOCK.options.tradecraft)) {
      const option = {
        name: fData.name,
        icon: makeIcon(fData.icon, "contextMenu"),
        callback: async () => {
          const updateData = {
            system: {
              field: fKey,
              tradecraft: Object.keys(fData.tradecrafts)[0],
            },
          };
          await this.document.update(updateData);
        },
      };
      options.push(option);
    }
    return options;
  }

  /**
   * Context menu entries for selecting a tradecraft.
   * @returns {Teriock.Foundry.ContextMenuEntry[]}
   */
  #tradecraftContextMenuEntries() {
    const options = [];
    for (const [fKey, fData] of Object.entries(TERIOCK.options.tradecraft)) {
      for (const [tcKey, tcData] of Object.entries(fData.tradecrafts)) {
        const option = {
          name: tcData.name,
          icon: makeIcon(tcData.icon, "contextMenu"),
          callback: async () => {
            const updateData = {
              system: {
                field: fKey,
                tradecraft: tcKey,
              },
            };
            await this.document.update(updateData);
          },
          condition: () => {
            return (
              foundry.utils.getProperty(this.document.system, "field") === fKey
            );
          },
        };
        options.push(option);
      }
    }
    return options;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._connectContextMenu(
      ".field-box",
      this.#fieldContextMenuEntries(),
      "click",
    );
    this._connectContextMenu(
      ".tradecraft-box",
      this.#tradecraftContextMenuEntries(),
      "click",
    );
  }
}
