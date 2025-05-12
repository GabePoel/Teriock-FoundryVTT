import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { parse } from "../documents/parsers/parse.mjs";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class TeriockItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    const rollData = { ...this.system };
    if (!this.actor) return rollData;
    rollData.actor = this.actor.getRollData();
    return rollData;
  }

  async disable() {
    if (!this.system.disabled) {
      this.update({ 'system.disabled': true });
      for (const effect of this.effects) {
        await effect.softDisable();
      }
    }
  }

  async enable() {
    if (this.system.disabled) {
      this.update({ 'system.disabled': false });
      for (const effect of this.effects) {
        await effect.softEnable();
      }
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

  async shatter() {
    if (this.type === 'equipment') {
      await this.update({ 'system.shattered': true });
      await this.disable();
    }
  }

  async repair() {
    if (this.type === 'equipment') {
      await this.update({ 'system.shattered': false });
      if (this.system.equipped) {
        await this.enable();
      }
    }
  }

  async setShattered(bool) {
    if (bool) {
      await this.shatter();
    } else {
      await this.repair();
    }
  }

  async toggleShattered() {
    await this.setShattered(!this.system.shattered);
  }

  async unequip() {
    if (this.type === 'equipment') {
      await this.update({ 'system.equipped': false });
      await this.disable();
    }
  }

  async equip() {
    if (this.type === 'equipment') {
      await this.update({ 'system.equipped': true });
      if (!this.system.shattered) {
        await this.enable();
      }
    }
  }

  async setEquipped(bool) {
    if (bool) {
      await this.equip();
    } else {
      await this.unequip();
    }
  }

  async toggleEquipped() {
    if (this.type === 'equipment') {
      if (this.system.equipped) {
        await this.unequip();
      } else {
        await this.equip();
      }
    }
  }

  async _wikiPull() {
    if (['ability', 'equipment', 'rank'].includes(this.type)) {
      let pageTitle = this.system.wikiNamespace + ':'
      if (this.type === 'rank') {
        pageTitle = pageTitle + CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name;
      } else if (this.type === 'equipment') {
        pageTitle = pageTitle + this.system.equipmentType;
      }
      else {
        pageTitle = pageTitle + this.name;
      }
      console.log('Fetching wiki page', pageTitle);
      const wikiContent = await fetchWikiPageHTML(pageTitle);
      if (!wikiContent) {
        return;
      }
      const changes = await parse(this, wikiContent);
      this.update(changes);
      return;
    }
  }

  _messageLabel(text, icon = null, classes = []) {
    const label = document.createElement('div');
    label.classList.add('abm-label', ...classes);
    if (icon) {
      const iconElement = document.createElement('i');
      iconElement.classList.add('fa-solid', icon);
      label.appendChild(iconElement);
    }
    label.innerHTML += text;
    return label;
  }

  async share() {
    const item = this;
    if (item.type === 'ability') {
      const systemClone = structuredClone(item.system);
      function lookup(keychain) {
        const key = keychain.split('.');
        return key.reduce((o, k) => (o || {})[k], CONFIG.TERIOCK.abilityOptions);
      }
      function wrap(parent, content) {
        if (!content) {
          return;
        }
        if (content == '') {
          return;
        }
        const wrapper = document.createElement('div');
        wrapper.classList.add('abm-label');
        wrapper.style.paddingLeft = '0.25em';
        wrapper.style.paddingRight = '0.25em';
        wrapper.style.borderRadius = '0.25em';
        wrapper.style.border = '1px solid rgba(0, 0, 0, 0.25)';
        wrapper.style.maxWidth = 'fit-content';
        wrapper.innerHTML = content;
        if (parent.querySelector('.abm-bar-tags')) {
          parent.querySelector('.abm-bar-tags').appendChild(wrapper);
        } else {
          parent.appendChild(wrapper);
        }
        return wrapper;
      }
      function box() {
        const box = document.createElement('div');
        box.classList.add('abm-box');
        box.style.width = '100%';
        box.style.display = 'flex';
        box.style.flexDirection = 'column';
        box.style.gap = '0.25em';
        return box;
      }
      function bar(parent) {
        const bar = document.createElement('div');
        bar.classList.add('abm-bar');
        bar.style.width = '100%';
        bar.style.display = 'flex';
        bar.style.flexDirection = 'row';
        bar.style.gap = '0.25em';
        bar.style.alignItems = 'center';
        const barIconContainer = document.createElement('div');
        barIconContainer.classList.add('abm-bar-icon');
        barIconContainer.style.width = '1.5em';
        barIconContainer.style.height = '1em';
        barIconContainer.style.display = 'flex';
        barIconContainer.style.alignItems = 'top';
        barIconContainer.style.flex = '0 0 auto';
        barIconContainer.style.placeSelf = 'flex-start';
        barIconContainer.style.marginTop = '0.25em';
        bar.appendChild(barIconContainer);
        const barTags = document.createElement('div');
        barTags.classList.add('abm-bar-tags');
        barTags.style.width = 'calc(100% - 1.5em)';
        barTags.style.display = 'flex';
        barTags.style.flexDirection = 'row';
        barTags.style.gap = '0.25em';
        barTags.style.flexWrap = 'wrap';
        barTags.style.alignItems = 'center';
        barTags.style.flex = '1 1 auto';
        bar.appendChild(barTags);
        parent.appendChild(bar);
        return bar;
      }
      function block(parent, title, text, italic = false) {
        if (!text) {
          return;
        }
        const block = document.createElement('div');
        block.classList.add('abm-block');
        block.style.width = '100%';
        block.style.display = 'flex';
        block.style.flexDirection = 'column';
        block.style.borderTop = '1px solid rgba(0, 0, 0, 0.25)';
        block.style.paddingTop = '0.5em';
        block.style.marginTop = '0.25em';
        const titleElement = document.createElement('div');
        titleElement.classList.add('abm-block-title');
        titleElement.innerHTML = title;
        titleElement.style.fontWeight = 'bold';
        block.appendChild(titleElement);
        const textElement = document.createElement('div');
        textElement.classList.add('abm-block-text');
        textElement.innerHTML = text;
        const tables = textElement.querySelectorAll('table');
        tables.forEach(table => table.remove());
        block.appendChild(textElement);
        parent.appendChild(block);
        if (italic) {
          textElement.style.fontStyle = 'italic';
        }
        return block;
      }
      function barIcon(parent, iconClass, first = false) {
        const container = document.createElement('div');
        container.classList.add('abm-icon-wrapper');
        container.style.width = '1.5em';
        container.style.height = '1em';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        const icon = document.createElement('i');
        icon.classList.add('fa-light', iconClass);
        icon.style.fontSize = '1em';
        container.appendChild(icon);
        if (parent.querySelector('.abm-bar-icon')) {
          console.log(parent.querySelector('.abm-bar-icon'));
          parent.querySelector('.abm-bar-icon').appendChild(container);
        } else {
          if (first) {
            parent.prepend(container);
          } else {
            parent.appendChild(container);
          }
        }
        return container;
      }

      const abilityMessage = document.createElement('div');
      const topContent = box();
      const tagContent = box();
      const mainContent = box();
      abilityMessage.classList.add('abm');
      topContent.classList.add('abm-box', 'abm-top-box');
      tagContent.classList.add('abm-box', 'abm-tag-box');
      mainContent.classList.add('abm-box', 'abm-main-box');
      abilityMessage.appendChild(topContent);
      abilityMessage.appendChild(tagContent);
      abilityMessage.appendChild(mainContent);
      topContent.style.marginBottom = '0.25em';
      const bar1 = bar(topContent);
      const bar2 = bar(topContent);
      const bar3 = bar(topContent);
      const bar4 = bar(topContent);
      const bar5 = bar(topContent);
      const bar6 = bar(topContent);
      barIcon(bar1, 'fa-wreath-laurel');
      barIcon(bar2, 'fa-crosshairs-simple');

      wrap(bar1, lookup(`executionTime.${systemClone.maneuver}.${systemClone.executionTime}`));
      wrap(bar1, lookup(`piercing.${systemClone.piercing}`));
      wrap(bar1, lookup(`delivery.${systemClone.delivery.base}`));
      if (systemClone.interaction == 'feat') {
        wrap(bar1, lookup(`featSaveAttribute.${systemClone.featSaveAttribute}`));
      }
      wrap(bar1, lookup(`interaction.${systemClone.interaction}`));
      if (['missile', 'cone', 'sight', 'aura'].includes(systemClone.delivery.base)) {
        wrap(bar2, systemClone.range);
      }
      if (systemClone.delivery.base != 'self') {
        for (const target of systemClone.targets) {
          wrap(bar2, lookup(`targets.${target}`));
        }
      }
      wrap(bar2, systemClone.duration);
      if (systemClone.expansion) {
        barIcon(bar3, 'fa-expand');
        if (['detonate', 'ripple'].includes(systemClone.expansion)) {
          wrap(bar3, lookup(`attribute.${systemClone.expansionSaveAttribute}`));
        }
        wrap(bar3, lookup(`expansion.${systemClone.expansion}`));
        for (const er of systemClone.expansionRange.split(',')) {
          wrap(bar3, er);
        }
      }
      let costs = false;
      if (systemClone.costs.mp) {
        costs = true;
        if (systemClone.costs.mp == 'x') {
          wrap(bar4, 'Variable MP');
        } else {
          wrap(bar4, `${systemClone.costs.mp}`);
        }
      }
      if (systemClone.costs.hp) {
        costs = true;
        if (systemClone.costs.hp == 'x') {
          wrap(bar4, 'Variable HP');
        } else if (systemClone.costs.hp == 'hack') {
          wrap(bar4, 'Hack');
        } else {
          wrap(bar4, `${systemClone.costs.hp}`);
        }
      }
      if (systemClone.costs.break) {
        costs = true;
        wrap(bar4, lookup(`break.${systemClone.costs.break}`));
      }
      if (systemClone.costs.verbal) {
        costs = true;
        wrap(bar4, 'Verbal');
      }
      if (systemClone.costs.somatic) {
        costs = true;
        wrap(bar4, 'Somatic');
      }
      if (systemClone.costs.material) {
        costs = true;
        wrap(bar4, 'Material');
      }
      if (systemClone.costs.invoked) {
        costs = true;
        wrap(bar4, 'Invoked');
      }
      if (costs) {
        barIcon(bar4, 'fa-coins', true);
      }
      barIcon(bar5, 'fa-bolt');
      if (systemClone.basic) {
        wrap(bar5, 'Basic');
      }
      if (systemClone.sustained) {
        wrap(bar5, 'Sustained');
      }
      if (systemClone.standard && systemClone.skill) {
        wrap(bar5, 'Semblant');
      }
      if (systemClone.standard && systemClone.spell) {
        wrap(bar5, 'Conjured');
      }
      for (const power of systemClone.powerSources) {
        wrap(bar5, lookup(`powerSources.${power}`));
      }
      for (const element of systemClone.elements) {
        wrap(bar5, lookup(`elements.${element}`));
      }
      if (systemClone.ritual) {
        wrap(bar5, 'Ritual');
      }
      if (systemClone.rotator) {
        wrap(bar5, 'Rotator');
      }
      if (systemClone.skill) {
        wrap(bar5, 'Skill');
      }
      if (systemClone.spell) {
        wrap(bar5, 'Spell');
      }
      if (systemClone.effects.length > 0) {
        barIcon(bar6, 'fa-sparkle');
        for (const effect of systemClone.effects) {
          wrap(bar6, lookup(`effects.${effect}`));
        }
      }
      const bars = topContent.querySelectorAll('.abm-bar');
      bars.forEach(bar => {
        if (!bar.querySelector('.abm-bar-tags').hasChildNodes()) {
          bar.remove();
        }
      });


      block(mainContent, 'Mana cost', systemClone.costs.manaCost);
      block(mainContent, 'Hit cost', systemClone.costs.hitCost);
      block(mainContent, 'Material cost', systemClone.costs.materialCost);
      block(mainContent, 'Trigger', systemClone.trigger);
      block(mainContent, 'Requirements', systemClone.requirements);
      block(mainContent, 'Description', systemClone.overview.base);
      block(mainContent, 'If proficient', systemClone.overview.proficient);
      block(mainContent, 'If fluent', systemClone.overview.fluent);
      block(mainContent, 'On critical fail', systemClone.results.critFail);
      block(mainContent, 'On fail', systemClone.results.fail);
      block(mainContent, 'On success', systemClone.results.save);
      block(mainContent, 'On critical success', systemClone.results.critSave);
      block(mainContent, 'On critical hit', systemClone.results.critHit);
      block(mainContent, 'On hit', systemClone.results.hit);
      block(mainContent, 'On miss', systemClone.results.miss);
      block(mainContent, 'On critical miss', systemClone.results.critMiss);
      block(mainContent, 'Heightened', systemClone.heightened);
      block(mainContent, 'End condition', systemClone.endCondition);

      if (systemClone.improvements.attributeImprovement.attribute) {
        block(mainContent, 'Attribute improvement', `This ability sets your <a
          href="https://wiki.teriock.com/index.php/Core:${lookup(`attribute.${systemClone.improvements.attributeImprovement.attribute}`)}">${lookup(`attribute.${systemClone.improvements.attributeImprovement.attribute}`)}</a> score to a minimum of ${systemClone.improvements.attributeImprovement.minVal}.`, true);
      }
      if (systemClone.improvements.featSaveImprovement.attribute) {
        block(mainContent, 'Feat save improvement', `This ability gives you <a
          href="https://wiki.teriock.com/index.php/Core:${lookup(`featSaveImprovementAmount.${systemClone.improvements.featSaveImprovement.amount}`)}_Bonus">${systemClone.improvements.featSaveImprovement.amount}</a> in <a href="https://wiki.teriock.com/index.php/Core:${lookup(`attribute.${systemClone.improvements.featSaveImprovement.attribute}`)}">${lookup(`attribute.${systemClone.improvements.featSaveImprovement.attribute}`)}</a>.`, true);
      }

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: item.name,
        content: abilityMessage.outerHTML,
      });
      return;
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    let label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
