# Streaming d'Objets avec le SDK AI

## 1. Le Problème avec `generateObject`

Dans l'exemple précédent, je vous ai montré comment obtenir des sorties structurées d'un LLM, mais les sorties étaient toutes générées d'un seul coup.

Nous attendions un peu, puis nous voyions toutes les sorties en même temps.

## 2. Introduction à `streamObject`

Et si vous vouliez voir les sorties au fur et à mesure qu'elles sont générées ? En d'autres termes, et si vous vouliez **streamer un objet** ?

Vous pouvez le faire en remplaçant `generateObject` par `streamObject`.

```typescript
import { type LanguageModel } from "ai"; // Assurez-vous d'importer le modèle et le schéma
import { z } from "zod";
import { streamObject } from "ai";

// Supposons que 'model' et 'schema' soient définis comme dans l'exemple précédent
declare const model: LanguageModel;
declare const schema: z.ZodSchema<any>;

export const createRecipe = async (prompt: string) => {
  const result = await streamObject({
    model,
    system:
      `Vous aidez un utilisateur à créer une recette. ` +
      `Utilisez les variantes françaises des noms d'ingrédients si possible.`,
    // `Use British English variants of ingredient names,` +
    // `like Coriander over Cilantro.`,
    schemaName: "Recipe",
    schema,
    prompt,
  });

  // Attendre l'objet final complet
  const finalObject = await result.object;

  // Supposons que l'objet final a une propriété 'recipe'
  return (finalObject as any).recipe;
};
```

Vous remarquerez quelques changements par rapport à l'exemple précédent.

Tout d'abord, nous devons attendre le résultat final de l'objet. Nous le faisons en attendant `result.object`.

La raison en est que `streamObject` retourne son résultat dès que le premier morceau arrive. Attendre `result.object` signifie que nous pouvons attendre l'objet final complet.

## Récupération des Objets Partiels

Si nous voulons accéder à l'objet partiel au fur et à mesure de sa génération, nous pouvons utiliser `result.partialObjectStream`.

```typescript
// ... (importations et définitions précédentes)

export const createRecipeStreamed = async (
  prompt: string
) => {
  const result = await streamObject({
    model,
    system:
      `Vous aidez un utilisateur à créer une recette. ` +
      `Utilisez les variantes françaises des noms d'ingrédients si possible.`,
    schemaName: "Recipe",
    schema,
    prompt,
  });

  // Itérer sur le flux d'objets partiels
  for await (const obj of result.partialObjectStream) {
    console.clear();
    console.dir(obj, { depth: null });
  }

  // Récupérer l'objet final
  const finalObject = await result.object;

  return (finalObject as any).recipe;
};
```

Ceci est un itérable asynchrone. Cela signifie que nous pouvons utiliser une boucle `for await...of` pour enregistrer chaque mise à jour de l'objet au fur et à mesure qu'elle nous est envoyée.

Nous allons d'abord effacer la console, puis enregistrer l'objet afin de le voir se construire en direct.

## Essai

Essayons cela et voyons quelles sorties nous obtenons. Demandons-lui comment faire du houmous.

```typescript
const recipe = await createRecipeStreamed(
  "Comment faire du houmous ?"
);
```

Comme vous pouvez le voir (dans l'exécution réelle), les objets arrivent au fur et à mesure qu'ils sont générés et construisent l'objet au fil du temps.

Ensuite, le dernier morceau de ce flux contient l'objet entier.

## Cas d'Utilisation

La façon dont vous utiliseriez cela dans une application serait, au lieu de simplement enregistrer les choses dans la console, d'envoyer ces morceaux sur le réseau.

De cette façon, vos utilisateurs pourraient voir l'objet se construire en temps réel. Il est toujours beaucoup plus agréable de voir un indicateur de progression plutôt que d'attendre et de tout afficher d'un seul coup.

Voilà donc ce que fait la fonction `streamObject` dans le SDK AI.
