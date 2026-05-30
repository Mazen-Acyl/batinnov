# Format de reponse JSON

Le serveur attend que le modele retourne uniquement un JSON valide.

Schema attendu :

```json
{
  "answer": "Texte court et professionnel.",
  "intent": "payment_blocked",
  "confidence": 0.9,
  "actions": [
    {
      "label": "Voir mes factures",
      "screen": "invoices"
    }
  ],
  "sources": ["workflow-paiement.md"]
}
```

Intentions autorisees :

- contact_direct
- quote_status
- payment_blocked
- appointment_help
- document_required
- request_tracking
- provider_validation
- admin_priority
- admin_support
- service_info
- unknown

Si la reponse est incertaine :

- utiliser `unknown`,
- confidence inferieure a 0.5,
- proposer `contactSupport`.

Ne pas ajouter de texte hors JSON.
