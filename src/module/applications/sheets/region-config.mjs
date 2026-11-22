import { UnitField } from "../../data/fields/_module.mjs";
import { RegionDurationUnitModel } from "../../data/models/unit-models/_module.mjs";
import { makeIconClass, omit } from "../../utils/_module.mjs";

const { RegionConfig } = foundry.applications.sheets;

/**
 * @import * as hookEvents from "@client/hooks.mjs";
 */

/** @inheritDoc */
export default class TeriockRegionConfig extends RegionConfig {
  /** @inheritDoc */
  static PARTS = {
    ...omit(super.PARTS, ["footer"]),
    duration: { template: "teriock/sheets/region-duration" },
    footer: super.PARTS.footer,
  };

  /** @inheritDoc */
  static TABS = {
    sheet: {
      ...super.TABS.sheet,
      tabs: [...super.TABS.sheet.tabs, {
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.time, "solid"),
        id: "duration",
        label: "TERIOCK.SHEETS.Region.TABS.duration",
      }],
    },
  };

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (partId !== "duration") { return context; }
    const startTime = this.document.getFlag("teriock", "startTime");
    const remaining = this.document.secondsRemaining;
    return Object.assign(context, {
      durationField: new UnitField(RegionDurationUnitModel, {
        label: _loc("TERIOCK.SHEETS.Region.FIELDS.duration.label"),
      }),
      durationValue: this.document.duration.toObject(),
      remaining: Number.isFinite(remaining) ? game.time.calendar.format(Math.max(remaining, 0), "duration") : null,
      start: Number.isFinite(startTime) ? game.time.calendar.format(game.time.worldTime - startTime, "ago") : null,
    });
  }
}

/**
 * Re-render sheets to show updated durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function updateRegionDurations() {
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof TeriockRegionConfig) { app.render({ parts: ["duration"] }); }
  }
}
Hooks.on("updateWorldTime", updateRegionDurations);
