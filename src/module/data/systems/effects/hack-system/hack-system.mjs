import { ApplicableEffectSystem } from "../_module.mjs";
import { hackConfig } from "../../../../constants/config/hack-config.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.Models.HackSystemData}
 */
export default class HackSystem extends ApplicableEffectSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Hack"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      escalation: new fields.NumberField({ initial: 1, integer: true, min: 0, required: true }),
      part: new fields.StringField({
        blank: true,
        choices: localizeChoices(objectMap(hackConfig, c => c.part)),
        initial: null,
        nullable: true,
      }),
      permanent: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _durationBar() {
    const bar = super._durationBar;
    if (this.permanent) bar.wrappers.push(_loc("TERIOCK.SYSTEMS.Hack.FIELDS.permanent.label"));
    return bar;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["permanent", "part", "escalation"];
  }

  /** @inheritDoc */
  get _statusBar() {
    const bar = super._statusBar;
    bar.wrappers.push(hackConfig[this.part]?.part || "");
    return bar;
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.display.colors.red;
  }

  /** @inheritDoc */
  get embedParts() {
    const textParts = [];
    if (this.part) textParts.push(hackConfig[this.part]?.part);
    if (this.permanent) textParts.push(_loc("TERIOCK.SYSTEMS.Hack.FIELDS.permanent.label"));
    return Object.assign(super.embedParts, { text: dotJoin(textParts) });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    this.parent.updateSource({ statuses: ["hacked"], ...data });
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.escalation) {
      this.changes.push({
        key: `system.hacks.${this.part}.value`,
        phase: "initial",
        priority: 5,
        type: "add",
        value: "1",
      });
      if (this.permanent) {
        this.changes.push({
          key: `system.hacks.${this.part}.min`,
          phase: "initial",
          priority: 5,
          type: "add",
          value: "1",
        });
      }
    }
  }
}
