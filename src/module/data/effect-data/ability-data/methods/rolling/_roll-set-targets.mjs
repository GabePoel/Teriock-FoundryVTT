import { TeriockDialog } from "../../../../../applications/api/_module.mjs";
import { TeriockAbilityTemplate } from "../../../../../canvas/placeables/_module.mjs";
import { actorToken } from "../../../../../helpers/utils.mjs";

/**
 * Set the targets for the ability.
 * @param {AbilityRollConfig} rollConfig
 */
export async function _setTargets(rollConfig) {
  const user = /** @type {TeriockUser} */ game.user;
  rollConfig.useData.targets = user.targets;
  if (
    rollConfig.abilityData.targets.size === 1 &&
    rollConfig.abilityData.targets.has("self")
  ) {
    const token = actorToken(rollConfig.useData.actor);
    if (token) {
      rollConfig.useData.targets = new Set([token]);
    }
  }
  if (
    rollConfig.abilityData.isAoe &&
    !rollConfig.useData.noTemplate &&
    game.settings.get("teriock", "placeTemplateOnAbilityUse")
  ) {
    let placeTemplate;
    let distance = Number(rollConfig.abilityData.range);
    placeTemplate = await TeriockDialog.prompt({
      window: { title: "Template Confirmation" },
      modal: true,
      content: `
            <p>Place measured template?</p>
            <div class="standard-form form-group">
              <label>Distance <span class="units">(ft)</span></label>
              <input name='range' type='number' min='0' step='1' value='${rollConfig.abilityData.range}'>
            </div>
          `,
      ok: {
        label: "Yes",
        callback: (_event, button) => {
          distance = Number(button.form.elements.namedItem("range").value);
        },
      },
    });
    if (placeTemplate) {
      const abilityTemplate = TeriockAbilityTemplate.fromRollConfig(
        rollConfig,
        { distance: distance },
      );
      await abilityTemplate.drawPreview();
    }
  }
}
