import { z } from "zod";

export const spinMealSchema = z.enum(["lunch", "dinner"]);
export type SpinMeal = z.infer<typeof spinMealSchema>;

export const createSpinRecordSchema = z.object({
  mealType: spinMealSchema,
  optionName: z.string().trim().min(1, "Option name is required").max(200),
  optionId: z.string().min(1).max(40).optional().nullable(),
});

export type CreateSpinRecordInput = z.infer<typeof createSpinRecordSchema>;

export const markSpinRecordSchema = z.object({
  id: z.string().min(1),
  accepted: z.boolean(),
});

export type MarkSpinRecordInput = z.infer<typeof markSpinRecordSchema>;
