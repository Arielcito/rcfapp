import express from 'express';
import * as movimientoController from '../controllers/movimientoController';
import { authenticateToken } from '../middleware/auth';

/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: API para gestionar movimientos de caja
 */

const router = express.Router({ mergeParams: true }); // Important: mergeParams allows access to predioId

// Log routes being set up
console.log('Setting up movimientos routes');

/**
 * @swagger
 * /api/movimientos/categorias:
 *   get:
 *     summary: Obtiene todas las categorías de movimientos activas
 *     tags: [Movimientos]
 *     responses:
 *       200:
 *         description: Lista de categorías de movimientos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/categorias', movimientoController.getCategorias);
console.log('✓ GET /categorias route set up');

// Rutas protegidas
router.use(authenticateToken);

/**
 * @swagger
 * /api/predios/{predioId}/movimientos:
 *   get:
 *     summary: Obtiene movimientos de caja con filtros opcionales
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: predioId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [INGRESO, EGRESO]
 *       - in: query
 *         name: metodoPago
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de movimientos filtrados
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', movimientoController.getMovimientos);
console.log('✓ GET / route set up');

/**
 * @swagger
 * /api/predios/{predioId}/movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento de caja
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: predioId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoCajaCreationData'
 *     responses:
 *       201:
 *         description: Movimiento creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', movimientoController.createMovimiento);
console.log('✓ POST / route set up');

/**
 * @swagger
 * /api/movimientos/{id}:
 *   put:
 *     summary: Actualiza un movimiento de caja existente
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoCajaUpdateData'
 *     responses:
 *       200:
 *         description: Movimiento actualizado exitosamente
 *       404:
 *         description: Movimiento no encontrado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', movimientoController.updateMovimiento);
console.log('✓ PUT /:id route set up');

/**
 * @swagger
 * /api/movimientos/{id}:
 *   delete:
 *     summary: Elimina un movimiento de caja
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Movimiento eliminado exitosamente
 *       404:
 *         description: Movimiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', movimientoController.deleteMovimiento);
console.log('✓ DELETE /:id route set up');

/**
 * @swagger
 * /api/predios/{predioId}/movimientos/resumen:
 *   get:
 *     summary: Obtiene un resumen de movimientos de caja
 *     tags: [Movimientos]
 *     parameters:
 *       - in: path
 *         name: predioId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen de movimientos
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/resumen', movimientoController.getResumenMovimientos);
console.log('✓ GET /resumen route set up');

export default router; 