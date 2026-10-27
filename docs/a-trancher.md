# À trancher — Le QG

Assigné à : **PC 1** (à traiter au prochain démarrage de session).
Source : charte §16 + points relevés lors de l'intégration de la charte.

## Décisions de design (charte §16)
- [ ] Écrans à dessiner : Carnet de voyage, Bobine, Journal (intérieur complet), connexion, réglages, export, états vides et de chargement.
- [ ] Mode sombre : non défini (si ajouté, il s'applique à toute l'app, Journal compris).
- [ ] Forme finale des widgets personnalisables de l'accueil (liste complète à valider).

## Données
- [ ] Liste des défis mensuels (quête du QG) : sources et fréquence de mise à jour.
- [ ] Fun facts : sources et fréquence de mise à jour.

## Socle technique
- [ ] Polices Manrope en `woff2` dans `public/fonts` (hébergement local, pas de CDN).
- [ ] Icônes PWA dans `public/icons` (192, 512, maskable 512), gommette 🏡 sur fond cachemire.
- [ ] Revalider les contrastes de la charte (§3) avec un outil avant livraison.
- [ ] Hook SessionStart (synchrone) à ajouter dès que `package.json` existe.
- [ ] Renommer le dépôt GitHub `New-s-AA` en cohérence avec « Le QG » (optionnel).
