"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const promotionRoutes_1 = __importDefault(require("./routes/promotionRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const app = (0, express_1.default)();
// Midlewares globales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Montar endpoints
app.use(healthRoutes_1.default); // Expone /health directamente en el root
app.use('/api/promotions', promotionRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
// Manejador global de errores
app.use((err, _req, res, _next) => {
    console.error(err.stack || err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});
exports.default = app;
