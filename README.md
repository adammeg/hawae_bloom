# HawaeMD Patiente

Application mobile Expo destinée aux patientes. Cette première version fonctionne avec des données locales et statiques.

## Fonctionnalités

- tableau de bord personnel ;
- onboarding de première ouverture avec prénom et dernier début de règles ;
- calendrier menstruel avec règles, prochaine période, fenêtre fertile et ovulation estimées ;
- préférences de cycle conservées localement ;
- annuaire statique de médecins HawaeMD, prêt à être remplacé par une API ;
- conseils grossesse filtrés par trimestre ;
- interface HawaeMD féminine, moderne et accessible.

## Lancer l'application

```powershell
npm.cmd install
npm.cmd start
```

## Préparer l'API

Les écrans ne lisent pas directement des constantes :

- `src/data/doctors.ts` expose `listDoctors()` ;
- `src/data/tips.ts` expose `listPregnancyTips()` ;
- `.env.example` prépare `EXPO_PUBLIC_API_URL`.

Lorsque le contrat API sera fourni, ces fonctions pourront être remplacées par un client HTTP sans modifier les composants visuels.

## Avertissement

Les estimations du cycle et les conseils sont informatifs. L'application ne remplace pas une consultation médicale, une contraception ou une prise en charge d'urgence.
