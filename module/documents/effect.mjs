import { fetchWikiPageHTML } from "../helpers/wiki.mjs";
import { parse } from "../helpers/parsers/parse.mjs";
import { buildMessage } from "../helpers/message-builders/build.mjs";
import { TeriockRoll } from "../dice/roll.mjs";
const { DialogV2 } = foundry.applications.api

/**
 * @extends {ActiveEffect}
 */
export class TeriockEffect extends ActiveEffect {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  async stageUse() {
    this.system.mpCost = 0;
    this.system.hpCost = 0;
    this.system.heightenedAmount = 0;
    if (this.system.costs.mp && typeof this.system.costs.mp === "number") {
      this.system.mpCost = this.system.costs.mp;
    }
    if (this.system.costs.hp && typeof this.system.costs.hp === "number") {
      this.system.hpCost = this.system.costs.hp;
    }
    let rollFormula = '';
    if (this.system.interaction == 'attack') {
      rollFormula += '1d20'
    };
    if (this.system.interaction == 'feat') {
      rollFormula = '10'
    }
    if (this.system.forceProficient) {
      this.system.proficient = true;
    } else {
      this.system.proficient = this.parent.system.proficient;
    }
    let actor = null;
    if (this.parent.documentName == 'actor') {
      actor = this.parent;
    } else {
      actor = this.parent.parent;
    }
    const dialogs = [];
    if (this.system.costs.mp == 'x') {
      const mpDialog = `<label>MP Cost</label><input type="number" name="mp" value="0" min="0" max="${this.parent.parent.mp}" step="1"></input>`;
      dialogs.push(mpDialog);
    }
    if (this.system.costs.hp == 'x') {
      const hpDialog = `<label>HP Cost</label><input type="number" name="hp" value="0" min="0" max="${this.parent.parent.hp}" step="1"></input>`;
      dialogs.push(hpDialog);
    }
    if (this.system.proficient && this.system.heightened) {
      const p = this.system.proficient ? this.parent.parent.system.p : 0;
      const heightenedDialog = `<label>Heightened Amount</label><input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input>`;
      dialogs.push(heightenedDialog);
    }
    if (dialogs.length > 0) {
      let title = '';
      if (this.system.spell) {
        title += 'Casting ';
      } else {
        title += 'Executing ';
      }
      title += this.name;
      await DialogV2.prompt({
        window: { title: title },
        content: dialogs.join(''),
        ok: {
          label: "Confirm",
          callback: (event, button, dialog) => {
            console.log(button.form.elements)
            if (this.system.costs.mp == 'x') {
              this.system.mpCost = button.form.elements.mp.valueAsNumber;
            }
            if (this.system.costs.hp == 'x') {
              this.system.hpCost = button.form.elements.hp.valueAsNumber;
            }
            if (this.system.proficient && this.system.heightened) {
              this.system.heightenedAmount = button.form.elements.heightened.valueAsNumber;
            }
          }
        },
      });
    }
    if (['attack', 'feat'].includes(this.system.interaction)) {
      if (this.system.proficient) {
        rollFormula += ' + @p';
      }
      if (this.system.heightenedAmount) {
        rollFormula += ' + @h';
      }
    }
    this.system.formula = rollFormula;
  }

