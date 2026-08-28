import { Request, Response } from "express";
import prisma from "../config/prisma";
import { DiscountType, PromotionStatus } from "@prisma/client";

// Helper para actualizar automáticamente los estados basado en las fechas vigentes
const syncPromotionStatuses = async () => {
  const now = new Date();

  // 1. Programada -> Activa (si ya inició y no ha vencido)
  await prisma.promotion.updateMany({
    where: {
      status: PromotionStatus.PROGRAMADA,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    data: {
      status: PromotionStatus.ACTIVA,
    },
  });

  // 2. Programada / Activa -> Finalizada (si ya venció)
  await prisma.promotion.updateMany({
    where: {
      status: { in: [PromotionStatus.PROGRAMADA, PromotionStatus.ACTIVA] },
      endDate: { lt: now },
    },
    data: {
      status: PromotionStatus.FINALIZADA,
    },
  });
};

// Obtener todas las promociones
export const getPromotions = async (_req: Request, res: Response) => {
  try {
    await syncPromotionStatuses();
    const promotions = await prisma.promotion.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json(promotions);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching promotions";

    return res.status(500).json({ error: message });
  }
};

// Crear una nueva promoción
export const createPromotion = async (req: Request, res: Response) => {
  try {
    const {
      name,
      categoryId,
      discountType,
      discountValue,
      startDate,
      endDate,
    } = req.body;

    // 1. Validaciones de presencia
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (!categoryId) {
      return res
        .status(400)
        .json({ error: "La categoría asociada es obligatoria" });
    }
    if (!discountType) {
      return res
        .status(400)
        .json({ error: "El tipo de descuento es obligatorio" });
    }
    if (discountValue === undefined || discountValue === null) {
      return res
        .status(400)
        .json({ error: "El valor del descuento es obligatorio" });
    }
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Las fechas de inicio y fin son obligatorias" });
    }

    // Parsear fechas
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Validación de fechas (fin posterior a inicio)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Formatos de fecha inválidos" });
    }
    if (end <= start) {
      return res.status(400).json({
        error: "La fecha de fin debe ser posterior a la fecha de inicio",
      });
    }

    // 3. Validación de tipo de descuento y valor
    if (
      discountType !== DiscountType.PORCENTAJE &&
      discountType !== DiscountType.MONTO_FIJO
    ) {
      return res.status(400).json({
        error: "Tipo de descuento no válido (debe ser PORCENTAJE o MONTO_FIJO)",
      });
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      return res
        .status(400)
        .json({ error: "El valor de descuento debe ser un número positivo" });
    }

    if (discountType === DiscountType.PORCENTAJE && (val < 1 || val > 100)) {
      return res.status(400).json({
        error:
          "Si el tipo de descuento es Porcentaje, el valor debe estar entre 1 y 100",
      });
    }

    // Verificar si existe la categoría
    const categoryExists = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!categoryExists) {
      return res
        .status(404)
        .json({ error: "La categoría especificada no existe" });
    }

    // Crear promoción (estado inicial: PROGRAMADA)
    const newPromotion = await prisma.promotion.create({
      data: {
        name,
        categoryId: Number(categoryId),
        discountType,
        discountValue: val,
        startDate: start,
        endDate: end,
        status: PromotionStatus.PROGRAMADA,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(newPromotion);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating promotion";

    return res.status(500).json({ error: message });
  }
};

// Modificar una promoción existente
export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      categoryId,
      discountType,
      discountValue,
      startDate,
      endDate,
    } = req.body;

    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    // 1. Una promoción en estado Finalizada no puede modificarse
    if (promotion.status === PromotionStatus.FINALIZADA) {
      return res.status(400).json({
        error: "Una promoción en estado Finalizada no puede modificarse",
      });
    }

    // Validar y parsear entradas si están presentes
    const updatedData: any = {};

    if (name !== undefined) {
      if (!name.trim())
        return res
          .status(400)
          .json({ error: "El nombre no puede estar vacío" });
      updatedData.name = name;
    }

    if (categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });
      if (!categoryExists)
        return res
          .status(404)
          .json({ error: "La categoría especificada no existe" });
      updatedData.categoryId = Number(categoryId);
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(promotion.startDate);
    const end = endDate ? new Date(endDate) : new Date(promotion.endDate);

    if (startDate || endDate) {
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Formatos de fecha inválidos" });
      }
      if (end <= start) {
        return res.status(400).json({
          error: "La fecha de fin debe ser posterior a la fecha de inicio",
        });
      }
      updatedData.startDate = start;
      updatedData.endDate = end;
    }

    const type = discountType || promotion.discountType;
    const val =
      discountValue !== undefined
        ? parseFloat(discountValue)
        : promotion.discountValue;

    if (discountType !== undefined) {
      if (
        discountType !== DiscountType.PORCENTAJE &&
        discountType !== DiscountType.MONTO_FIJO
      ) {
        return res.status(400).json({ error: "Tipo de descuento no válido" });
      }
      updatedData.discountType = discountType;
    }

    if (discountValue !== undefined) {
      if (isNaN(val) || val <= 0) {
        return res
          .status(400)
          .json({ error: "El valor de descuento debe ser un número positivo" });
      }
      updatedData.discountValue = val;
    }

    if (type === DiscountType.PORCENTAJE && (val < 1 || val > 100)) {
      return res.status(400).json({
        error:
          "Si el tipo de descuento es Porcentaje, el valor debe estar entre 1 y 100",
      });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: updatedData,
      include: {
        category: true,
      },
    });

    return res.status(200).json(updatedPromotion);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error updating promotion";

    return res.status(500).json({ error: message });
  }
};

