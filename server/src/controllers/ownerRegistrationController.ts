import { Request, Response } from 'express';
import { db } from '../db';
import { ownerRegistrationRequests } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createOwnerRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, propertyName, propertyLocation, additionalInfo } = req.body;

    // Validar campos requeridos
    if (!fullName || !email || !phone || !propertyName || !propertyLocation) {
      return res.status(400).json({
        error: 'Todos los campos requeridos deben ser completados'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'El formato del email no es válido'
      });
    }

    // Verificar si ya existe una solicitud con el mismo email
    const existingRequest = await db
      .select()
      .from(ownerRegistrationRequests)
      .where(eq(ownerRegistrationRequests.email, email))
      .limit(1);

    if (existingRequest.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una solicitud de registro con este email'
      });
    }

    // Crear la nueva solicitud
    const newRequest = await db
      .insert(ownerRegistrationRequests)
      .values({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        propertyName: propertyName.trim(),
        propertyLocation: propertyLocation.trim(),
        additionalInfo: additionalInfo?.trim() || null,
      })
      .returning();

    res.status(201).json({
      message: 'Solicitud de registro enviada exitosamente',
      data: {
        id: newRequest[0].id,
        status: newRequest[0].status,
        createdAt: newRequest[0].createdAt
      }
    });

  } catch (error) {
    console.error('Error creating owner registration request:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};
