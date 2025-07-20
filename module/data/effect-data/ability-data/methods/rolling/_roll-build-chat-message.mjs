import TeriockChatMessage from "../../../../../documents/chat-message.mjs";
import { elementClass } from "../../../../../helpers/html.mjs";

/**
 * Build chat message for the ability roll.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<Teriock.HTMLButtonConfig[]>} Promise that resolves to an array of button configurations.
 * @private
 */
export async function _buildChatMessage(rollConfig) {
  let content = await rollConfig.abilityData.parent.buildMessage();
  const element = document.createElement("div");
  element.innerHTML = content;
  if (rollConfig.abilityData.elderSorcery) {
    element.classList.add("es-container");
    element.style.display = "block";
    element.style.position = "relative";
    element.style.overflow = "visible";
    const esOverlay = document.createElement("div");
    esOverlay.classList.add("es-mask-overlay");
    esOverlay.classList.add(elementClass(rollConfig.abilityData.elements));
    const esRotator = document.createElement("div");
    esRotator.classList.add("es-mask-rotator");
    element.insertAdjacentElement("afterbegin", esOverlay);
    element.insertAdjacentElement("afterbegin", esRotator);
  }
  if (rollConfig.useData.formula) rollConfig.chatData.system.extraContent = element.outerHTML;
  rollConfig.chatData.speaker = TeriockChatMessage.getSpeaker({ actor: rollConfig.abilityData.actor });
  TeriockChatMessage.applyRollMode(rollConfig.chatData, game.settings.get("core", "rollMode"));
  for (const roll of rollConfig.chatData.rolls) {
    await roll.evaluate();
  }
  const msg = await TeriockChatMessage.create(rollConfig.chatData);
  console.log(msg);
}