// Cambiar el estado de una promoción
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "El nuevo estado es requerido" });
    }

    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    // Validar transición lineal: Programada -> Activa -> Finalizada
    const currentStatus = promotion.status;

    if (currentStatus === PromotionStatus.FINALIZADA) {
      return res.status(400).json({
        error: "Una promoción en estado Finalizada no puede modificarse",
      });
    }

    if (currentStatus === PromotionStatus.PROGRAMADA) {
      if (status !== PromotionStatus.ACTIVA) {
        return res.status(400).json({
          error: "Desde Programada solo se puede cambiar a estado Activa",
        });
      }
    } else if (currentStatus === PromotionStatus.ACTIVA) {
      if (status !== PromotionStatus.FINALIZADA) {
        return res.status(400).json({
          error: "Desde Activa solo se puede cambiar a estado Finalizada",
        });
      }
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id },
      data: { status },
      include: {
        category: true,
      },
    });

    return res.status(200).json(updatedPromotion);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Error updating promotion status";

    return res.status(500).json({ error: message });
  }
};

// Eliminar una promoción
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    // Eliminar una promoción (solo si está en estado Programada)
    if (promotion.status !== PromotionStatus.PROGRAMADA) {
      return res.status(400).json({
        error: "Solo se pueden eliminar promociones en estado Programada",
      });
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Promoción eliminada con éxito" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error deleting promotion";

    return res.status(500).json({ error: message });
  }
};

// Obtener resumen de contadores
export const getSummary = async (_req: Request, res: Response) => {
  try {
    await syncPromotionStatuses();
    const today = new Date();

    // Contar promociones por estado
    const counts = await prisma.promotion.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const summary = {
      PROGRAMADA: 0,
      ACTIVA: 0,
      FINALIZADA: 0,
      vigentesHoy: 0,
    };

    counts.forEach((item) => {
      if (item.status === PromotionStatus.PROGRAMADA) {
        summary.PROGRAMADA = item._count.id;
      } else if (item.status === PromotionStatus.ACTIVA) {
        summary.ACTIVA = item._count.id;
      } else if (item.status === PromotionStatus.FINALIZADA) {
        summary.FINALIZADA = item._count.id;
      }
    });

    // Indicar cuántas promociones están vigentes hoy
    // (fecha actual dentro del rango de vigencia)
    const activeTodayCount = await prisma.promotion.count({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    summary.vigentesHoy = activeTodayCount;

    return res.status(200).json(summary);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching summary stats";

    return res.status(500).json({ error: message });
  }
};
