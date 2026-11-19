# Démonstration orale

Durée cible : 3 à 5 minutes. Remplacez les deux URL par celles réellement obtenues après déploiement.

## Déroulé proposé

1. **Architecture (40 secondes).** « Nous avons séparé le système en trois tiers : le frontend sur Vercel, l'API Express sur Render et PostgreSQL sur Supabase. Le navigateur envoie des requêtes HTTPS en JSON à l'API. Les identifiants de la base restent côté serveur. GitHub déclenche les déploiements à chaque push. »
2. **Services publics (30 secondes).** Ouvrir le frontend `https://[URL-VERCEL]`, puis `/health` sur `https://[URL-RENDER]`. Montrer la réponse qui confirme l'accès à la base.
3. **Créer une demande (45 secondes).** Cliquer sur « Nouveau ticket », entrer un titre et une description, puis créer le ticket. Montrer qu'il apparaît en statut « Ouvert ».
4. **Mettre à jour (30 secondes).** Passer le statut à « En cours », puis « Résolu ». Montrer les compteurs et filtres.
5. **Persistance (30 secondes).** Actualiser la page et montrer que le ticket et son statut sont toujours présents.
6. **CI/CD et bilan (40 secondes).** Expliquer le commit de démonstration, le push GitHub et le redéploiement automatique. Indiquer un problème réellement rencontré et comment il a été résolu.

## Questions auxquelles chaque membre doit pouvoir répondre

- Que fait le frontend, que fait l'API, où sont stockées les données ?
- Où se trouve `DATABASE_URL` et pourquoi n'est-elle pas dans le frontend ?
- Que se passe-t-il entre un push GitHub et le site déployé ?
- Comment l'application contrôle-t-elle les champs et les statuts reçus ?
