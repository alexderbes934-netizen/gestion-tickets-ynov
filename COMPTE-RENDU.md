# Compte rendu technique

## Projet

Clair est une application web de suivi des demandes informatiques. Un collaborateur peut consulter les tickets, en créer un et faire évoluer son statut. Les tickets sont conservés dans une base PostgreSQL.

## Architecture et hébergement

Le projet suit une architecture trois tiers. L'interface Vite est publiée sur Vercel. Elle échange avec une API Express hébergée sur Render en HTTPS et au format JSON. L'API interroge PostgreSQL hébergé sur Supabase au moyen d'une variable `DATABASE_URL` protégée côté serveur.

GitHub versionne le code et déclenche les redéploiements de Vercel et Render après un push sur la branche principale. Les URL à renseigner après mise en ligne sont :

- Frontend : `https://[URL-VERCEL]`
- API : `https://[URL-RENDER]`
- Vérification : `https://[URL-RENDER]/health`

## Configurations principales

La base est créée à partir de `database/schema.sql`. Render reçoit `DATABASE_URL`, `DATABASE_SSL=true` et `FRONTEND_URL`. Vercel reçoit `VITE_API_URL`. Les secrets de base de données ne sont pas transmis au navigateur. L'API vérifie les champs et les statuts autorisés; CORS limite les appels à l'origine du frontend.

## Vérifications à consigner après déploiement

- `/health` renvoie un état `ok` et une base `connected`.
- La création d'un ticket renvoie HTTP 201 et le ticket s'affiche.
- Le changement de statut est visible après actualisation.
- Un push modifiant l'interface déclenche un nouveau déploiement visible.

## Problème rencontré et résolution

**À compléter avec votre observation réelle pendant le TP.** Lors du premier déploiement, l’interface hébergée sur Vercel ne parvenait pas à charger la liste des tickets. Le navigateur signalait un blocage CORS lors de l’appel à l’API Render : l’adresse du frontend n’était pas encore autorisée par le backend, dont la configuration indiquait toujours l’adresse utilisée en local. Nous avons corrigé la variable `FRONTEND_URL` dans les paramètres du service Render en y indiquant l’adresse exacte du site Vercel, puis nous avons redéployé l’API. Après le redéploiement, le frontend a pu récupérer les tickets et l’affichage a fonctionné.

## Répartition du travail entre DERBES Alexy / POTTIER Sylvain / BLONDEAU Ayrton

DERBES Alexy — Frontend et interface utilisateur
Alexy a pris en charge l’interface de l’application : affichage de la liste des tickets, formulaire de création et changement de statut. Il a également relié l’interface aux routes de l’API et participé à la configuration du déploiement frontend sur Vercel.

POTTIER Sylvain — Backend et API
j'ai réalisé l’API chargée de récupérer les tickets, d’en créer et de modifier leur statut. je me suis occupé de la validation des données, des réponses JSON et de la route /health, puis a participé au déploiement du backend sur Render et à la configuration de ses variables d’environnement.

BLONDEAU Ayrton — Base de données et suivi du déploiement
Ayrton a préparé le modèle de données PostgreSQL et la table tickets, puis configuré le lien entre la base Supabase et le backend afin d’assurer la persistance des demandes. Il a également contribué au schéma d’architecture, à la documentation du projet et à la vérification du redéploiement après un push sur GitHub.

Travail réalisé en commun
Les trois membres ont participé à l’intégration des composants et à la vérification des fonctionnalités attendues : consulter les tickets, en créer un, modifier son statut et vérifier que les données restent présentes après actualisation.
