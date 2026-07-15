import hackConfig from "../../constants/config/hack-config.mjs";
import statConfig from "../../constants/config/stat-config.mjs";

const BAR_STATS = Object.keys(statConfig).filter(k => statConfig[k].bar);

/**
 * Mixin allowing hacks and spending dice stats.
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function HackStatApplicationMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockActor} document
     */
    class HackStatApplication extends Base {
      /**
       * Rolls a stat die.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onRollStatDie(_event, target) {
        const statDie = this._getStatDie(target);
        const criticallyWounded = this.document.statuses.has("criticallyWounded");
        await statDie.use(this.state?.consumeStatDice ?? true);
        if (!criticallyWounded) { await this.document.system.takeAwaken(); }
      }

      /**
       * Hacks a specific body part.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onTakeHack(event, target) {
        await onTakeHack(this.document, event, target);
      }

      /**
       * Unhacks a specific body part.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onTakeUnhack(event, target) {
        await onTakeUnhack(this.document, event, target);
      }

      /**
       * Whether this hacks in the forward or reverse direction.
       * @returns {boolean}
       */
      get _hackForward() {
        return true;
      }

      /**
       * Get a stat die from an HTML element.
       * @param {HTMLElement} target
       * @returns {StatDie}
       */
      _getStatDie(target) {
        const id = target.dataset.id;
        const stat = target.dataset.stat;
        return this.document.system[stat].dice.get(id);
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.querySelectorAll("[data-action=rollStatDie]").forEach(el => {
          el.addEventListener("contextmenu", async ev => {
            ev.preventDefault();
            await this._unrollStatDie(ev, el);
            ev.stopPropagation();
          });
        });
        this.element.querySelectorAll("[data-action=takeHack]").forEach(el => {
          el.addEventListener("contextmenu", async ev => {
            ev.preventDefault();
            if (this._hackForward) { await onTakeUnhack(this.document, ev, el); }
            else { await onTakeHack(this.document, ev, el); }
          });
        });
      }

      /**
       * Render context for a stat bar.
       * @param {Teriock.Keys.Stat} key
       * @param {object} system
       */
      _prepareBar(key, system) {
        const config = statConfig[key];
        const data = system[key] ?? { max: 0, morganti: 0, temp: 0, value: 0 };
        return {
          ...this._prepareStatContext(data),
          config,
          data,
          impact: config.impact,
          key,
          labels: {
            current: `TERIOCK.SHEETS.Actor.SIDEBAR.Bars.${key}.current`,
            max: `TERIOCK.SHEETS.Actor.SIDEBAR.Bars.${key}.max`,
            take: `TERIOCK.SHEETS.Actor.SIDEBAR.Bars.${key}.take`,
            temp: config.bar.temp ? `TERIOCK.SHEETS.Actor.SIDEBAR.Bars.${key}.temp` : null,
          },
          paths: { temp: `system.${key}.temp`, value: `system.${key}.value` },
        };
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        const system = this.document.system;
        return Object.assign(context, {
          bars: Object.fromEntries(BAR_STATS.map(k => [k, this._prepareBar(k, system)])),
          barStats: BAR_STATS,
          hackFills: Object.fromEntries(
            Object.entries(system.hacks ?? {}).map(([part, bar]) => [part, this._prepareHackFill(bar)]),
          ),
          hackParts: Object.entries(hackConfig).map(([part, options]) => ({
            fill: this._prepareHackFill(system.hacks?.[part]),
            icon: options.icon,
            label: options.label,
            part,
          })),
        });
      }

      /**
       * CSS fill class for a hacked body-part bar.
       * @param {Foundry.BarField} [bar]
       * @returns {string}
       */
      _prepareHackFill(bar) {
        const max = bar?.max || 0;
        const value = bar?.value || 0;
        if (value === 0) { return "mic fa-solid"; }
        if (value === max) { return "mic fa-faint"; }
        return "mic fa-intermediate";
      }

      /**
       * Widths and styles for a pooled stat bar.
       * @param {object} stat
       * @returns {{ lost: number, morganti: number, remaining: number, temp: number, tempHide: string }}
       */
      _prepareStatContext(stat) {
        const max = Math.max(0, stat.max ?? 0);
        const value = Math.max(0, stat.value ?? 0);
        const temp = Math.max(0, stat.temp ?? 0);
        const morganti = Math.max(0, stat.morganti ?? 0);
        const total = (max + temp + morganti) || 1;
        const remaining = Math.round((value / total) * 100);
        const tempPct = Math.round((temp / total) * 100);
        const morgantiPct = Math.round((morganti / total) * 100);
        const lost = 100 - remaining - morgantiPct - tempPct;
        let tempHide = "";
        if (!temp) { tempHide = "display: none;"; }
        else if (max === value && !morganti) { tempHide = "border-right: none;"; }
        return { lost, morganti: morgantiPct, remaining, temp: tempPct, tempHide };
      }

      /**
       * Unrolls a stat die.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      async _unrollStatDie(_event, target) {
        const statDie = this._getStatDie(target);
        await statDie.toggle(false);
      }
    }
  );
}

/**
 * Hack a specific body part.
 * @param {AnyActor} actor
 * @param {PointerEvent} event
 * @param {HTMLElement} target
 * @returns {Promise<void>}
 */
async function onTakeHack(actor, event, target) {
  event.stopPropagation();
  const part = target.dataset.part;
  if (actor.system.hacks[part].value < hackConfig[part].max) { await actor.system.takeHack(part); }
  else { await actor.system.takeUnhack(part, hackConfig[part].max); }
}

/**
 * Unhack a specific body part.
 * @param {AnyActor} actor
 * @param {PointerEvent} event
 * @param {HTMLElement} target
 * @returns {Promise<void>}
 */
async function onTakeUnhack(actor, event, target) {
  event.stopPropagation();
  const part = target.dataset.part;
  if (actor.system.hacks[part].value > 0) { await actor.system.takeUnhack(part); }
  else { await actor.system.takeHack(part, hackConfig[part].max); }
}
