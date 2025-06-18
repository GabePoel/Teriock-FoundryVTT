const { Actor } = foundry.documents;
import { MixinParentDocument } from "./mixins/parent-mixin.mjs";
import TeriockRoll from "./roll.mjs";

// Allows for typing within mixin.
/** @import Actor from "@client/documents/actor.mjs"; */

/**
 * @extends {Actor}
 */
export default class TeriockActor extends MixinParentDocument(Actor) {

  /** @inheritdoc */
  get validEffects() {
    return Array.from(this.allApplicableEffects())
  }

  /** @inheritdoc */
  getRollData() {
    return this.system.getRollData();
  }

  async takeDamage(amount) {
    await this.system.takeDamage(amount);
  }

  async takeDrain(amount) {
    await this.system.takeDrain(amount);
  }

  async takeWither(amount) {
    await this.system.takeWither(amount);
  }

  async takeHeal(amount) {
    await this.system.takeHeal(amount);
  }

  async takeRevitalize(amount) {
    await this.system.takeRevitalize(amount);
  }

  async takeHack(part) {
    await this.system.takeHack(part);
  }

  async takeUnhack(part) {
    await this.system.takeUnhack(part);
  }

  async postUpdate() {
    await this.system.postUpdate();
  }

  async rollCondition(condition, options) {
    await this.system.rollCondition(condition, options);
  }

  rollFeatSave(attribute, options = {}) {
    this.system.rollFeatSave(attribute, options);
  }

  rollResistance(options = {}) {
    this.system.rollResistance(options);
  }

  rollTradecraft(tradecraft, options = {}) {
    this.system.rollTradecraft(tradecraft, options);
  }

  useAbility(abilityName, options = {}) {
    const abilities = Array.from(this.allApplicableEffects()).filter(i => i.type === 'ability');
    const ability = abilities.find(i => i.name === abilityName);
    if (ability) {
      ability.use(options);
    } else {
      ui.notifications.warn(`${this.name} does not have ${abilityName}.`);
    }
    return;
  }

  endCondition(options = {}) {
    let rollFormula = "2d4";
    if (options.advantage) {
      rollFormula = "3d4";
    } else if (options.disadvantage) {
      rollFormula = "1d4";
    }
    rollFormula += 'kh1';
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      context: {
        diceClass: 'condition',
        threshold: 4,
      }
    });
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Condition Ending Roll",
    });
  }
}
