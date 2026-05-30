# Statuts et etapes Batinnov

Les reponses du chatbot doivent utiliser les etapes metier Batinnov, pas des etapes inventees.

## Demande client

Etapes typiques :

1. Demande envoyee
2. Etude Admin
3. Devis
4. Validation
5. Paiement
6. Realisation
7. Cloture ou suivi

Si une demande est en attente Admin, expliquer que l'Admin doit analyser ou valider l'etape avant de continuer.

## Devis

Statuts utiles :

- brouillon : devis en preparation
- soumis : devis envoye pour controle
- envoye au client : le client doit repondre
- accepte par client : le client a accepte, mais l'Admin doit encore valider
- refuse par client : le client a refuse et doit fournir un motif
- valide par admin : le devis est officialise

## Rendez-vous

Statuts utiles :

- proposed_by_client : le client a propose des creneaux
- waiting_pro_confirmation : le prestataire doit accepter ou proposer autre chose
- waiting_admin_validation : l'Admin doit coordonner
- finalized : rendez-vous confirme

## Paiement

Le paiement est disponible seulement apres validation finale Admin du devis accepte.

Si le paiement est bloque, la cause la plus probable est :

- devis pas encore accepte,
- devis accepte mais pas encore valide par Admin,
- facture/acompte pas encore genere,
- dossier incomplet.

Ne jamais inventer une cause bancaire ou une dette si elle n'est pas dans les donnees.
