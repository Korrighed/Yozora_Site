# TODO

## Notifications

- [ ] Ajouter un moyen de relancer la demande de permission de notification depuis le site
  (ex. bouton dans le footer ou dans la section Twitch : "Enable live notifications")
  L'idée : si l'utilisateur a répondu "No" à la popup initiale, il doit pouvoir changer d'avis
  sans avoir à manipuler les paramètres du navigateur manuellement.
  → Penser à réinitialiser la clé localStorage `notification-prompt-answered` au clic.
  → Si la permission navigateur est `denied`, afficher un message expliquant comment la réactiver
    manuellement (les navigateurs ne permettent pas de re-demander après un refus explicite).
