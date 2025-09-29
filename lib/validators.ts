import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().refine(
    (phone) => isValidPhoneNumber(phone),
    "Número de telefone inválido"
  ),
  termos: z.boolean().refine((val) => val === true, "Você deve aceitar os termos"),
});

export type FormData = z.infer<typeof formSchema>;

export const isE164 = (str: string): boolean => {
  return /^\+[1-9]\d{1,14}$/.test(str);
};

