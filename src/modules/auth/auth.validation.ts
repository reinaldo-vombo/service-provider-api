import z from 'zod';

export const createUserZodSchema = z.object({
  body: z.object({
    fullName: z.string({ error: 'Nome completo é obrigatorio' }),
    nif: z.string({ error: 'NIF é obrigatorio' }),
    email: z.email({ error: 'Email é obrigatorio' }),
    password: z.string(),
    role: z.enum(['CLIENT', 'PROVIDER']),
  }),
});
export const logInZodSchema = z.object({
  body: z.object({
    email: z.email({ error: 'Email é obrigatorio' }),
    password: z
      .string()
      .max(15, { error: 'Palavra-passe deve conter no maximo 10 caracteres' }),
  }),
});
