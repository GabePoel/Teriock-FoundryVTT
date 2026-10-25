import { listFormat } from "../../../../helpers/localization.mjs";
import { mergeMetadata } from "../../../../utils/_module.mjs";
import TakeAutomation from "../../automations/take-automation/take-automation.mjs";
import { AutomationActivationFactory } from "../abstract/_module.mjs";

export default class TakeActivation extends AutomationActivationFactory(TakeAutomation) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.consequence.crit });

  /**
   * The amount this should apply.
   * @returns {number|null}
   */
  get #amount() {
    return this.amount ?? this.getNearestDocument()?.rolls?.find(r => r.commands?.includes(this.command))?.total
      ?? null;
  }

  /**
   * Whether to show a dialog.
   * @returns {boolean}
   */
  get #showDialog() {
    if (typeof this.#amount !== "number") { return true; }
    const showDialog = game.settings.get("teriock", "showRollDialogs");
    return this.event.ctrlKey ? !showDialog : showDialog;
  }

  /**
   * Notify that this was applied to or reversed for some actors.
   * @param {{ actors: TeriockActor[], amount?: number|null, morganti?: boolean }|null} result
   * @param {"applied"|"reversed"} key
   */
  #notify(result, key) {
    if (!result) { return; }
    const message = _loc(`TERIOCK.ACTIVATIONS.Take.NOTIFICATIONS.${key}`, {
      actor: listFormat(result.actors.map(a => a.fullName)),
      amount: result.amount,
      command: this.label,
    });
    if (result.morganti) { ui.notifications.morganti(message); }
    else { ui.notifications.success(message); }
  }

  /** @inheritDoc */
  get classes() {
    return [super.classes, `${this.command}-button`].join(" ");
  }

  /** @inheritDoc */
  get label() {
    return this.display.label || TERIOCK.CONFIG.command[this.command]?.numeric?.take
      || _loc(this.constructor.typeLabel);
  }

  get tooltip() {
    const tooltip = TERIOCK.CONFIG.command[this.command]?.numeric?.tooltip;
    if (typeof this.#amount !== "number" || !tooltip) { return ""; }
    return typeof tooltip === "function" ? tooltip({ amount: this.#amount }) : _loc(tooltip, { amount: this.#amount });
  }

  /** @inheritDoc */
  get typeIcon() {
    return this.display.icon || game.teriock.commands.getValue(this.command, "icon") || this.metadata.icon;
  }

  /** @inheritDoc */
  async primaryAction() {
    const result = await game.teriock.commands.take(this.command, this.actors, {
      amount: this.#amount,
      morganti: this.morganti,
      showDialog: this.#showDialog,
    });
    this.#notify(result, "applied");
  }

  /** @inheritDoc */
  async secondaryAction() {
    this.#notify(await game.teriock.commands.reverse(this.command, this.actors, { amount: this.#amount }), "reversed");
  }
}
