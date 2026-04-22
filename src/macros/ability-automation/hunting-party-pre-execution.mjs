const refAct = scope.execution.activations.find(
  (a) => a.type === "addDocuments",
);
if (refAct) {
  const flankingData = refAct.toObject();
  const snareData = refAct.toObject();
  const flankingSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "flanking",
  );
  const snareSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "snare",
  );
  if (flankingSub) {
    const children = [{ uuid: flankingSub.uuid }];
    foundry.utils.setProperty(flankingData, "primary.children", children);
    foundry.utils.setProperty(flankingData, "secondary.children", children);
    foundry.utils.setProperty(
      flankingData,
      "display.label",
      _loc("TERIOCK.COMMANDS.Status.applyNamed", {
        name: flankingSub.name,
      }),
    );
  }
  if (snareSub) {
    const children = [{ uuid: snareSub.uuid }];
    foundry.utils.setProperty(snareData, "primary.children", children);
    foundry.utils.setProperty(snareData, "secondary.children", children);
    foundry.utils.setProperty(
      snareData,
      "display.label",
      _loc("TERIOCK.COMMANDS.Status.applyNamed", {
        name: snareSub.name,
      }),
    );
  }
  const flankingActivation =
    new teriock.data.pseudoDocuments.activations.AddDocumentsActivation(
      flankingData,
    );
  const snareActivation =
    new teriock.data.pseudoDocuments.activations.AddDocumentsActivation(
      snareData,
    );
  scope.execution.activations = [flankingActivation, snareActivation];
}
