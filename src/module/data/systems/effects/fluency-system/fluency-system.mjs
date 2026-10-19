import { icons, thumbnails } from "../../../../static/display/_module.mjs";
import { dotJoin, getName, mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { fieldField, tradecraftField } from "../../../fields/tools/builders.mjs";
import { initialText } from "../../../fields/tools/initializers.mjs";
import { ThresholdDataMixin } from "../../../mixins/_module.mjs";
import { CompetenceDisplaySystemMixin, RevelationSystemMixin, WikiSystemMixin } from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {CleanedEffectSystem}
 * @mixes WikiSystem
 * @mixes RevelationSystem
 * @mixes CompetenceDisplaySystem
 * @mixes ThresholdData
 */
export default class FluencySystem
  extends mixClasses(
    CleanedEffectSystem,
    WikiSystemMixin,
    RevelationSystemMixin,
    CompetenceDisplaySystemMixin,
    ThresholdDataMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Fluency"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: icons.manifest.document.fluency,
    img: thumbnails.manifest.document.fluency,
    initialCompetence: 2,
    tags: { usable: true },
    type: "fluency",
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.child.FluencyExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      field: fieldField({ required: true }),
      tradecraft: tradecraftField({ required: true }),
      tradecraftDescription: initialText({ label: "TERIOCK.COMMON.Tradecraft" }),
    });
  }

  /** @inheritDoc */
  get _displayFieldsContent() {
    return [...super._displayFieldsContent, {
      classes: [TERIOCK.DISPLAY.panels.styles.derived],
      editable: false,
      label: TERIOCK.CONFIG.tradecraft.tradecrafts[this._source.tradecraft]?.label,
      path: "system.tradecraftDescription",
    }];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.CONFIG.tradecraft.tradecrafts[this._source.tradecraft]?.label;
    parts.text = dotJoin([TERIOCK.CONFIG.tradecraft.fields[this._source.field].label, parts.text]);
    return parts;
  }

  /** @inheritDoc */
  get isPassive() {
    return false;
  }

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get wikiIdentifier() {
    return this.tradecraft;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    // Fluencies should always be fluent.
    foundry.utils.setProperty(options, "keepCompetence", true);

    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (!foundry.utils.hasProperty(data, "img")) {
      this.parent.updateSource({ img: TERIOCK.DISPLAY.thumbnails.manifest.tradecraft.artist });
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (
      Object.values(TERIOCK.DISPLAY.thumbnails.manifest.tradecraft).includes(this.parent.img)
      && !foundry.utils.hasProperty(changes, "img")
    ) {
      let tradecraft = this._source.tradecraft;
      if (foundry.utils.hasProperty(changes, "system.tradecraft")) {
        tradecraft = foundry.utils.getProperty(changes, "system.tradecraft");
      }
      foundry.utils.setProperty(changes, "img", TERIOCK.CONFIG.tradecraft.tradecrafts[tradecraft]?.img);
    }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), {
      [`field.${this._source.field}`]: 1,
      [`tradecraft.${this._source.tradecraft}`]: 1,
    });
  }

  /** @inheritDoc */
  async getPanelParts() {
    return {
      ...(await super.getPanelParts()),
      bars: this._withKindBar([{
        icon: TERIOCK.CONFIG.tradecraft.tradecrafts[this._source.tradecraft].icon,
        label: _loc("TERIOCK.COMMON.Tradecraft"),
        wrappers: [TERIOCK.CONFIG.tradecraft.fields[this._source.field].label, getName(this.tradecraft)],
      }]),
    };
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    // Enforce matching tradecraft/field
    this.field = `field:${TERIOCK.CONFIG.tradecraft.tradecrafts[this._source.tradecraft]?.field ?? this._source.field}`;
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.tradecraftDescription = `<p>@Embed[${this.tradecraft} text inline=true]</p>`;
  }
}
