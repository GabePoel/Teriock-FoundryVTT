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
  if (rollConfig.abilityData.targets.size === 1 && rollConfig.abilityData.targets.has("self")) {
    const token = actorToken(rollConfig.useData.actor);
    if (token) {
      rollConfig.useData.targets = new Set([ token ]);
    }
  }
  //await auraMeasure(rollConfig);
}

//noinspection JSUnusedLocalSymbols
/**
 * Update targets in case of aura.
 * @todo Fix this maybe.
 * @param {AbilityRollConfig} rollConfig
 */
async function auraMeasure(rollConfig) {
  if (rollConfig.abilityData.delivery.base === "aura") {
    const token = actorToken(rollConfig.useData.actor);
    if (token) {
      let placeTemplate;
      let radius = Number(rollConfig.abilityData.range);
      let autoTarget = false;
      try {
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
              radius = Number(button.form.elements.namedItem("range").value);
              const autoTargetCheckbox = /** @type {HTMLInputElement} */ button.form.elements.namedItem("auto");
              autoTarget = autoTargetCheckbox.checked;
            },
          },
        });
      } catch {}
      if (placeTemplate && autoTarget) {
        const x = token.document.x;
        const y = token.document.y;
        const templateData = {
          t: "circle",
          x: x + (token.w) / 2,
          y: y + (token.h) / 2,
          distance: radius,
        };
        const isEthereal = token.document.hasStatusEffect("ethereal");
        /** @type {MeasuredTemplateDocument} template */
        const template = await MeasuredTemplateDocument.create(templateData, {
          parent: canvas.scene,
        });
        if (autoTarget) {
          let targets = new Set();
          canvas.scene.tokens.forEach((targetToken) => {
            let targeted = false;
            for (let i = 0; i < targetToken.width; i++) {
              for (let j = 0; j < targetToken.height; j++) {
                const point = {
                  x: targetToken.x + canvas.scene.grid.sizeX * (i + 0.5),
                  y: targetToken.y + canvas.scene.grid.sizeY * (j + 0.5),
                };
                // TODO: Replace manual calculation with more robust template position checking.
                const dist = Math.sqrt(Math.pow(point.x - templateData.x, 2) + Math.pow(point.y - templateData.y, 2));
                targeted = dist <= (radius / 5) * canvas.scene.grid.sizeX;
                if (targetToken === token) {
                  targeted = false;
                }
                if (targetToken.hasStatusEffect("ethereal") !== isEthereal) {
                  targeted = false;
                }
                if (targeted) {
                  targets.add(targetToken);
                }
              }
            }
          });
          rollConfig.useData.targets = targets;
        }
        foundry.helpers.Hooks.once("combatTurnChange", async () => {
          if (template) {
            await template.delete();
          }
        });
        foundry.helpers.Hooks.once("updateWorldTime", async () => {
          if (template) {
            await template.delete();
          }
        });
      }
    }
  }
}
