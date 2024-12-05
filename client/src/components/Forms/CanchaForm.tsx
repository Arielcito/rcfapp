import type React from 'react';
import { useState } from 'react';
import type { ICancha } from '@/models/models';
import { UploadButton } from "@/utils/uploadthings";

interface CanchaFormProps {
  cancha?: ICancha | null;
  onSubmit: (data: Partial<ICancha>) => void;
  onCancel: () => void;
}

const CanchaForm: React.FC<CanchaFormProps> = ({ cancha, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ICancha>>(cancha || {
    id: '',
    nombre: '',
    tipo: '',
    capacidadJugadores: 0,
    longitud: 0,
    ancho: 0,
    tipoSuperficie: '',
    tieneIluminacion: false,
    esTechada: false,
    precioPorHora: 0,
    estado: 'ACTIVA',
    equipamientoIncluido: '',
    imagenUrl: '',
    ultimoMantenimiento: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Manejar diferentes tipos de inputs
    const newValue = type === 'number' 
      ? Number(value)
      : type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        {cancha ? 'Editar Cancha' : 'Nueva Cancha'}
      </h2>

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre</label>
        <input
          id="nombre"
          type="text"
          value={formData.nombre || ''}
          onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagen de la Cancha</label>
        <div className="flex items-center gap-4">
          {formData.imagenUrl && (
            <img
              src={formData.imagenUrl}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-sm"
            />
          )}
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                setFormData(prev => ({ ...prev, imagenUrl: res[0].url }));
              }
            }}
            onUploadError={(error: Error) => {
              console.error('Error uploading:', error);
              alert('Error uploading image');
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tipo" className="block text-sm font-medium mb-1">Tipo</label>
        <select
          id="tipo"
          value={formData.tipo || ''}
          onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
          className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
        >
          <option value="">Seleccionar tipo</option>
          <option value="F5">Fútbol 5</option>
          <option value="F7">Fútbol 7</option>
          <option value="F9">Fútbol 9</option>
          <option value="F11">Fútbol 11</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="capacidadJugadores" className="block text-sm font-medium mb-1">
            Capacidad de Jugadores
          </label>
          <input
            type="number"
            id="capacidadJugadores"
            name="capacidadJugadores"
            value={formData.capacidadJugadores || ''}
            onChange={handleChange}
            className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none"
          />
        </div>

        <div>
          <label htmlFor="precioPorHora" className="block text-sm font-medium mb-1">
            Precio por Hora
          </label>
          <input
            type="number"
            id="precioPorHora"
            name="precioPorHora"
            step="0.01"
            value={formData.precioPorHora || ''}
            onChange={handleChange}
            className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="longitud" className="block text-sm font-medium mb-1">
            Longitud (metros)
          </label>
          <input
            type="number"
            id="longitud"
            name="longitud"
            step="0.01"
            value={formData.longitud || ''}
            onChange={handleChange}
            className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none"
          />
        </div>

        <div>
          <label htmlFor="ancho" className="block text-sm font-medium mb-1">
            Ancho (metros)
          </label>
          <input
            type="number"
            id="ancho"
            name="ancho"
            step="0.01"
            value={formData.ancho || ''}
            onChange={handleChange}
            className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tipoSuperficie" className="block text-sm font-medium mb-1">
          Tipo de Superficie
        </label>
        <select
          id="tipoSuperficie"
          name="tipoSuperficie"
          value={formData.tipoSuperficie || ''}
          onChange={handleChange}
          className="w-full rounded-sm border border-stroke bg-transparent py-3 px-4 outline-none"
        >
          <option value="">Seleccionar superficie</option>
          <option value="CESPED_NATURAL">Césped Natural</option>
          <option value="CESPED_SINTETICO">Césped Sintético</option>
          <option value="TIERRA">Tierra</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tieneIluminacion"
            name="tieneIluminacion"
            checked={formData.tieneIluminacion || false}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="tieneIluminacion" className="block text-sm font-medium mb-1">
            Tiene Iluminación
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="esTechada"
            name="esTechada"
            checked={formData.esTechada || false}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="esTechada" className="block text-sm font-medium mb-1">
            Es Techada
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="horarioApertura" className="block text-sm font-medium text-gray-700">
          Horario de Apertura
        </label>
        <input
          type="time"
          id="horarioApertura"
          name="horarioApertura"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.horarioApertura || ''}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="horarioCierre" className="block text-sm font-medium text-gray-700">
          Horario de Cierre
        </label>
        <input
          type="time"
          id="horarioCierre"
          name="horarioCierre"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.horarioCierre || ''}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-body text-white px-4 py-2 rounded-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-sm"
        >
          {cancha ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default CanchaForm; 