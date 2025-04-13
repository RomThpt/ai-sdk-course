# Sorties Structurées avec le SDK AI

Souvent, ce que vous souhaitez récupérer de votre LLM n'est pas du texte, mais une sorte d'objet.

Vous pourriez vouloir analyser un relevé bancaire pour en extraire plusieurs propriétés, comme le numéro de compte et le solde.

La manière la plus efficace de le faire est d'utiliser les **sorties structurées**.

Cela vous permet de poser une question au LLM, de lui indiquer le format dans lequel vous souhaitez la réponse, puis il vous enverra ces informations dans ce format.

Dans cet exemple, nous allons demander au LLM une recette. Nous voulons le nom de la recette, un tableau d'ingrédients et un tableau d'étapes que le chef doit suivre pour réaliser la recette.

```json
{
  "recipe": {
    "name": "Gâteau au Chocolat",
    "ingredients": [
      {
        "name": "farine",
        "amount": "2 tasses"
      },
      {
        "name": "sucre",
        "amount": "2 tasses"
      }
      // ...
    ],
    "steps": [
      "Préchauffez le four à 180°C (350°F).",
      "Mélangez la farine, le sucre, le cacao en poudre, la levure chimique, le bicarbonate de soude et le sel dans un grand bol."
      // ...
    ]
  }
}
```

## 1. Créer un schéma Zod

La première étape consiste à créer un schéma Zod qui décrit le type de données que nous souhaitons récupérer du LLM.

(Si vous n'avez jamais vu Zod auparavant, j'ai un tutoriel gratuit sur mon site sœur, Total TypeScript.)

Pour décrire la forme de la recette que nous avons ici, le schéma Zod ressemblerait à ceci :

## 2. Utiliser `generateObject`

Nous pouvons passer ce schéma directement à la fonction `generateObject` du SDK AI.

## 3. Ajouter une invite système

J'ai également ajouté une simple invite système ici pour donner à l'IA un peu de contexte sur ce que nous faisons.

Le résultat renvoyé contient une propriété appelée `object` qui contient notre recette.

Grâce à l'intelligence de TypeScript, nous bénéficions également d'un accès typé et sécurisé au nom, aux ingrédients et aux étapes.

```typescript
import { z } from "zod";
import { generateObject } from "ai";

const schema = z.object({
  recipe: z.object({
    name: z.string(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        amount: z.string(),
      })
    ),
    steps: z.array(z.string()),
  }),
});

export const createRecipe = async (prompt: string) => {
  // Assurez-vous que 'model' est défini quelque part
  const { object } = await generateObject({
    model,
    schema,
    prompt,
    system:
      `Vous aidez un utilisateur à créer une recette. ` +
      `Utilisez les variantes françaises des noms d'ingrédients si possible.`,
    // Exemple: `Utilisez les variantes de l'anglais britannique des noms d'ingrédients,` +
    // `comme Coriandre plutôt que Coriandre.` (Adaptation FR)
  });

  return object.recipe;
};
```

## Décrire les Propriétés

Mais nous n'avons pas tout à fait terminé ici. Nous devrions fournir à l'IA plus d'informations sur ce que signifie chaque propriété individuelle.

Actuellement, tout ce sur quoi elle peut se baser sont `name`, `ingredients` et `steps`.

Nous pouvons le faire en ajoutant la fonction `describe` de Zod à chaque propriété.

```typescript
const schema = z.object({
  recipe: z.object({
    name: z
      .string()
      .describe("Le titre de la recette"), // The title of the recipe
    ingredients: z
      .array(
        z.object({
          name: z.string(),
          amount: z.string(),
        })
      )
      .describe(
        "Les ingrédients nécessaires pour la recette" // The ingredients needed for the recipe
      ),
    steps: z
      .array(z.string())
      .describe("Les étapes pour réaliser la recette"), // The steps to make the recipe
  }),
});
```

Maintenant, il est clair pour l'IA ce que nous demandons pour chaque propriété. C'est particulièrement utile lorsque les noms des propriétés ne sont pas très descriptifs.

## Ajouter `schemaName`

Et enfin, nous pouvons passer une propriété `schemaName` à la fonction `generateObject` :

```typescript
const { object } = await generateObject({
  model, // Assurez-vous que 'model' est défini
  system:
    `Vous aidez un utilisateur à créer une recette. ` +
    `Utilisez les variantes françaises des noms d'ingrédients si possible.`,
  // `Use British English variants of ingredient names, like Coriander over Cilantro.`,
  schemaName: "Recipe", // Nom du schéma
  schema,
  prompt,
});
```

## Essai

Essayons cela et voyons quelles sorties nous obtenons. Demandons comment faire du Baba Ganoush.

```typescript
const recipe = await createRecipe(
  "Comment faire du baba ganoush ?" // How to make baba ganoush?
);

console.dir(recipe, { depth: null });
```

Lorsque nous exécutons cela, nous allons récupérer une recette pour le Baba Ganoush.

```bash
pnpm run example v 08
```

```json
{
  "name": "Baba Ganoush",
  "ingredients": [
    { "name": "Aubergine", "amount": "2 grosses" }, // { "name": "Aubergine", "amount": "2 large" }
    {
      "name": "Tahini",
      "amount": "3 cuillères à soupe"
    } // { "name": "Tahini", "amount": "3 tablespoons" }
    // ...
  ],
  "steps": [
    "Préchauffez le four à 200°C (400°F).",
    "Percez les aubergines plusieurs fois avec une fourchette."
    // ...
  ]
}
```

Et voilà, c'est ainsi que vous obtenez des sorties structurées avec le SDK AI.
