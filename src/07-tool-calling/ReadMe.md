# Appel d'Outils (Tool Calling) avec le SDK AI

Jusqu'à présent, nous avons utilisé les LLM pour répondre à des questions, analyser des documents et extraire des données.

Mais ils peuvent faire bien plus que cela. Les LLM peuvent interagir avec le monde.

La manière dont ils le font est en appelant des **outils** ou des fonctions que nous leur fournissons.

Et le SDK AI de Vercel propose une solution de premier ordre pour cela.

Nous allons commencer par créer l'outil le plus simple imaginable, puis nous continuerons à partir de là.

## Création d'un Outil Simple

1.  **Objectif :** Notre outil va simplement enregistrer un message dans la console. Pour le créer, nous allons importer `tool` depuis `ai`.

2.  **Paramètres :** La première chose dont tout outil a besoin est une description des paramètres qu'il va recevoir. Nous pouvons l'ajouter en spécifiant `parameters` sur l'outil. Ceci est fait avec un schéma Zod, tout comme nous l'avons fait avec les sorties structurées auparavant.

3.  **Description des Paramètres :** Nous utilisons également `describe` pour décrire les différents paramètres pour le LLM.

4.  **Exécution (`execute`) :** Ensuite, nous devons dire ce que l'outil va faire. Nous le faisons en spécifiant une fonction `execute`. Cette fonction `execute` peut être asynchrone, elle peut donc faire pratiquement n'importe quoi - appeler des API, écrire dans une base de données, etc. Dans notre cas, nous allons simplement enregistrer dans la console.

5.  **Description de l'Outil :** Enfin, nous ajoutons un champ `description` à l'outil lui-même. Cela indique au LLM ce qu'il est censé faire avec l'outil.

```typescript
import { tool } from "ai";
import { z } from "zod";

const logToConsoleTool = tool({
  description: "Enregistre un message dans la console", // Log a message to the console
  parameters: z.object({
    message: z
      .string()
      .describe(
        "Le message à enregistrer dans la console"
      ), // The message to log to the console
  }),
  execute: async ({ message }) => {
    console.log(message);
  },
});
```

Maintenant que notre outil est créé, utilisons-le réellement dans un appel `generateText`.

## Utilisation de l'Outil dans `generateText`

1.  **Fonction d'Appel :** Créons notre fonction appelée `logToConsole`, en passant un modèle et une invite.

2.  **Invite Système :** Nous lui donnerons une invite système pour l'encourager à utiliser l'outil.

3.  **Passer l'Outil :** Et enfin, passons-lui notre outil.

```typescript
import { generateText, type LanguageModel } from "ai"; // Assurez-vous que 'model' est défini

declare const model: LanguageModel;

const logToConsole = async (prompt: string) => {
  await generateText({
    model,
    prompt,
    system:
      `Votre seul rôle dans la vie est d'enregistrer ` +
      `des messages dans la console. ` +
      `Utilisez l'outil fourni pour enregistrer ` +
      `l'invite dans la console.`,
    // `Your only role in life is to log ` +
    // `messages to the console. ` +
    // `Use the tool provided to log the ` +
    // `prompt to the console.`,
    tools: {
      logToConsole: logToConsoleTool,
    },
  });
};
```

Pour résumer, nous avons créé un outil, l'avons passé à `generateText` et lui avons donné une simple invite système.

Voyons ce qui se passe lorsque nous exécutons ceci (par exemple, en appelant `logToConsole("Bonjour, monde !")`).

```bash
Bonjour, monde!
```

Succès ! Nous voyons "Bonjour, monde !" s'afficher dans la console.

## Débogage des Appels d'Outils

C'est plutôt bien, mais c'est assez opaque. Comment pouvons-nous entrer et déboguer cela ?

1.  **Déstructurer `steps` :** Déstructurons la propriété `steps` du résultat de `generateText`. `steps` est un tableau de chacune des étapes suivies par le LLM. (Nous examinerons `steps` plus tard car cela commence à toucher à des choses intéressantes comme le comportement agentique et le raisonnement.)

2.  **Extraire `toolCalls` :** Pour l'instant, nous allons simplement extraire une propriété de la première étape effectuée, qui est `toolCalls`. Cela vous indique tous les outils qui ont été appelés pendant cette étape.

```typescript
import { generateText } from "ai";

declare const model: LanguageModel;

const logToConsoleDebug = async (prompt: string) => {
  const { steps } = await generateText({
    model,
    prompt,
    system:
      `Votre seul rôle dans la vie est d'enregistrer ` +
      `des messages dans la console. ` +
      `Utilisez l'outil fourni pour enregistrer ` +
      `l'invite dans la console.`,
    tools: {
      logToConsole: logToConsoleTool,
    },
  });

  console.dir(steps[0]?.toolCalls, { depth: null });
};
```

Lorsque nous exécutons ceci, nous pouvons voir que l'outil nommé `logToConsole` a été appelé.

Nous pouvons également voir les arguments qui lui ont été passés.

```json
[
  {
    "type": "tool-call",
    "toolCallId": "toolu_012hbsiE2sXvPrAwAvE3kgxM", // L'ID peut varier
    "toolName": "logToConsole",
    "args": { "message": "Bonjour, monde !" } // { message: 'Hello, world!' }
  }
]
```

Si nous enregistrons `toolResults` à la place...

```typescript
// ... dans la fonction logToConsoleDebug
console.dir(steps[0]?.toolResults, { depth: null });
```

...nous pouvons voir le résultat de l'appel de l'outil. Dans ce cas, nous n'avons rien retourné de notre fonction, donc c'est `undefined`.

```json
[
  {
    "toolCallId": "toolu_012hbsiE2sXvPrAwAvE3kgxM", // L'ID peut varier
    "toolName": "logToConsole",
    "args": { "message": "Bonjour, monde !" },
    "result": undefined
  }
]
```

Ces `toolResults` peuvent être renvoyés au LLM pour lui fournir plus d'informations, en particulier lorsqu'ils sont exécutés sur plusieurs étapes.

Donc, déboguer en utilisant `steps` est un moyen d'obtenir un aperçu de ce qui se passe avec vos appels d'outils.
