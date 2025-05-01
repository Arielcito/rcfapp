import { Request, Response } from 'express';
import { MovimientoService } from '../services/movimientoService';
import { HttpError } from '../utils/errors';
import type { 
  MovimientoCajaCreationData, 
  MovimientoCajaUpdateData, 
  MovimientoCajaFiltros,
  TipoMovimiento,
  MetodoPago 
} from '../types/movimiento';

const movimientoService = new MovimientoService();

const logResponse = (method: string, path: string, status: number, data: any) => {
  console.log(`[${method}] ${path} - Status: ${status}`, data ? typeof data === 'object' ? 'Response data' : data : '');
};

// Improved function to log requests
const logRequest = (method: string, url: string, params: any, query: any, body: any) => {
  console.log(`[${new Date().toISOString()}] REQUEST: ${method} ${url}`);
  if (Object.keys(params).length) console.log('  Params:', params);
  if (Object.keys(query).length) console.log('  Query:', query);
  if (body && Object.keys(body).length) console.log('  Body:', JSON.stringify(body).substring(0, 200) + (JSON.stringify(body).length > 200 ? '...' : ''));
};

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
export const getCategorias = async (req: Request, res: Response) => {
  try {
    logRequest('GET', req.originalUrl, req.params, req.query, req.body);
    const categorias = await movimientoService.getCategorias();
    logResponse('GET', '/api/movimientos/categorias', 200, categorias);
    res.json(categorias);
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('GET', '/api/movimientos/categorias', status, { error: message });
    res.status(status).json({ error: message });
  }
};

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
export const getMovimientos = async (req: Request, res: Response) => {
  try {
    logRequest('GET', req.originalUrl, req.params, req.query, req.body);
    const { predioId } = req.params;
    const { fechaDesde, fechaHasta, categoriaId, tipo, metodoPago } = req.query;

    const filtros = {
      fechaDesde: fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta: fechaHasta ? new Date(fechaHasta as string) : undefined,
      categoriaId: categoriaId as string | undefined,
      tipo: tipo as 'INGRESO' | 'EGRESO' | undefined,
      metodoPago: metodoPago as MetodoPago | undefined
    };

    const movimientos = await movimientoService.getMovimientos(predioId, filtros);
    logResponse('GET', `/api/predios/${predioId}/movimientos`, 200, movimientos);
    res.json(movimientos);
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('GET', `/api/predios/${req.params.predioId}/movimientos`, status, { error: message });
    res.status(status).json({ error: message });
  }
};

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
export const createMovimiento = async (req: Request, res: Response) => {
  try {
    logRequest('POST', req.originalUrl, req.params, req.query, req.body);
    const { predioId } = req.params;
    const movimientoData = {
      ...req.body,
      predioId
    };

    const movimiento = await movimientoService.createMovimiento(movimientoData);
    logResponse('POST', `/api/predios/${predioId}/movimientos`, 201, movimiento);
    res.status(201).json(movimiento);
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('POST', `/api/predios/${req.params.predioId}/movimientos`, status, { error: message });
    res.status(status).json({ error: message });
  }
};

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
export const updateMovimiento = async (req: Request, res: Response) => {
  try {
    logRequest('PUT', req.originalUrl, req.params, req.query, req.body);
    const { id } = req.params;
    const movimientoData = req.body;

    const movimiento = await movimientoService.updateMovimiento(id, movimientoData);
    logResponse('PUT', `/api/movimientos/${id}`, 200, movimiento);
    res.json(movimiento);
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('PUT', `/api/movimientos/${req.params.id}`, status, { error: message });
    res.status(status).json({ error: message });
  }
};

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
export const deleteMovimiento = async (req: Request, res: Response) => {
  try {
    logRequest('DELETE', req.originalUrl, req.params, req.query, req.body);
    const { id } = req.params;
    await movimientoService.deleteMovimiento(id);
    logResponse('DELETE', `/api/movimientos/${id}`, 204, null);
    res.status(204).send();
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('DELETE', `/api/movimientos/${req.params.id}`, status, { error: message });
    res.status(status).json({ error: message });
  }
};

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
export const getResumenMovimientos = async (req: Request, res: Response) => {
  try {
    logRequest('GET', req.originalUrl, req.params, req.query, req.body);
    const { predioId } = req.params;
    const { fechaDesde, fechaHasta } = req.query;

    const resumen = await movimientoService.getResumenMovimientos(
      predioId,
      fechaDesde ? new Date(fechaDesde as string) : undefined,
      fechaHasta ? new Date(fechaHasta as string) : undefined
    );

    logResponse('GET', `/api/predios/${predioId}/movimientos/resumen`, 200, resumen);
    res.json(resumen);
  } catch (error) {
    const status = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    logResponse('GET', `/api/predios/${req.params.predioId}/movimientos/resumen`, status, { error: message });
    res.status(status).json({ error: message });
  }
}; 