import { documentConfig } from "../../../constants/config/document-config.mjs";
import { makeIcon, makeIconClass } from "../../../helpers/utils.mjs";
import BaseEffectSheet from "./base-effect-sheet.mjs";

/**
 * {@link TeriockFluency} sheet.
 * @extends {BaseEffectSheet}
 * @property {TeriockFluency} document
 */
export default class FluencySheet extends BaseEffectSheet {
  /** @inheritDoc */
  static BARS = ["teriock/sheets/effects/fluency/tradecraft-bar"];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["fluency"],
    window: { icon: makeIconClass(documentConfig.fluency.icon, "title") },
  };

  /**
   * Context menu for selecting a field.
   * @returns {ContextMenuEntry[]}
   */
  #fieldContextMenuEntries() {
    const options = [];
    for (const [fKey, fData] of Object.entries(TERIOCK.config.tradecraft)) {
      const option = {
        label: fData.name,
        icon: makeIcon(fData.icon, "contextMenu"),
        onClick: async () => {
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
   * @returns {ContextMenuEntry[]}
   */
  #tradecraftContextMenuEntries() {
    const options = [];
    for (const [fKey, fData] of Object.entries(TERIOCK.config.tradecraft)) {
      for (const [tcKey, tcData] of Object.entries(fData.tradecrafts)) {
        const option = {
          label: tcData.name,
          icon: makeIcon(tcData.icon, "contextMenu"),
          onClick: async () => {
            const updateData = {
              system: {
                field: fKey,
                tradecraft: tcKey,
              },
            };
            await this.document.update(updateData);
          },
          visible: () => {
            return foundry.utils.getProperty(this.document.system, "field") === fKey;
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
    this._connectContextMenu(".field-box", this.#fieldContextMenuEntries(), "click");
    this._connectContextMenu(".tradecraft-box", this.#tradecraftContextMenuEntries(), "click");
  }
}
