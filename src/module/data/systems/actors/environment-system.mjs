import { mergeMetadata, toId } from "../../../utils/_module.mjs";
import BaseActorSystem from "./base-actor-system/base-actor-system.mjs";

export default class EnvironmentSystem extends BaseActorSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: super.metadata.childTypes.filter(t =>
      !["archetype", "attunement", "body", "fluency", "mount", "rank", "species"].includes(t)
    ),
    icon: TERIOCK.DISPLAY.icons.manifest.document.environment,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.environment,
    type: "environment",
  });

  /** @inheritDoc */
  get _attributeTags() {
    return [];
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const BAR = { attribute: null, type: null, value: null };

    this.parent.updateSource(
      foundry.utils.mergeObject({
        effects: [{
          name: _loc("TERIOCK.SYSTEMS.Environment.DEFAULTS.conditionImmunity"),
          system: {
            affinities: Object.fromEntries(
              Object.keys(TERIOCK.STATUSES.conditions).map(
                identifier => [toId(identifier), {
                  _id: toId(identifier),
                  category: "condition",
                  identifier,
                  type: "immunity",
                }]
              ),
            ),
          },
          type: "consequence",
        }],
        items: [{ name: _loc("TERIOCK.SYSTEMS.Environment.DEFAULTS.environmentPower"), type: "power" }],
        prototypeToken: {
          actorLink: false,
          bar1: BAR,
          bar2: BAR,
          displayBars: CONST.TOKEN_DISPLAY_MODES.NONE,
          displayName: CONST.TOKEN_DISPLAY_MODES.NONE,
          disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        },
        system: { scaling: { br: 1, brScale: true } },
      }, data),
    );
  }
}
