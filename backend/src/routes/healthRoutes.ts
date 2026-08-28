import { Router, Request, Response } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  try {
    // Verificar la conexión de la base de datos ejecutando una consulta simple
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      services: {
        database: "UP",
        server: "UP",
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Database connection failed";

    res.status(500).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      error: errorMessage,
      services: {
        database: "DOWN",
        server: "UP",
      },
    });
  }
});

export default router;
