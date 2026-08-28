import { parseIdentifier } from "../../helpers/utils.mjs";

const { TextEditor } = foundry.applications.ux;

/**
 * @import { DocumentHTMLEmbedConfig } from "@client/applications/ux/text-editor.mjs";
 */

/** @inheritDoc */
export default class TeriockTextEditor extends TextEditor {
  /**
   * Patched to allow for identifiers as well as UUIDs.
   * @inheritDoc
   */
  static async _embedContent(match, options = {}) {
    for (const part of match.groups.config.match(/(?:[^\s"]+|"[^"]*")+/g)) {
      const [key] = part.split("=");
      if (key === "identifier" || parseIdentifier(part)) { await game.teriock.identifiers.initializing; }
    }
    return super._embedContent(match, options);
  }

  /**
   * Patched to allow for identifiers as well as UUIDs.
   * @inheritDoc
   * @returns {DocumentHTMLEmbedConfig & { identifier?: TypedIdentifier }}
   */
  static _parseEmbedConfig(raw, options = {}) {
    /** @type {DocumentHTMLEmbedConfig & { identifier?: TypedIdentifier }} */
    const config = super._parseEmbedConfig(raw, options);
    if (!config.uuid) {
      if (config.identifier) { config.uuid = game.teriock.identifiers.get(config.identifier); }
      else if (config.values.length && parseIdentifier(config.values[0])) {
        const uuid = game.teriock.identifiers.get(config.values[0]);
        if (uuid) { config.uuid = uuid; }
      }
    }
    return config;
  }

  /** @inheritdoc */
  static createAnchor({ attrs = {}, classes = [], dataset = {}, icon, name } = {}) {
    if (dataset.uuid && game.settings.get("teriock", "contentLinkTooltips")) { dataset.tooltipUuid = dataset.uuid; }
    return super.createAnchor({ attrs, classes, dataset, icon, name });
  }

  /**
   * A wrapper for rendering templates with handlebars that ensures `TERIOCK` is always available.
   * @param {string} path
   * @param {object} data
   * @returns {Promise<string>}
   */
  static async renderTemplate(path, data) {
    await game.teriock.templatesReady;
    return foundry.applications.handlebars.renderTemplate(path, { ...data, TERIOCK });
  }
}
