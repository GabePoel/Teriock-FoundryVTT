import powerConfig from "../../../../constants/config/power-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { asInf } from "../../../../helpers/icon.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { InfiniteNumberField } from "../../../fields/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

/**
 * Power-specific item data model.
 * @mixes ArmorSuppressionSystem
 * @mixes CompetenceDisplaySystem
 * @mixes MetaphysicsSystem
 * @mixes StatGiverSystem
 */
export default class PowerSystem
  extends mixClasses(
    BaseItemSystem,
    systemMixins.ArmorSuppressionSystemMixin,
    systemMixins.CompetenceDisplaySystemMixin,
    systemMixins.MetaphysicsSystemMixin,
    systemMixins.StatGiverSystemMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Power"];

  /** @inheritDoc */
  static get _initialStatPoolFormula() {
    return "";
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      initialCompetence: 1,
      initialKind: "other",
      kinds: _replace(powerConfig.kind),
      type: "power",
    }, { applyOperators: true });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { maxAv: new InfiniteNumberField({ integer: true }) });
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._statBar, this._metaphysicsBar, {
      icon: TERIOCK.display.icons.manifest.armament.av,
      label: _loc("TERIOCK.SYSTEMS.Power.FIELDS.maxAv.label"),
      wrappers: [
        this.maxAv === 0
          ? _loc("TERIOCK.SYSTEMS.Power.PANELS.noArmor")
          : _loc("TERIOCK.SYSTEMS.Power.PANELS.maxAv", { value: asInf(this.maxAv) }),
      ],
    }];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([this._kindEntry.label, parts.text]);
    parts.subtitle = _loc("TYPES.Item.power");
    return parts;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (
      this.actor?.powers.some(p => p.system.identifier === this.identifier)
      && ["mage", "semi", "warrior"].includes(this.identifier)
    ) {
      return false;
    }
  }
}
