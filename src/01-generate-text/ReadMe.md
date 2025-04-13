# Génération de Texte avec AI SDK 🚀

Explorons la configuration la plus simple que l'AI SDK prend en charge : la génération de texte.

## Guide Étape par Étape 📝

### 1. Configuration de Base

Vous prenez la fonction `generateText` que vous importez depuis `ai`, vous lui passez un prompt et un modèle, et vous obtenez en retour un objet qui contient du texte.

### 2. Sélection du Modèle

Le modèle que nous utilisons est `open-mistral-7b` de Mistral, que nous obtenons depuis `@ai-sdk/mistral` de Vercel.

### 3. Personnalisation du Modèle

Si nous le souhaitons, nous pourrions spécifier un modèle différent - disons que nous utilisons `open-mistral-3b` à la place.

### 4. Implémentation de la Fonction

Nous pouvons ensuite utiliser la fonction que nous avons créée appelée `answerMyQuestion`.

Supposons que nous lui demandions "quelle est la formule chimique du monoxyde de dihydrogène ?"

Lorsque nous exécutons cela, elle appellera Anthropic avec notre requête et nous obtiendrons la réponse à la question que nous avons posée.

## Exemple de Code 💻

```typescript
import { createMistral } from "@ai-sdk/mistral";
import { LanguageModel } from "ai";
import dotenv from "dotenv";
dotenv.config();

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});
export const mistral_model: LanguageModel = mistral(
  "open-mistral-7b"
);

export const answerMyQuestion = async (
  prompt: string
) => {
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
};

const answer = await answerMyQuestion(
  "quelle est la formule chimique du monoxyde de dihydrogène ?"
);

console.log(answer);
```

## Notes Supplémentaires 📌

Il y a aussi beaucoup d'autres propriétés dans cet objet que nous recevons en retour, mais nous les aborderons dans nos autres exemples.

```typescript
// Beaucoup d'autres propriétés dans
// cet objet retourné !
const { text } = await generateText({
  model,
  prompt,
});

return text;
```
