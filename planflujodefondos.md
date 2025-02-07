# Plan de Implementación: Flujo de Fondos

## 1. Estructura de Datos

### 1.1 Categorías de Gastos (Egresos)
- Servicios (luz, agua, gas, internet)
- Mantenimiento (limpieza, reparaciones)
- Personal (sueldos, cargas sociales)
- Equipamiento (pelotas, redes, equipos)
- Marketing y Publicidad
- Impuestos y Tasas
- Otros Gastos

### 1.2 Categorías de Ingresos
- Reservas de Canchas
- Alquiler de Equipamiento
- Eventos Especiales
- Otros Ingresos

### 1.3 Métodos de Pago
- Efectivo
- Transferencia Bancaria
- Tarjeta de Débito
- Tarjeta de Crédito
- Mercado Pago
- Otros Medios Digitales

## 2. Base de Datos

### 2.1 Nueva Tabla: CategoriaMovimiento
```sql
- id (UUID)
- nombre (string)
- tipo (INGRESO/EGRESO)
- descripcion (string)
- activo (boolean)
```

### 2.2 Modificaciones a MovimientoCaja
```sql
- categoriaId (UUID, FK a CategoriaMovimiento)
- comprobante (string, opcional para futuro)
```

## 3. Funcionalidades Backend

### 3.1 API Endpoints
- GET /api/movimientos/categorias
- GET /api/movimientos/predio/:predioId
- POST /api/movimientos
- GET /api/movimientos/reporte
- GET /api/movimientos/estadisticas

### 3.2 Filtros
- Por fecha (desde/hasta)
- Por categoría
- Por tipo (ingreso/egreso)
- Por método de pago
- Por predio

### 3.3 Reportes
- Exportación a Excel
- Resumen mensual
- Balance general
- Gráficos de torta para distribución de gastos
- Gráficos de barras para comparación ingresos vs egresos

## 4. Interfaz de Usuario

### 4.1 Pantallas Nuevas
1. Lista de Movimientos
   - Tabla con filtros
   - Acciones (agregar, editar, eliminar)
   - Vista de detalles

2. Dashboard de Flujo de Fondos
   - Resumen general
   - Gráficos principales
   - Indicadores clave

3. Formulario de Movimientos
   - Selección de categoría
   - Monto
   - Fecha
   - Método de pago
   - Notas
   - Predio asociado

### 4.2 Componentes UI
- Filtros avanzados
- Tabla de movimientos
- Gráficos
- Formularios de ingreso
- Botones de exportación

## 5. Plan de Implementación

### Fase 1: Estructura Base
1. Crear nuevas tablas en la base de datos
2. Implementar endpoints básicos
3. Crear componentes UI base

### Fase 2: Funcionalidades Core
1. CRUD de movimientos
2. Implementar filtros
3. Desarrollar vista principal

### Fase 3: Reportes y Gráficos
1. Implementar exportación
2. Crear gráficos
3. Desarrollar dashboard

### Fase 4: Optimización
1. Mejorar rendimiento
2. Refinar UI/UX
3. Pruebas y ajustes

## 6. Consideraciones Técnicas

### 6.1 Seguridad
- Validación de permisos por predio
- Validación de datos
- Logs de operaciones

### 6.2 Performance
- Paginación de resultados
- Caché de datos frecuentes
- Optimización de consultas

### 6.3 Escalabilidad
- Diseño modular
- Preparación para futuras características
- Estructura para múltiples predios 

## 7. Guía Paso a Paso para Desarrolladores Junior

### Estado del Proyecto
✅ = Completado
🏗️ = En Progreso
⏳ = Pendiente

### Paso 1: Preparación de la Base de Datos 🗄️ ✅
1. Crear la tabla de categorías:
```sql
CREATE TABLE categoria_movimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);
```

2. Agregar campos a la tabla de movimientos:
```sql
ALTER TABLE movimientos_caja
ADD COLUMN categoria_id UUID REFERENCES categoria_movimiento(id),
ADD COLUMN comprobante VARCHAR(255);
```

3. Insertar las categorías básicas:
```sql
-- Primero los gastos
INSERT INTO categoria_movimiento (nombre, tipo, descripcion) VALUES
('Servicios', 'EGRESO', 'Gastos de luz, agua, gas, internet');

-- Luego los ingresos
INSERT INTO categoria_movimiento (nombre, tipo, descripcion) VALUES
('Reservas', 'INGRESO', 'Ingresos por reservas de canchas');
```

### Paso 2: Backend - Crear Tipos (TypeScript) 📝 ✅
1. Crear archivo `server/src/types/movimiento.ts`:
```typescript
// Definir el tipo para categorías
export interface CategoriaMovimiento {
  id: string;
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
  descripcion?: string;
  activo: boolean;
}

// Definir el tipo para movimientos
export interface MovimientoCaja {
  id: string;
  predioId: string;
  categoriaId: string;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  metodoPago: string;
  fechaMovimiento: Date;
}
```

### Paso 3: Backend - Crear Servicios 🔧 ✅
1. Crear archivo `server/src/services/movimientoService.ts`:
```typescript
import { db } from '../db';
import { categoriaMovimiento, movimientosCaja } from '../db/schema';

// Obtener todas las categorías activas
export const getCategorias = async () => {
  return await db.select()
    .from(categoriaMovimiento)
    .where({ activo: true });
};

// Obtener movimientos de un predio
export const getMovimientos = async (predioId: string) => {
  return await db.select()
    .from(movimientosCaja)
    .where('predioId', predioId);
};
```

### Paso 4: Backend - Crear Controladores 🎮 ✅
1. Crear archivo `server/src/controllers/movimientoController.ts`:
```typescript
import { Request, Response } from 'express';
import * as movimientoService from '../services/movimientoService';

// Controlador para obtener categorías
export const getCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = await movimientoService.getCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Controlador para obtener movimientos
export const getMovimientos = async (req: Request, res: Response) => {
  try {
    const { predioId } = req.params;
    const movimientos = await movimientoService.getMovimientos(predioId);
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};
```

### Paso 5: Backend - Crear Rutas 🛣️ ✅
1. Crear archivo `server/src/routes/movimientos.ts`:
```typescript
import express from 'express';
import * as movimientoController from '../controllers/movimientoController';

const router = express.Router();

router.get('/categorias', movimientoController.getCategorias);
router.get('/predio/:predioId', movimientoController.getMovimientos);

export default router;
```

### Paso 6: Frontend - Crear Pantalla Principal 📱 ⏳
1. Crear archivo `app/App/presentation/screens/MovimientosScreen.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getMovimientos } from '../../infraestructure/services/movimientoService';

export const MovimientosScreen = () => {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      const data = await getMovimientos('ID_DEL_PREDIO');
      setMovimientos(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Movimientos</Text>
      <FlatList
        data={movimientos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.movimientoItem}>
            <Text>{item.concepto}</Text>
            <Text>{item.monto}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  movimientoItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
```

### Paso 7: Frontend - Crear Servicio API ⏳
1. Crear archivo `app/App/infraestructure/services/movimientoService.ts`:
```typescript
import api from '../config/api';

export const getMovimientos = async (predioId: string) => {
  const response = await api.get(`/movimientos/predio/${predioId}`);
  return response.data;
};

export const getCategorias = async () => {
  const response = await api.get('/movimientos/categorias');
  return response.data;
};
```

### Paso 8: Pruebas Básicas ✅ ⏳
1. Probar la base de datos:
```sql
-- Ver categorías
SELECT * FROM categoria_movimiento;

-- Ver movimientos
SELECT * FROM movimientos_caja;
```