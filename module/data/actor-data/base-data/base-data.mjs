const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import {
  _takeDamage,
  _takeDrain,
  _takeHeal,
  _takeRevitalize,
  _takeWither,
} from "./consequences/_take-numericals.mjs";
import { _defineSchema } from "./schema/_schema.mjs";
import { _getRollData } from "./_roll-data.mjs";
import { _postUpdate } from "./_post-update.mjs";
import { _prepareDerivedData } from "./data-deriving/_data-deriving.mjs";
import { _rollCondition } from "./rolling/_roll-condition.mjs";
import { _rollFeatSave, _rollResistance, _rollTradecraft } from "./rolling/_roll-generic.mjs";
import { _takeHack, _takeUnhack } from "./consequences/_take-hacks.mjs";
import { _migrateData } from "./_migrate-data.mjs";

export class TeriockBaseActorData extends TypeDataModel {

  /** @override */
  static defineSchema() {
    return _defineSchema();
  }

  /** @override */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @override */
  prepareDerivedData() {
    _prepareDerivedData(this.parent);
  }

  async takeDamage(amount) {
    await _takeDamage(this.parent, amount);
  }

  async takeDrain(amount) {
    await _takeDrain(this.parent, amount);
  }

  async takeWither(amount) {
    await _takeWither(this.parent, amount);
  }

  async takeHeal(amount) {
    await _takeHeal(this.parent, amount);
  }

  async takeRevitalize(amount) {
    await _takeRevitalize(this.parent, amount);
  }

  async takeHack(part) {
    await _takeHack(this.parent, part);
  }

  async takeUnhack(part) {
    await _takeUnhack(this.parent, part);
  }

  async rollCondition(condition, options) {
    await _rollCondition(this.parent, condition, options);
  }

  async postUpdate() {
    await _postUpdate(this.parent);
  }

  rollFeatSave(attribute, options = {}) {
    _rollFeatSave(this.parent, attribute, options);
  }

  rollResistance(options = {}) {
    _rollResistance(this.parent, options);
  }

  rollTradecraft(tradecraft, options = {}) {
    _rollTradecraft(this.parent, tradecraft, options);
  }

  getRollData() {
    return _getRollData(this.parent);
  }
}