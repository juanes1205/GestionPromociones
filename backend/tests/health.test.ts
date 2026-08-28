import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

// Mockear el cliente de Prisma
jest.mock('../src/config/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

describe('GET /health', () => {
  it('debería retornar 200 OK cuando la base de datos está activa', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '1': 1 }]);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body.services).toHaveProperty('database', 'UP');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('debería retornar 500 cuando la base de datos no está operativa', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'DOWN');
    expect(response.body.services).toHaveProperty('database', 'DOWN');
  });
});
