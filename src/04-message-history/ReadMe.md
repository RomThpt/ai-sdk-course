# Gestion de l'historique des messages

Il est assez courant, lors de la création d'un chatbot, de vouloir conserver l'historique de la conversation.

Ceci permet au LLM d'avoir le contexte de la conversation que vous avez déjà eue.

Ainsi, vous pouvez poser des questions de suivi sans avoir à reformuler votre question à chaque fois.

De plus, comprendre comment les conversations sont persistées est très important pour communiquer avec le LLM via le réseau.

Nous allons montrer comment faire cela avec le SDK AI de Vercel dans cet exemple.

## Le type `CoreMessage`

Commençons par comprendre à quoi pourrait ressembler la structure d'un historique de conversation.

Le SDK AI expose un type appelé `CoreMessage`. C'est un objet qui représente un message dans une conversation.

Si nous comprenons ce type, nous comprendrons un historique de conversation - promis.

### Exploration du type `CoreMessage`

1.  **Création d'un tableau de messages :** Essayons de jouer avec pour voir ce qu'il contient. Créons un tableau `messages`, en lui attribuant le type d'un tableau de `CoreMessage`.

2.  **La propriété `role` :** Chaque message doit contenir une propriété `role`. C'est une chaîne de caractères qui peut être `user`, `system`, `assistant` ou `tool`.

3.  **La propriété `content` :** Chaque message doit également contenir une propriété `content` - c'est le contenu du message.

    Dans cet exemple, l'historique de la conversation contient un seul message de l'utilisateur disant "Bonjour, toi !".

4.  **Réponse de l'IA (`assistant`) :** Pour représenter la réponse du LLM, nous utilisons le rôle `assistant`.

5.  **Invites système (`system`) :** Nous avons brièvement examiné les invites système plus tôt. Elles sont représentées dans l'historique des messages avec le rôle `system`.

    Dans ce cas, nous disons au LLM de saluer toutes les personnes qui lui parlent.

### Exemple de code

```typescript
import { type CoreMessage } from "ai";

const messages: CoreMessage[] = [
  {
    role: "system",
    content: "Vous êtes un accueillant sympathique.", // You are a friendly greeter.
  },
  {
    role: "user",
    content: "Bonjour, toi !", // Hello, you!
  },
  {
    role: "assistant",
    content: "Salut !", // Hi there!
  },
];
```

Nous examinerons les outils plus tard lorsque nous aborderons l'appel d'outils.

Au fur et à mesure que les conversations s'allongent, ce tableau s'étoffera avec l'ajout de messages utilisateur et assistant.

Maintenant que nous comprenons le tableau `messages`, appliquons-le à un exemple (plus ou moins) concret.
