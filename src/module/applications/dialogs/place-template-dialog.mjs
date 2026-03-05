import { TemplateAutomation } from "../../data/pseudo-documents/automations/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

export default async function placeTemplateDialog(templateData = {}) {
  const rootId = foundry.utils.randomID();
  const {
    t = "circle",
    distance = "0",
    width = "0",
    movable = false,
    angle = "45",
  } = templateData;
  const schema = TemplateAutomation.defineSchema();
  const temp = new TemplateAutomation();
  const tForm = schema.t.toFormGroup(
    { rootId, label: game.i18n.localize("TEMPLATE.FIELDS.t.label") },
    { name: "t", value: t },
  );
  const distanceForm = temp.schema.fields.distance.toFormGroup(
    {
      rootId,
      label: game.i18n.localize("TEMPLATE.FIELDS.distance.label"),
    },
    {
      name: "distance",
      value: distance,
    },
  );
  const angleForm = temp.schema.fields.angle.toFormGroup(
    { rootId, label: game.i18n.localize("TEMPLATE.FIELDS.angle.label") },
    {
      name: "angle",
      value: angle,
    },
  );
  const widthForm = temp.schema.fields.width.toFormGroup(
    { rootId },
    {
      name: "width",
      value: width,
    },
  );
  const movableForm = temp.schema.fields.movable.toFormGroup(
    {
      rootId,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.TemplateAutomation.FIELDS.movable.label",
      ),
      hint: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.TemplateAutomation.FIELDS.movable.hint",
      ),
    },
    {
      name: "movable",
      value: movable,
    },
  );
  const content = document.createElement("div");
  content.append(...[tForm, distanceForm, angleForm, widthForm, movableForm]);
  let out = false;
  await TeriockDialog.prompt({
    window: {
      title: game.i18n.localize(
        "TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.title",
      ),
    },
    content,
    ok: {
      label: game.i18n.localize(
        "TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.yes",
      ),
      callback: (_event, button) => {
        out = {
          angle: button.form.elements.namedItem("angle").value,
          distance: button.form.elements.namedItem("distance").value,
          movable: button.form.elements["movable"].checked,
          t: button.form.elements.namedItem("t").value,
          width: button.form.elements.namedItem("width").value,
        };
      },
    },
    buttons: [
      {
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.no",
        ),
        icon: makeIconClass(TERIOCK.display.icons.ui.disable, "button"),
      },
    ],
  });
  return out;
}
