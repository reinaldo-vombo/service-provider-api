import z from 'zod';

export const createServiceZodSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Cliente é obrigatorio' }),
    description: z.string({ error: 'Serviço é obrigatorio' }),
    price: z.number({ error: 'Serviço é obrigatorio' }),
  }),
});
export const updateServiceZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
  }),
});
