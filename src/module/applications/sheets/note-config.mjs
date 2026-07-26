import { EtherealConfigMixin } from "./mixins/_module.mjs";

const { NoteConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockNoteConfig extends EtherealConfigMixin(NoteConfig) {
  /** @inheritDoc */
  get etherealInsertAfter() {
    return "sort";
  }
}
