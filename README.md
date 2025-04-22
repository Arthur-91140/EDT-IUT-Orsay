# EDT-IUT-Orsay
# Emploi du Temps IUT d'Orsay
# ⚠️Une panne importante est en cours sur le portage mobile du site.

Application web permettant de consulter l'emploi du temps des étudiants de l'IUT d'Orsay.


## Fonctionnalités

- **Authentification simplifiée** : Connexion via identifiant au format prénom.nom
- **Vue journalière** : Consultation détaillée des cours du jour avec informations complètes
- **Vue hebdomadaire** : Visualisation de l'emploi du temps de la semaine entière
- **Navigation temporelle** : Boutons pour naviguer entre les jours/semaines
- **Affichage par type de cours** : Différenciation visuelle selon le type d'activité (TP, CM, Projet, etc.)
- **Responsive Design** : Interface adaptée à tous les appareils

## Architecture technique

### Front-end
- HTML5, CSS3, JavaScript vanilla
- Design responsive avec CSS moderne (variables, flexbox, grid)
- Animations et transitions pour une expérience utilisateur fluide

### Back-end
- Communication avec l'API de l'IUT d'Orsay
- Gestion des réponses JSON et regroupement intelligent des séances
- Traitement des données pour un affichage optimisé

### API
L'application utilise l'API de l'IUT d'Orsay pour récupérer :
1. Le code étudiant à partir de l'identifiant
2. Les séances (cours) à partir du code étudiant et des dates
3. Les réservations éventuelles

## Flux de données

1. L'utilisateur s'authentifie avec son identifiant (prénom.nom)
2. L'application effectue une requête API pour obtenir le code étudiant
3. L'application récupère les séances et réservations pour la période demandée
4. Les données sont traitées et affichées selon la vue sélectionnée (jour/semaine)

## Structure du code

### Fichiers principaux
- `index.html` : Structure HTML de l'application
- `styles.css` : Styles et thème visuel
- `app.js` : Logique de l'application et communication avec l'API

### Organisation du JavaScript
- **Configuration** : Paramètres de l'API, couleurs par type de séance
- **État global** : Gestion de l'état de l'application
- **Éléments DOM** : Référencement des éléments HTML
- **Fonctions d'initialisation** : Configuration initiale
- **Gestionnaires d'événements** : Traitement des interactions utilisateur
- **Fonctions API** : Communication avec le serveur
- **Fonctions d'affichage** : Rendu des vues journalière et hebdomadaire
- **Fonctions utilitaires** : Formatage des dates, heures, etc.

## Modèle de données

### Structure d'une séance
```json
{
  "codeSeance": XXXXXXXX,
  "dateSeance": "2025-05-22", // Format AAAA-MM-JJ
  "heureSeance": 1115, // Format HHMM (11h15)
  "dureeSeance": 100, // Format HHMM (1h00)
  "nomMatiere": "I-S2-MATHS-STATS",
  "aliasMatiere": "I-S2-MATHS-STATS",
  "nomProf": "NomProf",
  "prenomProf": "PrenomProf",
  "nomSalle": "AMPHI HUBERT COUDANE",
  "aliasSalle": "AMPHI HC",
  "nomGroupe": "TP 2A",
  "aliasGroupe": "TP 2A",
  "nomActivite": "CM",
  "aliasActivite": "CM" // Type de séance (CM, TP, PRO, RESA, DS)
}
```

### Types de séances
- **TP** : Travaux Pratiques (fond vert)
- **CM** : Cours Magistraux (fond bleu)
- **PRO** : Projet (fond jaune)
- **RESA** : Réservation (fond rose)
- **DS** : Devoir Surveillé (fond rouge)

## Installation et déploiement

1. Clonez le dépôt
   ```bash
   git clone https://github.com/Arthur-91140/edt-iut-orsay.git
   ```

2. Ouvrez le fichier `index.html` dans votre navigateur
   ```bash
   cd edt-iut-orsay
   open index.html
   ```

3. Aucune dépendance externe n'est nécessaire, l'application est prête à l'emploi

## Sécurité

- Les identifiants API sont stockés côté client pour des raisons de simplicité, mais une solution plus sécurisée serait d'utiliser un proxy serveur.

## Personnalisation

Le design est basé sur la charte graphique de l'université Paris-Saclay.
Le design utilise des variables CSS, ce qui permet une personnalisation facile :

```css
:root {
    --primary: #63003C; /* Couleur principale */
    --primary-light: #8B0054;
    --primary-dark: #4A002D;
    
    /* Types de séances */
    --tp-bg: #dcfce7;
    --tp-border: #22c55e;
    --cm-bg: #e0e7ff;
    --cm-border: #6366f1;
    /* etc. */
}
```

## Développement futur

- Ajouter la gestion de séance de types différents (Ex. Contrôle Commun, TD, Etc...)
- Ajouter des notifications pour les changements de planning
- Implémenter un mode sombre

## Licence

Ce projet est développé par [Arthur Pruvost Rivière](https://github.com/Arthur-91140).

## Contact

Pour toute question ou suggestion, veuillez contacter le développeur.
