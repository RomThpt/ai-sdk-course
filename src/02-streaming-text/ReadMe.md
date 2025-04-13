# Génération de texte en streaming avec AI SDK

Dans notre exemple précédent, nous avons vu comment générer du texte avec le SDK AI.

Mais cela affiche le texte d'un seul coup à la fin. Et si nous avions besoin de streamer le texte jeton par jeton ?

## 2. Utilisation de `streamText`

Pour cela, nous pouvons utiliser la fonction `streamText` du SDK AI.

Elle prend un modèle et une invite exactement de la même manière, mais au lieu de retourner simplement du texte, elle retourne un `textStream`.

## 3. Le `textStream`

Le `textStream` est un itérable asynchrone. Cela signifie qu'il peut être streamé vers un fichier ou via une connexion réseau.

Dans cet exemple, nous allons simplement le streamer vers `stdout`.

Cette boucle `for` attend chaque morceau du `textStream` puis écrit ce morceau sur `stdout`.

## 4. Exemple d'exécution

Disons que nous lui demandons "quelle est la couleur du soleil ?".

Si nous exécutons ce code maintenant, nous allons le voir streamer dans notre console.

Et à partir de là, il est assez facile d'imaginer connecter cela à une requête réseau, puis simplement streamer cela vers une interface utilisateur.

## 5. La promesse `text`

La fonction `streamText` retourne également une promesse `text`.

Cela signifie que si vous voulez simplement attendre le texte complet de toute façon, vous pouvez simplement `await` la promesse.

### Exemple de code

```typescript
import { streamText } from "ai";

export const answerMyQuestion = async (
  prompt: string
) => {
  const { text } = await streamText({
    model, // Assurez-vous que 'model' est défini quelque part
    prompt,
  });

  const finalText = await text;

  return finalText; // Retourne le texte final, pas la promesse
};
```
