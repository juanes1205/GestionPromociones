import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import { PromotionStatus } from '@prisma/client';

// Mockear Prisma
jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findUnique: jest.fn(),
    },
    promotion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe('Pruebas unitarias de validaciones y reglas del Módulo de Promociones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/promotions - Creación de Promociones', () => {
    it('debería retornar 400 si falta el nombre', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .send({
          categoryId: 1,
          discountType: 'PORCENTAJE',
          discountValue: 20,
          startDate: '2026-08-27T00:00:00.000Z',
          endDate: '2026-08-28T00:00:00.000Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('nombre es obligatorio');
    });

    it('debería retornar 400 si la fecha de fin no es posterior a la de inicio', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .send({
          name: 'Promo Inválida',
          categoryId: 1,
          discountType: 'PORCENTAJE',
          discountValue: 20,
          startDate: '2026-08-28T00:00:00.000Z',
          endDate: '2026-08-27T00:00:00.000Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('fecha de fin debe ser posterior');
    });

    it('debería retornar 400 si es tipo Porcentaje y valor fuera del rango 1-100', async () => {
      const response = await request(app)
        .post('/api/promotions')
        .send({
          name: 'Promo Inválida',
          categoryId: 1,
          discountType: 'PORCENTAJE',
          discountValue: 150,
          startDate: '2026-08-27T00:00:00.000Z',
          endDate: '2026-08-28T00:00:00.000Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('entre 1 y 100');
    });

    it('debería crear exitosamente con parámetros válidos', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 1, name: 'Tecnología' });
      (prisma.promotion.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Promo Tech',
        categoryId: 1,
        discountType: 'PORCENTAJE',
        discountValue: 20,
        startDate: new Date('2026-08-27T00:00:00.000Z'),
        endDate: new Date('2026-08-28T00:00:00.000Z'),
        status: 'PROGRAMADA',
      });

      const response = await request(app)
        .post('/api/promotions')
        .send({
          name: 'Promo Tech',
          categoryId: 1,
          discountType: 'PORCENTAJE',
          discountValue: 20,
          startDate: '2026-08-27T00:00:00.000Z',
          endDate: '2026-08-28T00:00:00.000Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('PROGRAMADA');
    });
  });

  describe('PUT /api/promotions/:id - Modificación', () => {
    it('debería retornar 400 si se intenta modificar una promoción en estado FINALIZADA', async () => {
      (prisma.promotion.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Promo Viejita',
        status: PromotionStatus.FINALIZADA,
      });

      const response = await request(app)
        .put('/api/promotions/1')
        .send({ name: 'Intento de cambio' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Finalizada no puede modificarse');
    });
  });

  describe('DELETE /api/promotions/:id - Eliminación', () => {
    it('debería retornar 400 si se intenta eliminar una promoción en estado ACTIVA o FINALIZADA', async () => {
      (prisma.promotion.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Promo Activa',
        status: PromotionStatus.ACTIVA,
      });

      const response = await request(app).delete('/api/promotions/1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('estado Programada');
    });

    it('debería eliminar exitosamente si la promoción está en estado PROGRAMADA', async () => {
      (prisma.promotion.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Promo Planificada',
        status: PromotionStatus.PROGRAMADA,
      });
      (prisma.promotion.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app).delete('/api/promotions/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('eliminada con éxito');
    });
  });
});
