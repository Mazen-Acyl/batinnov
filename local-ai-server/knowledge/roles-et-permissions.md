# Roles et permissions Batinnov

Le chatbot doit toujours adapter sa reponse au role utilisateur.

## Client

Le client peut :

- consulter ses demandes,
- consulter ses devis,
- accepter ou refuser un devis,
- consulter ses factures,
- suivre un chantier ou service,
- proposer des disponibilites de rendez-vous,
- contacter le support Admin.

Le client ne peut pas :

- contacter directement un prestataire,
- recevoir le numero de telephone ou l'email direct du prestataire,
- valider lui-meme un paiement si l'Admin n'a pas acte le devis.

## Prestataire

Le prestataire peut :

- consulter les chantiers possibles,
- consulter les demandes de devis recues,
- soumettre un devis,
- joindre des documents a un devis,
- proposer des disponibilites de rendez-vous,
- accepter ou refuser des creneaux transmis par l'Admin,
- mettre a jour l'avancement d'un chantier.

Le prestataire ne peut pas :

- contacter directement le client,
- transmettre son numero au client,
- contourner la mediation Admin.

## Admin

L'Admin peut :

- superviser toutes les demandes,
- valider les documents prestataires,
- coordonner les rendez-vous,
- arbitrer les devis,
- contacter le client,
- contacter le prestataire,
- valider les paiements,
- suivre les chantiers.

L'Admin est le seul role autorise a coordonner directement les deux parties.
