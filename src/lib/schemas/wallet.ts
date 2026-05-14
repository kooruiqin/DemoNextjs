import { z } from "zod";

export const walletKindSchema = z.enum(["in", "out"]);
export type WalletKindInput = z.infer<typeof walletKindSchema>;

export const createWalletEntrySchema = z.object({
  kind: walletKindSchema,
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0,
      "Must be a positive number with up to 2 decimals",
    ),
  place: z.string().max(120).optional(),
  description: z.string().max(280).optional(),
  occurredAt: z.iso.date(),
  labelIds: z.array(z.string()),
});

export type CreateWalletEntryInput = z.infer<typeof createWalletEntrySchema>;

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

export const createWalletLabelSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Name too long"),
  color: z.string().regex(HEX_COLOR, "Must be a hex color like #f97316"),
});

export type CreateWalletLabelInput = z.infer<typeof createWalletLabelSchema>;
