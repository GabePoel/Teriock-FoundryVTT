const { api } = foundry.applications;
import { createAbility } from "../../helpers/create-effects.mjs";
import { fetchCategoryMembers } from "../../helpers/wiki.mjs";
import { toCamelCase } from "../../helpers/utils.mjs";
import parse from "../../logic/parsers/parse.mjs";
import TeriockChildMixin from "../mixins/child-mixin.mjs";

/**
 * @extends {Item}
 */
export default class TeriockBaseItem extends TeriockChildMixin(Item) {

  async parse(rawHTML) {
    return parse(rawHTML, this);
  }

  async disable() {
    if (!this.system.disabled) {
      this.update({ 'system.disabled': true });
      const updates = this.effects.map((effect) => {
        return { _id: effect._id, disabled: true };
      });
      this.updateEmbeddedDocuments('ActiveEffect', updates);
    }
  }

  async enable() {
    if (this.system.disabled) {
      this.update({ 'system.disabled': false });
      const toUpdate = this.effects.filter((effect) => !effect.system.forceDisabled);
      const updates = toUpdate.map((effect) => {
        return { _id: effect._id, disabled: false };
      });
      this.updateEmbeddedDocuments('ActiveEffect', updates);
    }
  }

  async setDisabled(bool) {
    if (bool) {
      await this.disable();
    } else {
      await this.enable();
    }
  }

  async toggleDisabled() {
    await this.setDisabled(!this.system.disabled);
  }

  async duplicate() {
    const copy = foundry.utils.duplicate(this);
    const copyDocument = await this.parent.createEmbeddedDocuments(this.documentName, [copy]);
    return copyDocument[0];
  }

  _buildEffectTypes() {
    const effectTypes = {};
    const effectKeys = {};
    for (const effect of this.transferredEffects) {
      const type = effect.type;
      if (!effectTypes[type]) effectTypes[type] = [];
      if (!effectKeys[type]) effectKeys[type] = new Set();
      effectTypes[type].push(effect);
      effectKeys[type].add(toCamelCase(effect.name));
    }
    return { effectTypes, effectKeys };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const { effectTypes, effectKeys } = this._buildEffectTypes();
    this.effectTypes = effectTypes;
    this.effectKeys = effectKeys;
  }

  async _bulkWikiPullHelper(pullType) {
    const pullTypeName = pullType === 'pages' ? 'Ability' : 'Category';
    let toPull;
    await api.DialogV2.prompt({
      window: { title: 'Pulling ' + pullTypeName },
      content: `<input type="text" name="pullInput" placeholder="${pullTypeName} Name" />`,
      ok: {
        label: "Pull",
        callback: (event, button, dialog) => {
          let input = button.form.elements.pullInput.value
          if (input.startsWith(`${pullTypeName}:`)) {
            input = input.slice(`${pullTypeName}:`.length);
          }
          toPull = input;
        }
      }
    })
    const pages = await fetchCategoryMembers(toPull);
    for (const page of pages) {
      if (page.title.startsWith('Ability:')) {
        await createAbility(this, page.title.replace(/^Ability:/, ''));
      }
    }
  }

  async _bulkWikiPull() {
    if (['ability', 'equipment', 'rank', 'power'].includes(this.type)) {
      const dialog = new api.DialogV2({
        window: { title: 'Bulk Wiki Pull' },
        content: 'What would you like to pull?',
        buttons: [{
          action: 'pages',
          label: 'Page',
          default: true,
        }, {
          action: 'categories',
          label: 'Category',
          default: false,
        }],
        submit: async (result) => this._bulkWikiPullHelper(result),
      });
      await dialog.render(true);
    }
  }
}
