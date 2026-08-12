import statConfig from "../../../../constants/config/stat-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { StatPoolModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, StatGiverSystem & Teriock.Models.StatGiverSystemData>}
 */
export default function StatGiverSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.StatGiverSystemData}
   * @implements {Teriock.Functionality.StatProvider}
   * @mixin
   */
  class StatGiverSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.StatGiver"];

    /**
     * The initial stat pool formula to use.
     * @return {Teriock.System.FormulaString}
     */
    static get _initialStatPoolFormula() {
      return "1d10";
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { stats: true });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        statDice: new fields.SchemaField(
          Object.fromEntries(
            POOL_STATS.map(
              k => [
                k,
                new fields.EmbeddedDataField(StatPoolModel, {
                  initial: { disabled: false, formula: this._initialStatPoolFormula, spent: [] },
                }),
              ]
            ),
          ),
        ),
      });
    }

    /** @inheritDoc */
    get _embedIcons() {
      return [
        ...POOL_STATS.map(stat => {
          const disabled = this.statDice[stat].disabled;
          return {
            action: `toggle${stat.capitalize()}DiceDoc`,
            icon: this.statDice[stat].icon,
            tooltip: _loc(`TERIOCK.SYSTEMS.StatGiver.EMBED.${stat}${disabled ? "Disabled" : "Enabled"}`),
            onClick: async () => {
              await this.parent.update({ [`system.statDice.${stat}.disabled`]: !disabled });
            },
            visible: () => this.parent.isOwner && this._canToggleStatDice(stat) && this.statDice[stat].hasDice,
          };
        }),
        ...super._embedIcons,
      ];
    }

    /** @returns {Teriock.Panels.PanelBar} */
    get _statBar() {
      return {
        icon: icons.ui.dice,
        label: _loc("TERIOCK.SYSTEMS.StatGiver.PANELS.statDice"),
        wrappers: POOL_STATS.map(k =>
          this.statDice[k].hasDice
            ? _loc(`TERIOCK.SYSTEMS.StatGiver.PANELS.${k}`, { value: this.statDice[k].formula })
            : ""
        ).filter(Boolean),
      };
    }

    /**
     * Whether stat dice on this document can be toggled.
     * @param {Teriock.Keys.DieStat} _stat
     * @returns {boolean}
     */
    _canToggleStatDice(_stat) {
      return true;
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const entries = super.getEmbedContextMenuEntries(doc);
      if (!doc?.isOwner) { return entries; }
      for (const stat of POOL_STATS) {
        const canToggle = this._canToggleStatDice(stat) && this.statDice[stat].hasDice;
        entries.push({
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.stat[`${stat}On`], "contextMenu"),
          label: _loc(`TERIOCK.SYSTEMS.StatGiver.MENU.enable${stat.capitalize()}Dice`),
          onClick: async () => {
            await this.parent.update({ [`system.statDice.${stat}.disabled`]: false });
          },
          visible: () =>
            this.statDice[stat].disabled && canToggle && this.parent._checkValidEditorDocument(doc, { self: false }),
        }, {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.stat[`${stat}Off`], "contextMenu"),
          label: _loc(`TERIOCK.SYSTEMS.StatGiver.MENU.disable${stat.capitalize()}Dice`),
          onClick: async () => {
            await this.parent.update({ [`system.statDice.${stat}.disabled`]: true });
          },
          visible: () =>
            !this.statDice[stat].disabled && canToggle && this.parent._checkValidEditorDocument(doc, { self: false }),
        });
      }
      return entries;
    }

    /** @inheritDoc */
    getLocalRollData() {
      return {
        ...super.getLocalRollData(),
        ...Object.fromEntries(
          POOL_STATS.flatMap(
            k => [[k, this.statDice[k].formula || 0], [`${k}.disabled`, Number(this.statDice[k].disabled)], [
              `${k}.value`,
              Number(this.statDice[k].value),
            ]]
          ),
        ),
      };
    }

    /** @inheritDoc */
    prepareSpecialData() {
      super.prepareSpecialData();
      if (!this.actor) { this.prepareStatDice(); }
    }

    /** @inheritDoc */
    prepareStatDice() {
      for (const stat of POOL_STATS) {
        this.statDice[stat].prepareStatDice();
        if (!this._canToggleStatDice(stat)) { this.statDice[stat].disabled = true; }
      }
    }
  }

  return StatGiverSystem;
}
