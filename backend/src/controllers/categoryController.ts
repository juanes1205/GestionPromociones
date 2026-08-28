import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET /api/categories - Listar todas las categorías
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { promotions: true },
        },
      },
    });
    return res.status(200).json(categories);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error fetching categories";

    return res.status(500).json({ error: message });
  }
};

// POST /api/categories - Crear una categoría
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ error: "El nombre de la categoría es obligatorio" });
    }

    // Verificar si ya existe con ese nombre
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return res.status(409).json({
        error: `Ya existe una categoría con el nombre "${name.trim()}"`,
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });
    return res.status(201).json(category);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error creating category";

    return res.status(500).json({ error: message });
  }
};

// PUT /api/categories/:id - Actualizar una categoría
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ error: "El nombre de la categoría es obligatorio" });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Verificar que el nuevo nombre no sea el mismo que el de otra categoría distinta
    const duplicate = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({
        error: `Ya existe otra categoría con el nombre "${name.trim()}"`,
      });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() ?? existing.description,
      },
    });
    return res.status(200).json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error updating category";

    return res.status(500).json({ error: message });
  }
};

// DELETE /api/categories/:id - Eliminar una categoría
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { promotions: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Proteger la eliminación si tiene promociones asociadas
    if (existing._count.promotions > 0) {
      return res.status(400).json({
        error: `No se puede eliminar la categoría "${existing.name}" porque tiene ${existing._count.promotions} promoción(es) asociada(s). Reasigna o elimina primero dichas promociones.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    return res
      .status(200)
      .json({ message: `Categoría "${existing.name}" eliminada con éxito` });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error deleting category";

    return res.status(500).json({ error: message });
  }
};
