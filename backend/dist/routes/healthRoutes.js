"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = (0, express_1.Router)();
router.get('/health', async (_req, res) => {
    try {
        // Verificar la conexión de la base de datos corriendo una consulta simple
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            services: {
                database: 'UP',
                server: 'UP'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            error: error.message || 'Database connection failed',
            services: {
                database: 'DOWN',
                server: 'UP'
            }
        });
    }
});
exports.default = router;
