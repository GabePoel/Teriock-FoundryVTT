const baseActivation =
  /** @type {AddDocumentsActivation} */ scope.execution.activations.find(
    (a) => a.type === "addDocuments",
  );
if (baseActivation) {
  const flankingData = baseActivation.toObject();
  const snareData = baseActivation.toObject();
  const flankingSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "flanking",
  );
  const snareSub = scope.ability.abilities.find(
    (s) => s.system?.identifier === "snare",
  );
  if (flankingSub) {
    const children = [{ uuid: flankingSub.uuid }];
    flankingData.primary.children = children;
    flankingData.secondary.children = children;
    flankingData.display.label = _loc("TERIOCK.COMMANDS.Status.applyNamed", {
      name: flankingSub.name,
    });
  }
  if (snareSub) {
    const children = [{ uuid: snareSub.uuid }];
    snareData.primary.children = children;
    snareData.secondary.children = children;
    snareData.display.label = _loc("TERIOCK.COMMANDS.Status.applyNamed", {
      name: snareSub.name,
    });
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
