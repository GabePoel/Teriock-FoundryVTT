import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Macro } = foundry.documents;

/**
 * The Teriock Macro implementation.
 * @extends {Macro}
 * @mixes BaseDocument
 * @implements {Teriock.Functionality.Usable}
 */
export default class TeriockMacro extends mixClasses(Macro, BaseDocumentMixin) {
  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const flags = ui.hotbar?.creatingMacroFlags;
    if (flags) {
      ui.hotbar.creatingMacroFlags = null;
      this.updateSource({ flags: { teriock: flags } });
      if (game.settings.get("teriock", "sortNewPlayerMacros") && !this.folder) {
        if ((!game.user.isGM && ui.hotbar.hotbarFolder) || game.users.activeGM) {
          this.updateSource({ folder: (await ui.hotbar.ensureHotbarFolder())?.id });
        }
      }
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    for (const key of ["macroDocumentUuid", "macroHash"]) {
      if (this.getFlag("teriock", key) && !foundry.utils.hasProperty(changes, `flags.teriock.${key}`)) {
        foundry.utils.setProperty(changes, `flags.teriock.${key}`, _del);
      }
    }
  }

  /** @inheritDoc */
  async use(options = {}) {
    await this.execute(options);
  }
}
