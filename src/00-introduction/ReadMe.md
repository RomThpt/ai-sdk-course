# Introduction à l'AI SDK 🚀

## Le Problème 🤔

Il y a un problème assez courant quand on construit des applications alimentées par l'IA.

Disons que vous utilisez OpenAI comme fournisseur de LLM.

Vous développez tout un ensemble de code pour interagir avec l'API d'OpenAI.

Mais un jour, vous vous dites : « Et si on essayait Anthropic à la place ? »

> **Problème :** l'API d'Anthropic est légèrement différente.

C'est particulièrement vrai pour des choses comme :

- Le streaming
- Les sorties structurées (structured outputs)
- L'appel d'outils (tool calling)

Vous devez alors écrire tout un tas de code supplémentaire juste pour tester un nouveau modèle.

## La Solution 💡

C'est là que l'AI SDK entre en jeu.

C'est une bibliothèque que vous pouvez appeler, et qui gère l'interaction entre vous et le LLM.

Vous pouvez donc simplement appeler l'AI SDK, et il se chargera de parler aux différents fournisseurs de manière transparente.

### Fonctionnalités Clés ⭐

- Streaming de texte
- Gestion des sorties structurées
- Appel d'outils
- Exécution fluide d'agents

## FAQ ❓

### Faut-il déployer l'AI SDK sur Vercel ?

L'AI SDK est maintenu par Vercel, mais vous n'avez pas besoin d'utiliser Vercel pour l'utiliser.

> Vous n'avez rien à payer à Vercel — c'est un logiciel libre et open-source.

### Quelles sont les différentes parties de l'AI SDK ?

Il y a trois composants dans l'AI SDK :

1. **AI SDK Core** : utilisé côté backend (Node.js, Deno, Bun, etc.)
2. **AI SDK UI** : un ensemble de hooks et composants frontend
3. **AI SDK RSC** : un framework pour construire avec React Server Components

### Que couvre ce tutoriel ?

Ce tutoriel se concentre uniquement sur la partie core de l'AI SDK.

Il vous donnera les bases nécessaires pour construire pratiquement n'importe quoi.

## Installation 🛠️

Il a probablement le meilleur nom de package NPM de tous les temps : `ai`

```bash
pnpm add ai
```

### Importation des Fonctionnalités

```javascript
import {
  generateText,
  streamText,
  generateObject,
  streamObject,
} from "ai";
```

### Intégration des Fournisseurs

Par exemple, pour OpenAI :

```bash
pnpm add @ai-sdk/openai
```

```javascript
import { openai } from "@ai-sdk/openai";

const model = openai("gpt-4");
```

## Conclusion 🎯

Voilà le topo.

Vous obtenez une API unifiée dans laquelle vous pouvez facilement changer de modèles.

Vous pouvez streamer du texte, générer du texte, travailler avec des données structurées, appeler des outils, et construire des boucles d'agents.

