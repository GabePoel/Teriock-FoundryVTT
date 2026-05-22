import { iconManifest } from "../../../../constants/display/_module.mjs";
import { FluencyExecution } from "../../../../executions/document-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { dotJoin } from "../../../../helpers/string.mjs";
import { initialText } from "../../../fields/helpers/initializers.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import { CommonMacroAutomation } from "../../../pseudo-documents/automations/_module.mjs";
import * as shared from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {CleanedEffectSystem}
 * @extends {Teriock.Models.FluencySystemData}
 * @mixes CompetenceDisplaySystem
 * @mixes RevelationSystem
 * @mixes ThresholdData
 * @mixes WikiSystem
 */
export default class FluencySystem
  extends mixClasses(
    CleanedEffectSystem,
    mixins.WikiSystemMixin,
    mixins.RevelationSystemMixin,
    mixins.CompetenceDisplaySystemMixin,
    shared.ThresholdDataMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Fluency"];

  /** @inheritDoc */
  static get _automationTypes() {
    return [CommonMacroAutomation];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      namespace: "Tradecraft",
      pageNameKey: "system.tradecraft",
      type: "fluency",
      usable: true,
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 2 } }),
      field: new fields.StringField({ initial: "artisan" }),
      tradecraft: new fields.StringField({ initial: "artist", label: "TERIOCK.TERMS.Common.tradecraft" }),
      tradecraftDescription: initialText({ label: "TERIOCK.TERMS.Common.tradecraft" }),
    });
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", {
      classes: TERIOCK.display.panel.classes.derived,
      editable: false,
      label: TERIOCK.reference.tradecrafts[this.tradecraft],
      path: "system.tradecraftDescription",
    }];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.reference.tradecrafts[this.tradecraft];
    parts.text = dotJoin([TERIOCK.config.tradecraft[this.field].name, parts.text]);
    return parts;
  }

  /** @inheritDoc */
  get wikiPage() {
    const namespace = this.constructor.metadata.namespace;
    const pageName = TERIOCK.config.tradecraft[this.field].tradecrafts[this.tradecraft].name;
    return `${namespace}:${pageName}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    if (!foundry.utils.hasProperty(data, "img")) this.parent.updateSource({ img: getImage("tradecrafts", "Artist") });
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) return false;

    if (
      Object.values(iconManifest.tradecrafts).includes(this.parent.img) && !foundry.utils.hasProperty(changes, "img")
    ) {
      let tradecraft = this.tradecraft;
      if (foundry.utils.hasProperty(changes, "system.tradecraft"))
        tradecraft = foundry.utils.getProperty(changes, "system.tradecraft");
      foundry.utils.setProperty(changes, "img", getImage("tradecrafts", TERIOCK.index.tradecrafts[tradecraft]));
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  async _use(options = {}) {
    options.source = this.parent;
    await new FluencyExecution(options).execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return { ...super.getLocalRollData(), field: this.field, tc: this.tradecraft };
  }

  /** @inheritDoc */
  async getPanelParts() {
    return {
      ...(await super.getPanelParts()),
      bars: [{
        icon: TERIOCK.config.tradecraft[this.field].tradecrafts[this.tradecraft].icon,
        label: _loc("TERIOCK.TERMS.Common.tradecraft"),
        wrappers: [
          TERIOCK.config.tradecraft[this.field].name,
          TERIOCK.config.tradecraft[this.field].tradecrafts[this.tradecraft].name,
        ],
      }],
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    this.tradecraftDescription = TERIOCK.content.tradecrafts[this.tradecraft];
  }
}
