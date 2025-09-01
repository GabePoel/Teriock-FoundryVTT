import { RollRollableTakeHandler } from "../../helpers/interaction/action-handler/instances/rollable-takes-handlers.mjs";

export default function bindCommonActions(rootElement) {
  rootElement
    .querySelectorAll("[data-action='roll-rollable-take']")
    .forEach((element) => {
      element.addEventListener("click", async function (ev) {
        const el = ev.currentTarget;
        const handler = new RollRollableTakeHandler(ev, el);
        await handler.primaryAction();
      });
      element.addEventListener("contextmenu", async function (ev) {
        const el = ev.currentTarget;
        const handler = new RollRollableTakeHandler(ev, el);
        await handler.secondaryAction();
      });
    });
}
