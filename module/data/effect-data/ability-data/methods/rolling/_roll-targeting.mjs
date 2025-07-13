const { api } = foundry.applications;

/**
 * Extracts token information from a target.
 * Gets name, actor, and image from the target's token or actor data.
 *
 * @param {object} target - The target to extract token information from.
 * @returns {object} Object containing token name, actor, and image.
 * @private
 */
export function tokenFromTarget(target) {
  const actor = target.actor;
  const img =
    target.texture?.src ||
    actor.token?.texture?.src ||
    actor.getActiveTokens()[0]?.texture?.src ||
    actor.prototypeToken?.texture?.src ||
    actor.img;
  const name = target.name || actor.token?.name || actor.prototypeToken?.name || actor.name;
  return {
    name,
    actor,
    img,
  };
}

/**
 * Gets targets for the ability, handling self-targeting logic.
 * Returns array of targets or creates self-target if ability targets self.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to get targets for.
 * @returns {Array} Array of target objects.
 * @private
 */
export function _getTargets(abilityData) {
  let targets = Array.from(game.user.targets);
  const targetsSelf = abilityData.targets?.length === 1 && abilityData.targets[0] === "self";
  const includesSelf = Array(abilityData.targets)?.includes("self");

  if (targetsSelf || (includesSelf && targets.length === 0)) {
    const actor = abilityData.parent.actor;
    const activeToken = actor.getActiveTokens?.()?.[0];
    const tokenName = actor.token?.name || activeToken?.name || actor.prototypeToken?.name || actor.name;
    const tokenActorSrc = actor.token?.actor?.token?.texture?.src;
    const activeTokenSrc = activeToken?.actor?.token?.texture?.src;
    const prototypeSrc = actor.prototypeToken?.texture?.src;
    const tokenImg = actor.token?.texture?.src || tokenActorSrc || activeTokenSrc || prototypeSrc || actor.img;
    const token = actor.token || activeToken || actor.prototypeToken || null;
    targets = [
      {
        name: tokenName,
        actor: actor,
        img: tokenImg,
        uuid: token?.document?.uuid || actor.uuid,
      },
    ];
  }

  return targets;
}

/**
 * Option to create a measured template.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to generate template from.
 * @returns {Promise<object>}
 */
export async function _measure(abilityData) {
  const measureData = {};
  if (abilityData.delivery.base === "aura") {
    const token =
      abilityData.actor.token || abilityData.actor.getActiveTokens()[0] || abilityData.actor.prototypeToken || null;
    if (token) {
      let placeTemplate;
      let radius = Number(abilityData.range);
      let autoTarget = false;
      try {
        placeTemplate = await api.DialogV2.prompt({
          window: { title: "Template Confirmation" },
          modal: true,
          content: `
            <p>Place measured template?</p>
            <div class="standard-form form-group">
              <label>Distance <span class="units">(ft)</span></label>
              <input name='range' type='number' min='0' step='1' value='${abilityData.range}'>
            </div>
            <div class="standard-form form-group">
              <label>Automatic Targets</label>
              <input name="auto" type="checkbox" checked>
            </div>
          `,
          ok: {
            label: "Yes",
            callback: (event, button) => {
              radius = Number(button.form.elements.namedItem("range").value);
              const autoTargetCheckbox = /** @type {HTMLInputElement} */ button.form.elements.namedItem("auto");
              autoTarget = autoTargetCheckbox.checked;
            },
          },
        });
      } catch {
        return measureData;
      }
      if (placeTemplate) {
        const x = token.x;
        const y = token.y;
        const templateData = {
          t: "circle",
          x: x + (token.width * canvas.scene.grid.sizeX) / 2,
          y: y + (token.height * canvas.scene.grid.sizeY) / 2,
          distance: radius,
        };
        const isEthereal = token.hasStatusEffect("ethereal");
        /** @type {MeasuredTemplateDocument} template */
        const template = await MeasuredTemplateDocument.create(templateData, { parent: canvas.scene });
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
                if (targetToken === token) targeted = false;
                if (targetToken.hasStatusEffect("ethereal") !== isEthereal) targeted = false;
                if (targeted) {
                  targets.add(targetToken);
                }
              }
            }
          });
          measureData.targets = Array.from(targets);
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
  return measureData;
}
