import { builders } from "../../../../fields/tools/_module.mjs";
import ApplicableEffectSystem from "../applicable-effect-system/applicable-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Effect data model for effects applied by an execution.
 * @extends {ApplicableEffectSystem}
 */
export default class ExecutedEffectSystem extends ApplicableEffectSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Executed"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      blocks: builders.blocksField(),
      critical: new fields.BooleanField(),
      executor: new fields.DocumentUUIDField({ nullable: true, type: "Actor" }),
      heightened: new fields.NumberField(),
      sustained: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    for (const b of source?.blocks ?? []) {
      if ("gmOnly" in b) { b.gm ??= b.gmOnly; }
    }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["sustained", ...super._formPaths];
  }

  /** @inheritDoc */
  get _metaphysicsTags() {
    const tags = super._metaphysicsTags;
    if (this.sustained) { tags.push(this.getStringForProperty("sustained")); }
    return tags;
  }

  /** @inheritDoc */
  get _nameTags() {
    const tags = super._nameTags;
    if (this.critical) { tags.unshift(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical")); }
    return tags;
  }

  /** @inheritDoc */
  get _panelBlocks() {
    if (this.parent._source.description) { return super._panelBlocks; }
    return this.blocks;
  }

  /** @inheritDoc */
  get _statusBar() {
    const bar = super._statusBar;
    bar.wrappers.push(
      this.critical ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical") : "",
      this.heightened
        ? this.heightened === 1
          ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")
          : _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened })
        : "",
    );
    return bar;
  }

  /**
   * The document that this is sustained by.
   * @returns {TeriockDocument|null}
   */
  get sustainedBy() {
    if (this.sustained && this.parent.origin) { return this.parent.fetchFromUuidSync(this.parent.origin); }
    return null;
  }

  /** @inheritDoc */
  _getTipSuppressions() {
    return { ...super._getTipSuppressions(), unsustained: this._isSuppressedUnsustained.bind(this) };
  }

  /**
   * If this is suppressed due to its sustainedBy being inactive.
   * @returns {boolean}
   */
  _isSuppressedUnsustained() {
    if (!game.settings.get("teriock", "trackSustainedConsequences")) { return false; }
    const sustainedBy = this.sustainedBy;
    if (!sustainedBy || sustainedBy === this.parent) { return false; }
    return (sustainedBy.top === this.parent.top && !sustainedBy.active);
  }
}
