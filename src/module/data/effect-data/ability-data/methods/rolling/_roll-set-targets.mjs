//noinspection JSUnusedLocalSymbols

import { actorToken } from "../../../../../helpers/utils.mjs";

const { api } = foundry.applications;

/**
 * Set the targets for the ability.
 *
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
  //await autoTarget(rollConfig);
}

/**
 * Handle automatic targeting.
 * @param {AbilityRollConfig} rollConfig
 * @returns {Promise<void>}
 */
//eslint-disable-next-line @typescript-eslint/no-unused-vars
async function autoTarget(rollConfig) {
  if (rollConfig.abilityData.delivery.base === "aura") {
    const srcToken = rollConfig.useData.actor.token;
    if (srcToken) {
      const srcPoint = {
        x: srcToken.x,
        y: srcToken.y,
      };
      let placeTemplate;
      let autoTarget = false;
      let distance = Number(rollConfig.abilityData.range);
      placeTemplate = await api.DialogV2.prompt({
        window: { title: "Template Confirmation" },
        modal: true,
        content: `
            <p>Place measured template?</p>
            <div class="standard-form form-group">
              <label>Distance <span class="units">(ft)</span></label>
              <input name='range' type='number' min='0' step='1' value='${rollConfig.abilityData.range}'>
            </div>
            <div class="standard-form form-group">
              <label>Automatic Targets</label>
              <input name="auto" type="checkbox" checked>
            </div>
          `,
        ok: {
          label: "Yes",
          callback: (_event, button) => {
            distance = Number(button.form.elements.namedItem("range").value);
            const autoTargetCheckbox =
              /** @type {HTMLInputElement} */ button.form.elements.namedItem(
                "auto",
              );
            autoTarget = autoTargetCheckbox.checked;
          },
        },
      });
      if (placeTemplate && autoTarget) {
        const templateData = {
          t: "circle",
          x: srcPoint.x,
          y: srcPoint.y,
          distance: distance,
        };
        const templateDocument =
          await foundry.documents.MeasuredTemplateDocument.implementation.create(
            templateData,
            {
              parent: srcToken.object.scene,
            },
          );
        const template =
          /** @type {TeriockMeasuredTemplate} */ templateDocument.object;
        foundry.helpers.Hooks.once("combatTurnChange", async () => {
          if (templateDocument) {
            await templateDocument.delete();
          }
        });
        foundry.helpers.Hooks.once("updateWorldTime", async () => {
          if (templateDocument) {
            await templateDocument.delete();
          }
        });
        const testTokens = srcToken.object.scene.tokens.contents
          .filter(
            /** @param {TeriockTokenDocument} t */ (t) =>
              t.hasStatusEffect("ethereal") ===
                srcToken.hasStatusEffect("ethereal") && t.object,
          )
          .map((t) => t.object);
        const targetedTokens = testTokens.filter((t) => template.testToken(t));
        rollConfig.useData.targets = new Set(targetedTokens);
      }
    }
  }
}
