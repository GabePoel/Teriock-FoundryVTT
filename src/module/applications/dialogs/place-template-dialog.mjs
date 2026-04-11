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
  const temp = new TemplateAutomation();
  const tForm = temp.schema.fields.t.toFormGroup(
    { rootId, label: _loc("SHAPE.label") },
    { name: "t", value: t },
  );
  const distanceForm = temp.schema.fields.distance.toFormGroup(
    { rootId, label: _loc("MEASUREMENT.Distance") },
    {
      name: "distance",
      value: distance,
    },
  );
  const angleForm = temp.schema.fields.angle.toFormGroup(
    { rootId, label: _loc("MEASUREMENT.Angle") },
    {
      name: "angle",
      value: angle,
    },
  );
  const widthForm = temp.schema.fields.width.toFormGroup(
    { rootId, label: _loc("MEASUREMENT.Width") },
    {
      name: "width",
      value: width,
    },
  );
  const movableForm = temp.schema.fields.movable.toFormGroup(
    {
      rootId,
      label: _loc("TERIOCK.AUTOMATIONS.Template.FIELDS.movable.label"),
      hint: _loc("TERIOCK.AUTOMATIONS.Template.FIELDS.movable.hint"),
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
      title: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.title"),
    },
    content,
    ok: {
      label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.yes"),
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
        label: _loc("TERIOCK.SYSTEMS.Ability.DIALOG.PlaceTemplate.no"),
        icon: makeIconClass(TERIOCK.display.icons.ui.disable, "button"),
      },
    ],
  });
  return out;
}
