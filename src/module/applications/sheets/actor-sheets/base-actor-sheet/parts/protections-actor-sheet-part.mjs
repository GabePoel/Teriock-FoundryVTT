import { protectionOptions } from "../../../../../constants/options/protection-options.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { toCamelCase, toId } from "../../../../../helpers/string.mjs"; //noinspection JSClosureCompilerSyntax

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class ProtectionsActorSheetPart extends Base {
    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      this._prepareProtectionEntryContext(context);
      this._prepareProtectionButtonContext(context);
      return context;
    }

    /**
     * Prepare protection buttons for context.
     * @param {object} context
     */
    _prepareProtectionButtonContext(context) {
      context.protectionButtons = Object.values(protectionOptions.types).map(
        (type) => {
          return {
            tooltip: type.button,
            img: getImage("effectTypes", type.rule),
            action: type.action,
            label: type.label,
          };
        },
      );
    }

    /**
     * Prepare protection entries for context.
     * @param {object} context
     */
    _prepareProtectionEntryContext(context) {
      const protectionEntries = [];
      Object.entries(protectionOptions.types).forEach(([tk, tv]) => {
        Object.entries(protectionOptions.categories).forEach(([ck, cv]) => {
          Array.from(this.document.system.protections[tk][ck]).forEach((s) => {
            const nsId = toId("Keyword", { hash: false });
            const pnId = toId(tv.rule, { hash: false });
            const uuid = `Compendium.teriock.rules.JournalEntry.${nsId}.JournalEntryPage.${pnId}`;
            const fallbackImg = getImage("effectTypes", tv.rule);
            const img =
              ck === "other"
                ? fallbackImg
                : getImage(cv.imgCategory, s, fallbackImg);
            let title = s;
            if (ck !== "other") {
              title = foundry.utils.getProperty(TERIOCK, cv.choices)[
                toCamelCase(s)
              ];
            }
            const entry = {
              action: tv.action,
              img,
              makeTooltip: true,
              subtitle: cv.label,
              text: tv.label,
              title,
              usable: true,
              uuid,
            };
            protectionEntries.push(entry);
          });
        });
      });
      context.protectionEntries = protectionEntries;
    }
  };
