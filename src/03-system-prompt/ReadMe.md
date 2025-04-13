# Invites Système (System Prompts)

Parfois, vous avez besoin que l'IA agisse d'une certaine manière, quelle que soit l'invite qu'elle reçoit.

Dans cet exemple, nous voulons que l'IA résume le texte qu'elle reçoit.

Nous voulons lui donner un rôle. Nous voulons lui donner des instructions.

Et nous voulons faire tout cela avant qu'elle ne reçoive l'invite de l'utilisateur.

## 1. Utilisation d'une invite système

Pour ce faire, nous pouvons utiliser une **invite système** (system prompt).

Avec le SDK AI de Vercel, il suffit de passer une propriété `system`.

## 2. Fonctionnement interne

Sous le capot, cela ajoute au début un message spécial avec le rôle "system" contenant notre invite système.

Nous pourrions également le faire dans le SDK AI si nous le voulions. Vous pouvez passer une propriété `messages` qui contient un tableau de messages.

Cela peut être fait dans `generateText`, `streamText`, et toutes les autres API qui contactent les LLM et la GenAI.

### Exemple de code

```typescript
const { text } = await generateText({
  model, // Assurez-vous que 'model' est défini quelque part
  messages: [
    {
      role: "system",
      content:
        `Vous êtes un synthétiseur de texte. ` +
        `Résumez le texte que vous recevez. ` +
        `Soyez concis. ` +
        `Retournez uniquement le résumé. ` +
        `N'utilisez pas la phrase "voici un résumé". ` +
        `Mettez en évidence les phrases pertinentes en **gras**. ` +
        `Le résumé doit faire deux phrases. `,
    },
    {
      role: "user",
      content: input, // Assurez-vous que 'input' est défini quelque part
    },
  ],
});
```

Travailler avec les invites système est l'un des aspects clés de l'utilisation des LLM, il est donc très appréciable que le SDK AI le rende si facile.

Dans notre prochain exemple, nous verrons à quel point il est facile d'échanger vos modèles chaque fois que vous en avez besoin.
