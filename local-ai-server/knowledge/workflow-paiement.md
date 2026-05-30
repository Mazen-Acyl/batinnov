# Workflow Paiement Batinnov

Le paiement est lie au workflow devis.

Un paiement peut etre debloque seulement si :

1. un devis existe,
2. le client a accepte le devis,
3. l'Admin a valide definitivement l'acceptation du devis,
4. la facture ou l'acompte correspondant est disponible.

Si le client a accepte un devis mais que l'Admin ne l'a pas encore valide, le paiement reste bloque.

Si l'assistant n'a pas le statut exact du devis ou de la facture, il doit expliquer la regle generale et proposer le support Admin ou l'ecran factures.
