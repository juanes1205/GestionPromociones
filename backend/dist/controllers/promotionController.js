"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = exports.deletePromotion = exports.updateStatus = exports.updatePromotion = exports.createPromotion = exports.getPromotions = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
// Helper para actualizar automáticamente los estados basado en las fechas vigentes
const syncPromotionStatuses = async () => {
    const now = new Date();
    // 1. Programada -> Activa (si ya inició y no ha vencido)
    await prisma_1.default.promotion.updateMany({
        where: {
            status: client_1.PromotionStatus.PROGRAMADA,
            startDate: { lte: now },
            endDate: { gte: now },
        },
        data: {
            status: client_1.PromotionStatus.ACTIVA,
        },
    });
    // 2. Programada / Activa -> Finalizada (si ya venció)
    await prisma_1.default.promotion.updateMany({
        where: {
            status: { in: [client_1.PromotionStatus.PROGRAMADA, client_1.PromotionStatus.ACTIVA] },
            endDate: { lt: now },
        },
        data: {
            status: client_1.PromotionStatus.FINALIZADA,
        },
    });
};
// Obtener todas las promociones
const getPromotions = async (_req, res) => {
    try {
        await syncPromotionStatuses();
        const promotions = await prisma_1.default.promotion.findMany({
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return res.status(200).json(promotions);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching promotions' });
    }
};
exports.getPromotions = getPromotions;
// Crear una nueva promoción
const createPromotion = async (req, res) => {
    try {
        const { name, categoryId, discountType, discountValue, startDate, endDate } = req.body;
        // 1. Validaciones de presencia
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        if (!categoryId) {
            return res.status(400).json({ error: 'La categoría asociada es obligatoria' });
        }
        if (!discountType) {
            return res.status(400).json({ error: 'El tipo de descuento es obligatorio' });
        }
        if (discountValue === undefined || discountValue === null) {
            return res.status(400).json({ error: 'El valor del descuento es obligatorio' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Las fechas de inicio y fin son obligatorias' });
        }
        // Parsear fechas
        const start = new Date(startDate);
        const end = new Date(endDate);
        // 2. Validación de fechas (fin posterior a inicio)
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Formatos de fecha inválidos' });
        }
        if (end <= start) {
            return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
        }
        // 3. Validación de tipo de descuento y valor
        if (discountType !== client_1.DiscountType.PORCENTAJE && discountType !== client_1.DiscountType.MONTO_FIJO) {
            return res.status(400).json({ error: 'Tipo de descuento no válido (debe ser PORCENTAJE o MONTO_FIJO)' });
        }
        const val = parseFloat(discountValue);
        if (isNaN(val) || val <= 0) {
            return res.status(400).json({ error: 'El valor de descuento debe ser un número positivo' });
        }
        if (discountType === client_1.DiscountType.PORCENTAJE && (val < 1 || val > 100)) {
            return res.status(400).json({ error: 'Si el tipo de descuento es Porcentaje, el valor debe estar entre 1 y 100' });
        }
        // Verificar si existe la categoría
        const categoryExists = await prisma_1.default.category.findUnique({
            where: { id: Number(categoryId) },
        });
        if (!categoryExists) {
            return res.status(404).json({ error: 'La categoría especificada no existe' });
        }
        // Crear promoción (estado inicial: PROGRAMADA)
        const newPromotion = await prisma_1.default.promotion.create({
            data: {
                name,
                categoryId: Number(categoryId),
                discountType,
                discountValue: val,
                startDate: start,
                endDate: end,
                status: client_1.PromotionStatus.PROGRAMADA,
            },
            include: {
                category: true,
            },
        });
        return res.status(201).json(newPromotion);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error creating promotion' });
    }
};
exports.createPromotion = createPromotion;
// Modificar una promoción existente
const updatePromotion = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, categoryId, discountType, discountValue, startDate, endDate } = req.body;
        const promotion = await prisma_1.default.promotion.findUnique({
            where: { id },
        });
        if (!promotion) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }
        // 1. Una promoción en estado Finalizada no puede modificarse
        if (promotion.status === client_1.PromotionStatus.FINALIZADA) {
            return res.status(400).json({ error: 'Una promoción en estado Finalizada no puede modificarse' });
        }
        // Validar y parsear entradas si están presentes
        const updatedData = {};
        if (name !== undefined) {
            if (!name.trim())
                return res.status(400).json({ error: 'El nombre no puede estar vacío' });
            updatedData.name = name;
        }
        if (categoryId !== undefined) {
            const categoryExists = await prisma_1.default.category.findUnique({
                where: { id: Number(categoryId) },
            });
            if (!categoryExists)
                return res.status(404).json({ error: 'La categoría especificada no existe' });
            updatedData.categoryId = Number(categoryId);
        }
        const start = startDate ? new Date(startDate) : new Date(promotion.startDate);
        const end = endDate ? new Date(endDate) : new Date(promotion.endDate);
        if (startDate || endDate) {
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ error: 'Formatos de fecha inválidos' });
            }
            if (end <= start) {
                return res.status(400).json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' });
            }
            updatedData.startDate = start;
            updatedData.endDate = end;
        }
        const type = discountType || promotion.discountType;
        const val = discountValue !== undefined ? parseFloat(discountValue) : promotion.discountValue;
        if (discountType !== undefined) {
            if (discountType !== client_1.DiscountType.PORCENTAJE && discountType !== client_1.DiscountType.MONTO_FIJO) {
                return res.status(400).json({ error: 'Tipo de descuento no válido' });
            }
            updatedData.discountType = discountType;
        }
        if (discountValue !== undefined) {
            if (isNaN(val) || val <= 0) {
                return res.status(400).json({ error: 'El valor de descuento debe ser un número positivo' });
            }
            updatedData.discountValue = val;
        }
        if (type === client_1.DiscountType.PORCENTAJE && (val < 1 || val > 100)) {
            return res.status(400).json({ error: 'Si el tipo de descuento es Porcentaje, el valor debe estar entre 1 y 100' });
        }
        const updatedPromotion = await prisma_1.default.promotion.update({
            where: { id },
            data: updatedData,
            include: {
                category: true,
            },
        });
        return res.status(200).json(updatedPromotion);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error updating promotion' });
    }
};
exports.updatePromotion = updatePromotion;
// Cambiar el estado de una promoción
const updateStatus = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'El nuevo estado es requerido' });
        }
        const promotion = await prisma_1.default.promotion.findUnique({
            where: { id },
        });
        if (!promotion) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }
        // Validar transición lineal: Programada -> Activa -> Finalizada
        const currentStatus = promotion.status;
        if (currentStatus === client_1.PromotionStatus.FINALIZADA) {
            return res.status(400).json({ error: 'Una promoción en estado Finalizada no puede modificarse' });
        }
        if (currentStatus === client_1.PromotionStatus.PROGRAMADA) {
            if (status !== client_1.PromotionStatus.ACTIVA) {
                return res.status(400).json({ error: 'Desde Programada solo se puede cambiar a estado Activa' });
            }
        }
        else if (currentStatus === client_1.PromotionStatus.ACTIVA) {
            if (status !== client_1.PromotionStatus.FINALIZADA) {
                return res.status(400).json({ error: 'Desde Activa solo se puede cambiar a estado Finalizada' });
            }
        }
        const updatedPromotion = await prisma_1.default.promotion.update({
            where: { id },
            data: { status },
            include: {
                category: true,
            },
        });
        return res.status(200).json(updatedPromotion);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error updating promotion status' });
    }
};
exports.updateStatus = updateStatus;
// Eliminar una promoción
const deletePromotion = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const promotion = await prisma_1.default.promotion.findUnique({
            where: { id },
        });
        if (!promotion) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }
        // Eliminar una promoción (solo si está en estado Programada)
        if (promotion.status !== client_1.PromotionStatus.PROGRAMADA) {
            return res.status(400).json({ error: 'Solo se pueden eliminar promociones en estado Programada' });
        }
        await prisma_1.default.promotion.delete({
            where: { id },
        });
        return res.status(200).json({ message: 'Promoción eliminada con éxito' });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error deleting promotion' });
    }
};
exports.deletePromotion = deletePromotion;
// Obtener resumen de contadores
const getSummary = async (_req, res) => {
    try {
        await syncPromotionStatuses();
        const today = new Date();
        // Contar promociones por estado
        const counts = await prisma_1.default.promotion.groupBy({
            by: ['status'],
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
            if (item.status === client_1.PromotionStatus.PROGRAMADA) {
                summary.PROGRAMADA = item._count.id;
            }
            else if (item.status === client_1.PromotionStatus.ACTIVA) {
                summary.ACTIVA = item._count.id;
            }
            else if (item.status === client_1.PromotionStatus.FINALIZADA) {
                summary.FINALIZADA = item._count.id;
            }
        });
        // Indicar cuántas promociones están vigentes hoy
        // (fecha actual dentro del rango de vigencia)
        const activeTodayCount = await prisma_1.default.promotion.count({
            where: {
                startDate: { lte: today },
                endDate: { gte: today },
            },
        });
        summary.vigentesHoy = activeTodayCount;
        return res.status(200).json(summary);
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Error fetching summary stats' });
    }
};
exports.getSummary = getSummary;
