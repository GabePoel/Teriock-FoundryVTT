import { makeIconClass } from "../../../utils/_module.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating an actor's custom Elder Sorcery words.
 * @property {TeriockActor} document
 * @category Sorcery
 */
export default class ElderSorceryWordsUpdater extends BaseUpdater {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: { width: 600 },
    window: { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.sorcery, "title"), resizable: true },
  };

  /** @inheritDoc */
  get _canLockPaths() {
    return false;
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.words"];
  }

  /** @inheritDoc */
  _prepareFieldContext(path) {
    return { ...super._prepareFieldContext(path), stacked: true };
  }
}
