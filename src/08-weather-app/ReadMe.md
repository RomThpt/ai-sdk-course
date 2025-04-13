# Application Météo - Création d'un Agent avec le SDK AI

Dans notre exemple précédent, nous avons vu comment les LLM peuvent appeler des outils pour interagir avec le monde.

Mais ils peuvent faire plus que cela - ils peuvent **réagir** aux informations qu'ils reçoivent de leurs outils.

Cela peut créer une puissante boucle de rétroaction où le LLM s'ancre continuellement dans le monde réel.

Cette boucle de rétroaction est ce que la plupart des gens, y compris Anthropic, appellent des **agents**.

Le SDK AI de Vercel rend cela super facile avec un concept appelé `steps` (étapes).

Nous allons créer un agent qui peut récupérer la météo actuelle pour nous dans la ville que nous spécifions.

## Création d'un outil météo

1. **Création de l'outil :** Pour commencer, nous allons créer un outil `getWeather` (obtenirMétéo).

   Nous commencerons par lui donner une description et quelques paramètres.

2. **Implémentation de `execute` :** Ensuite, nous allons implémenter la fonction `execute`.

   Dans ce cas, nous allons simplement fournir une réponse statique en disant que la météo dans cette ville est de vingt-cinq degrés.

   Mais si nous le voulions, nous pourrions appeler une API météo pour obtenir la météo réelle.

```typescript
import { tool } from "ai";
import { z } from "zod";

const getWeatherTool = tool({
  description:
    "Obtenir la météo actuelle dans la ville spécifiée", // Get the current weather in the specified city
  parameters: z.object({
    city: z
      .string()
      .describe(
        "La ville pour laquelle obtenir la météo"
      ), // The city to get the weather for
  }),
  execute: async ({ city }) => {
    return `La météo à ${city} est de 25°C et ensoleillée.`; // The weather in ${city} is 25°C and sunny
  },
});
```

Ensuite, nous allons connecter cet outil à une fonction appelée `askAQuestion` (poserUneQuestion).

## Utilisation de l'outil dans `streamText`

1. **Appel à `streamText` :** Nous appellerons `streamText` avec un modèle et une invite, en lui passant l'outil `getWeather`.

2. **Traitement du flux :** Ensuite, nous parcourons le flux de texte et imprimons le texte sur stdout.

3. **Question météo :** Enfin, nous lui demandons quel temps il fait à Londres.

```typescript
import { streamText, type LanguageModel } from "ai";

// Assurez-vous que 'model' est défini
declare const model: LanguageModel;

const askAQuestion = async (prompt: string) => {
  const { textStream } = await streamText({
    model,
    prompt,
    tools: {
      getWeather: getWeatherTool,
    },
  });

  for await (const text of textStream) {
    process.stdout.write(text);
  }
};

await askAQuestion(`Quel temps fait-il à Londres ?`); // What's the weather in London?
```

Lorsque nous exécutons ceci, nous remarquons quelque chose d'intéressant.

```
Je vais vous aider à vérifier la météo actuelle à Londres tout de suite.
```

Nous n'obtenons pas l'information que nous recherchons ; cela dit simplement "Je vais vous aider."

Pourquoi cela se produirait-il ?

## Débogage des étapes

Déboguons cela en utilisant la même stratégie que la dernière fois : en examinant la propriété `steps` renvoyée par `streamText`.

```typescript
import { streamText, type LanguageModel } from "ai";

// Assurez-vous que 'model' est défini
declare const model: LanguageModel;

const askAQuestion = async (prompt: string) => {
  const { steps } = await streamText({
    model,
    prompt,
    tools: {
      getWeather: getWeatherTool,
    },
  });

  console.dir(await steps, { depth: null });
};

await askAQuestion(`Quel temps fait-il à Londres ?`); // What's the weather in London?
```

Comme nous utilisons `streamText`, nous devons attendre (`await`) le résultat de `steps`.

Voici ce qu'il affiche (un résultat JSON volumineux serait affiché ici).

Il y a plusieurs choses à remarquer sur ce blob JSON massif.

Premièrement, nous remarquons qu'il n'a qu'une seule étape. Le LLM n'a pris qu'une seule étape ici.

Nous pouvons voir qu'il a appelé un outil et a obtenu un résultat en retour, à partir des propriétés `toolCalls` et `toolResults`.

```json
"toolCalls": [
  {
    "type": "tool-call",
    "toolCallId": "toolu_011n3T6TJnwZLyR4G8h1ZcMz",
    "toolName": "getWeather",
    "args": { "city": "Londres" } // { city: 'London' }
  }
],
"toolResults": [
  {
    "type": "tool-result",
    "toolCallId": "toolu_011n3T6TJnwZLyR4G8h1ZcMz",
    "toolName": "getWeather",
    "args": { "city": "Londres" }, // { city: 'London' }
    "result": "La météo à Londres est de 25°C et ensoleillée." // The weather in London is 25°C and sunny.
  }
]
```

Le LLM a donc appelé l'outil `getWeather` avec la ville de Londres et a reçu le résultat indiquant que la météo à Londres est de 25°C et ensoleillée.

Mais il a ensuite décidé de s'arrêter.

Il semble donc que le LLM ait fait la bonne chose ; il a appelé l'outil mais s'est ensuite arrêté pour une raison quelconque. Comment lui faire faire plus d'une étape ?

## `maxSteps` - Contrôle du nombre d'étapes

Par défaut, le SDK AI ne permet au LLM de faire qu'une seule étape.

Si nous voulons lui permettre de faire plus d'étapes, nous pouvons passer `maxSteps` à `streamText`.

```typescript
const { textStream } = await streamText({
  model,
  prompt,
  tools: {
    getWeather: getWeatherTool,
  },
  maxSteps: 2, // Permet au maximum 2 étapes
});
```

Cela force cette boucle à s'arrêter après seulement deux étapes.

Lorsque nous exécutons cela, nous obtenons une sortie vraiment intéressante :

```
Je vais vous aider à vérifier la météo actuelle à Londres tout de suite.

Il semble que Londres connaisse une journée agréable avec un temps ensoleillé et une température de 25°C (ce qui correspond à environ 77°F). Cela semble être une excellente journée pour être dehors et profiter du beau temps !
```

Nous pouvons voir que le LLM réagit maintenant aux informations fournies par l'outil.

Et si nous enregistrons les étapes à nouveau, nous pouvons voir que deux étapes ont été prises.

## Signaux d'arrêt

Que se passerait-il si nous spécifiions plus de deux étapes ? Essayons d'augmenter `maxSteps` à 10 juste pour voir ce qui se passe.

Il s'avère que nous obtenons à peu près le même résultat.

Le LLM s'arrête après deux étapes.

Nous pouvons voir que dans la deuxième étape, il a une raison de fin (`finishReason`) de `stop` :

```
"finishReason": "stop"
```

Cela est dû au fait que le LLM dispose d'un mécanisme intégré pour s'arrêter après avoir terminé sa tâche.

Cela signifie qu'il y a deux façons pour cette boucle de se terminer. Soit le LLM s'arrête lui-même, soit il atteint son `maxSteps`.

Ce n'est pas une bonne idée de spécifier `maxSteps` comme `Infinity` car parfois le LLM ne s'arrêtera tout simplement pas de lui-même.

## Conclusion

Pour conclure, nous avons vu comment créer une simple boucle agentique avec le SDK AI de Vercel.

L'utilisation de `maxSteps` permet au LLM de prendre plusieurs étapes et de réagir à ses propres résultats d'outils.

Cela vous permet de construire des systèmes qui ancrent le LLM dans la réalité et le rendent plus utile.
