import z from 'zod';

export const createReservationZodSchema = z.object({
  body: z.object({
    // clientId: z.string({ error: 'Cliente é obrigatorio' }),
    serviceId: z.string({ error: 'Serviço é obrigatorio' }),
  }),
});
export const cancelReservationZodSchema = z.object({
  body: z.object({
    reservationId: z.string({ error: 'reservaçáo é obrigatorio' }),
    userId: z.string({ error: 'cliente é obrigatorio' }),
  }),
});
