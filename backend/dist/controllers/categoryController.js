"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// GET /api/categories - Listar todas las categorías
const getCategories = async (_req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { promotions: true },
                },
            },
        });
        return res.status(200).json(categories);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching categories' });
    }
};
exports.getCategories = getCategories;
// POST /api/categories - Crear una categoría
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        // Verificar si ya existe con ese nombre
        const existing = await prisma_1.default.category.findUnique({ where: { name: name.trim() } });
        if (existing) {
            return res.status(409).json({ error: `Ya existe una categoría con el nombre "${name.trim()}"` });
        }
        const category = await prisma_1.default.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
            },
        });
        return res.status(201).json(category);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error creating category' });
    }
};
exports.createCategory = createCategory;
// PUT /api/categories/:id - Actualizar una categoría
const updateCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        const existing = await prisma_1.default.category.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        // Verificar que el nuevo nombre no colisione con otra categoría distinta
        const duplicate = await prisma_1.default.category.findUnique({ where: { name: name.trim() } });
        if (duplicate && duplicate.id !== id) {
            return res.status(409).json({ error: `Ya existe otra categoría con el nombre "${name.trim()}"` });
        }
        const updated = await prisma_1.default.category.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description?.trim() ?? existing.description,
            },
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error updating category' });
    }
};
exports.updateCategory = updateCategory;
// DELETE /api/categories/:id - Eliminar una categoría
const deleteCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await prisma_1.default.category.findUnique({
            where: { id },
            include: { _count: { select: { promotions: true } } },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        // Proteger la eliminación si tiene promociones asociadas
        if (existing._count.promotions > 0) {
            return res.status(400).json({
                error: `No se puede eliminar la categoría "${existing.name}" porque tiene ${existing._count.promotions} promoción(es) asociada(s). Reasigna o elimina primero dichas promociones.`,
            });
        }
        await prisma_1.default.category.delete({ where: { id } });
        return res.status(200).json({ message: `Categoría "${existing.name}" eliminada con éxito` });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error deleting category' });
    }
};
exports.deleteCategory = deleteCategory;
