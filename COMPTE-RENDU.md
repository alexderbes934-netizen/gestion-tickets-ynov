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

**À compléter avec votre observation réelle pendant le TP.** Exemple à vérifier si le navigateur bloque les appels : une origine frontend absente de `FRONTEND_URL` provoque un refus CORS. Ajouter l'origine exacte de Vercel dans Render, puis redéployer l'API. Conserver dans le compte rendu le message d'erreur observé et la solution effectivement appliquée par le groupe.

## Répartition du travail

À compléter avec les noms et contributions réels des membres du groupe : frontend, API, base de données, configuration des déploiements et préparation de la démonstration.