  async use() {
    await this.stageUse();
    let message = buildMessage(this).outerHTML;
    const rollData = {
      p: this.parent.parent.system.p,
      h: this.system.heightenedAmount,
    }
    if ((!this.system.formula) || !this.parent?.parent) {
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: message,
      });
    } else {
      message = await foundry.applications.ux.TextEditor.enrichHTML(message);
      const roll = new TeriockRoll(this.system.formula, rollData, {
        flavor: message,
      });
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({
          actor: this.actor,
        }),
      })
    }
    console.log('MP Cost', this.system.mpCost);
    console.log('HP Cost', this.system.hpCost);
    console.log('Heightened Amount', this.system.heightenedAmount);
    
    this.parent.parent.update({
      'system.mp': this.parent.parent.system.mp - this.system.mpCost - this.system.heightenedAmount,
      'system.hp': this.parent.parent.system.hp - this.system.hpCost,
    })
    this.system.mpCost = 0;
    this.system.hpCost = 0;
    this.system.heightenedAmount = 0;
    this.system.formula = null;
  }

  async prepareUseOld() {
    this.system.hpCost = 0;
    this.system.mpCost = 0;
    this.system.heightenedAmount = 0;
    if (this.system.forceProficient) {
      this.system.proficient = true;
    } else {
      this.system.proficient = this.parent.system.proficient;
    }
    if (this.modifiesActor) {
      if (['attack', 'feat'].includes(this.system.interaction)) {
        const p = this.system.proficient ? this.parent.parent.system.p : 0;
        let dialogs = [];
        if (this.system.mp == 'x') {
          const dialog = '<label>MP Cost</label><input type="number" name="mp" value="0" min="0" max="100" step="1"></input>';
          dialogs.push(dialog);
        }
        if (this.system.hp == 'x') {
          const dialog = '<label>HP Cost</label><input type="number" name="hp" value="0" min="0" max="100" step="1"></input>';
          dialogs.push(dialog);
        }
        if (this.system.proficient && this.system.heightened) {
          const dialog = `<label>Heightened Amount</label><input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input>`;
          dialogs.push(dialog);
        }
        if (dialogs.length > 0) {
          await DialogV2.prompt({
            window: { title: "Attack Dialog" },
            content: dialogs.join(''),
            ok: {
              label: "Confirm",
              callback: (event, button, dialog) => {
                console.log(button.form.elements)
                if (this.system.mp == 'x') {
                  this.system.mpCost = button.form.elements.mp.valueAsNumber;
                }
                if (this.system.hp == 'x') {
                  this.system.hpCost = button.form.elements.hp.valueAsNumber;
                }
                if (this.system.proficient && this.system.heightened) {
                  this.system.heightenedAmount = button.form.elements.heightened.valueAsNumber;
                }
              }
            },
            submit: result => {
              console.log(result);
            }
          });
        }
        console.log('MP Cost', this.system.mpCost);
        console.log('HP Cost', this.system.hpCost);
        console.log('Heightened Amount', this.system.heightenedAmount);
        this.system.formula = '1d20 + @p + @h'
        this.system.rollData = {
          p: this.parent.parent.system.p,
          h: this.system.heightenedAmount,
        }
      } else {
        this.system.formula = null;
        this.system.rollData = {}
      }
    } else {
      this.system.formula = null;
      this.system.rollData = {}
    }
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

  async softEnable() {
    if (!this.system.forceDisabled) {
      await this.update({ disabled: false });
    }
  }

  async softDisable() {
    await this.update({ disabled: true });
  }

  async setSoftDisabled(bool) {
    if (bool) {
      await this.softDisable();
    } else {
      await this.softEnable();
    }
  }

  async toggleSoftDisabled() {
    await this.setSoftDisabled(!this.disabled);
  }

  async setForceDisabled(bool) {
    if (bool) {
      await this.update({ disabled: true, 'system.forceDisabled': true });
    } else {
      if (this.parent.system.disabled) {
        await this.update({ disabled: true, 'system.forceDisabled': false });
      } else {
        await this.update({ disabled: false, 'system.forceDisabled': false });
      }
    }
  }

  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }

  async _wikiPull() {
    if (['ability'].includes(this.type)) {
      let pageTitle = this.system.wikiNamespace + ':'
      if (this.type === 'rank') {
        pageTitle = pageTitle + CONFIG.TERIOCK.rankOptions[this.system.archetype].classes[this.system.className].name;
      } else {
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

  /**
   * Override the default update method to include additional logic.
   * @override
   */
  // async _onCreate(data, options, userId) {
  //   super._onCreate(data, options, userId);
  //   console.log(this);
  //   const img = 'systems/teriock/assets/' + this.type + '.svg';
  //   this.update({
  //     img: img,
  //   });
  //   if (['ability', 'equipment'].includes(this.type)) {
  //     await this._wikiPull();
  //   }
  // }

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

  async shareOld() {
    const abilityMessage = buildMessage(this);

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: document.name,
      content: abilityMessage.outerHTML,
    });
    return;
  }

  async share() {
    // const message = buildMessage(this).outerHTML;
    // await this.prepareUse();
    // if (!this.system.formula) {
    //   ChatMessage.create({
    //     speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //     content: message,
    //   });
    // } else {
    //   const roll = new TeriockRoll(this.system.formula, this.system.rollData, {
    //     flavor: message,
    //   });
    //   roll.toMessage({
    //     speaker: ChatMessage.getSpeaker({
    //       actor: this.actor,
    //     }),
    //   })
    // }
    await this.use();
  }
}
