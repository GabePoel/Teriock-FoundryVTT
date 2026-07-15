import statConfig from "../../../../constants/config/stat-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { StatPoolModel } from "../../../models/_module.mjs";

const { fields } = foundry.data;

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * @param {typeof BaseItemSystem} Base
 */
export default function StatGiverSystemMixin(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.StatGiverSystemData}
     * @implements {Teriock.Functionality.StatProvider}
     * @mixin
     */
    class StatGiverSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.StatGiver"];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, { stats: true });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          statDice: new fields.SchemaField(
            Object.fromEntries(
              POOL_STATS.map(k => [k, new fields.EmbeddedDataField(StatPoolModel, { initial: { stat: k } })]),
            ),
          ),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        for (const stat of POOL_STATS) { foundry.utils.setProperty(source, `statDice.${stat}.stat`, stat); }
        return super.migrateData(source, options, state);
      }

      /** @returns {Teriock.Panels.PanelBar} */
      get _statBar() {
        return {
          icon: icons.ui.dice,
          label: _loc("TERIOCK.SYSTEMS.StatGiver.PANELS.statDice"),
          wrappers: POOL_STATS.map(k =>
            _loc(`TERIOCK.SYSTEMS.StatGiver.PANELS.${k}`, { value: this.statDice[k].formula })
          ),
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

      /**
       * Context menu entries to enable/disable stat dice.
       * @param {TeriockDocument} doc
       * @returns {ContextMenuEntry[]}
       */
      getCardContextMenuEntries(doc) {
        const entries = super.getCardContextMenuEntries(doc);
        if (!doc?.isOwner) { return entries; }
        for (const stat of POOL_STATS) {
          const canToggle = this._canToggleStatDice(stat);
          entries.push({
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            label: _loc(`TERIOCK.SYSTEMS.StatGiver.MENU.enable${stat.capitalize()}Dice`),
            visible: this.statDice[stat].disabled && canToggle
              && this.parent._checkValidEditorDocument(doc, { self: false }),
            onClick: async () => {
              await this.parent.update({ [`system.statDice.${stat}.disabled`]: false });
            },
          }, {
            group: "control",
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            label: _loc(`TERIOCK.SYSTEMS.StatGiver.MENU.disable${stat.capitalize()}Dice`),
            visible: !this.statDice[stat].disabled && canToggle
              && this.parent._checkValidEditorDocument(doc, { self: false }),
            onClick: async () => {
              await this.parent.update({ [`system.statDice.${stat}.disabled`]: true });
            },
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
              k => [[k, this.statDice[k].formula], [`${k}.disabled`, Number(this.statDice[k].disabled)], [
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
        for (const stat of POOL_STATS) { this.statDice[stat].prepareStatDice(); }
      }
    }
  );
}
