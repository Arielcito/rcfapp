import { API_URL } from '../config/env';

export interface OwnerRegistrationRequest {
  fullName: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyLocation: string;
  additionalInfo?: string;
}

export interface OwnerRegistrationResponse {
  message: string;
  data: {
    id: string;
    status: string;
    createdAt: string;
  };
}

export const submitOwnerRegistrationRequest = async (
  data: OwnerRegistrationRequest
): Promise<OwnerRegistrationResponse> => {
  try {
    const response = await fetch(`${API_URL}/owner-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al enviar la solicitud');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting owner registration request:', error);
    throw error;
  }
}; 