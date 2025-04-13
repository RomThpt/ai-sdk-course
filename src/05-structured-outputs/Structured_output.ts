import { z } from "zod";
import { mistral_model } from "../../models/mistral_model";
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
  const { object } = await generateObject({
    model: mistral_model,
    schema,
    prompt,
    system:
      `You are helping a user create a recipe. ` +
      `Use British English variants of ingredient names,` +
      `like Coriander over Cilantro.`,
  });

  return object.recipe;
};
