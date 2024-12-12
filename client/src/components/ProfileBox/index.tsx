"use client";
import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { IPredio, ICancha } from "@/models/models";
import Modal from "../Modal";
import CanchaForm from "../Forms/CanchaForm";
import { UploadButton } from "@/utils/uploadthings";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LocationSelector } from "../Maps/LocationSelector";

interface ProfileData extends IPredio {
  canchas: ICancha[];
}

const ProfileBox = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddCanchaModal, setShowAddCanchaModal] = useState(false);
  const [editingCancha, setEditingCancha] = useState<ICancha | null>(null);
  const [editForm, setEditForm] = useState<Partial<IPredio>>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (formData: Partial<IPredio>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id: profileData?.id }),
      });
      const updatedData = await response.json();
      setProfileData(prev => ({ ...prev!, ...updatedData }));
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddCancha = async (formData: Partial<ICancha>) => {
    try {
      const response = await fetch('/api/canchas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          predioId: profileData?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la cancha');
      }

      const newCancha = await response.json();
      
      setProfileData(prev => prev ? {
        ...prev,
        canchas: [...prev.canchas, newCancha]
      } : null);
      
      setShowAddCanchaModal(false);
    } catch (error) {
      console.error('Error adding cancha:', error);
    }
  };

  const handleUpdateCancha = async (formData: Partial<ICancha>) => {
    try {
      const response = await fetch('/api/canchas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id: editingCancha?.id }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cancha');
      }

      const updatedCancha = await response.json();
      
      setProfileData(prev => prev ? {
        ...prev,
        canchas: prev.canchas.map(c => 
          c.id === updatedCancha.id ? updatedCancha : c
        )
      } : null);
      
      setEditingCancha(null);
    } catch (error) {
      console.error('Error updating cancha:', error);
    }
  };

  const handleDeleteCancha = async (canchaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cancha?')) return;

    try {
      await fetch(`/api/canchas?id=${canchaId}`, {
        method: 'DELETE',
      });
      setProfileData(prev => ({
        ...prev!,
        canchas: prev!.canchas.filter(c => c.id !== canchaId),
      }));
    } catch (error) {
      console.error('Error deleting cancha:', error);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: profileData?.id,
          imagenUrl: imageUrl,
        }),
      });
      const updatedData = await response.json();
      setProfileData(prev => ({
        ...prev!,
        imagenUrl: updatedData.imagenUrl,
      }));
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    setEditForm(prev => ({
      ...prev,
      direccion: location.address,
      ubicacion: {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      }
    }));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Si estamos guardando los cambios, enviar el formulario
      handleProfileUpdate(editForm);
    } else {
      // Si estamos entrando en modo edición, cargar los datos actuales
      setEditForm({
        nombre: profileData?.nombre,
        descripcion: profileData?.descripcion,
        telefono: profileData?.telefono,
        direccion: profileData?.direccion,
        ubicacion: profileData?.ubicacion,
        horarioApertura: profileData?.horarioApertura,
        horarioCierre: profileData?.horarioCierre,
      });
    }
    setIsEditMode(!isEditMode);
  };

  if (loading) return <div>Cargando...</div>;
  if (!profileData) return <div>No se encontraron datos del perfil</div>;

  return (
    <>
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="relative z-20 h-35 md:h-65">
          {profileData.imagenUrl ? (
            <Image
              src={profileData.imagenUrl}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen de portada</span>
            </div>
          )}
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  handleImageUpload(res[0].url);
                }
              }}
              onUploadError={(error: Error) => {
                console.error('Error uploading:', error);
                alert('Error uploading image');
              }}
            />
          </div>
        </div>

        {/* Nueva sección de información del predio */}
        <div className="px-4 py-6 lg:py-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Información del Predio</h3>
            <button
              type="button"
              onClick={toggleEditMode}
              className={`px-4 py-2 rounded-sm ${
                'bg-primary'
              } text-white`}
            >
              {isEditMode ? 'Guardar' : 'Editar'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Nombre del Predio</Label>
                {isEditMode ? (
                  <Input
                    name="nombre"
                    value={editForm.nombre || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-700">{profileData?.nombre}</p>
                )}
              </div>

              <div>
                <Label>Descripción</Label>
                {isEditMode ? (
                  <textarea
                    name="descripcion"
                    value={editForm.descripcion || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-sm"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profileData?.descripcion}</p>
                )}
              </div>

              <div>
                <Label>Teléfono</Label>
                {isEditMode ? (
                  <Input
                    name="telefono"
                    value={editForm.telefono || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-gray-700">{profileData?.telefono}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Dirección</Label>
                {isEditMode ? (
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    defaultValue={profileData?.direccion}
                  />
                ) : (
                  <p className="text-gray-700">{profileData?.direccion}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horario de Apertura</Label>
                  {isEditMode ? (
                    <Input
                      type="time"
                      name="horarioApertura"
                      value={editForm.horarioApertura || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-gray-700">{profileData?.horarioApertura}</p>
                  )}
                </div>

                <div>
                  <Label>Horario de Cierre</Label>
                  {isEditMode ? (
                    <Input
                      type="time"
                      name="horarioCierre"
                      value={editForm.horarioCierre || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-gray-700">{profileData?.horarioCierre}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Canchas */}
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold">Canchas</h4>
            <button
              type="button"
              onClick={() => setShowAddCanchaModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-sm"
            >
              Agregar Cancha
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData.canchas?.map((cancha) => (
              <div
                key={cancha.id}
                className="border border-stroke rounded-sm p-4"
              >
                {cancha.imagenUrl && (
                  <Image
                    src={cancha.imagenUrl}
                    alt={cancha.nombre}
                    width={200}
                    height={150}
                    className="mb-4 rounded-sm"
                  />
                )}
                <h5 className="font-semibold mb-2">{cancha.nombre}</h5>
                <p className="text-sm mb-2">Tipo: {cancha.tipo}</p>
                <p className="text-sm mb-2">
                  Capacidad: {cancha.capacidadJugadores} jugadores
                </p>
                <p className="text-sm mb-2">
                  Precio por hora: ${cancha.precioPorHora}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  {editingCancha?.id === cancha.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateCancha(editingCancha)}
                        className="bg-meta-3 text-white px-3 py-1 rounded-sm"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCancha(null)}
                        className="bg-danger text-white px-3 py-1 rounded-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingCancha(cancha)}
                        className="bg-primary text-white px-3 py-1 rounded-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button" 
                        onClick={() => handleDeleteCancha(cancha.id)}
                        className="bg-danger text-red px-3 py-1 rounded-sm"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar cancha */}
      <Modal
        isOpen={showAddCanchaModal || !!editingCancha}
        onClose={() => {
          setShowAddCanchaModal(false);
          setEditingCancha(null);
        }}
      >
        <CanchaForm
          cancha={editingCancha}
          onSubmit={editingCancha ? handleUpdateCancha : handleAddCancha}
          onCancel={() => {
            setShowAddCanchaModal(false);
            setEditingCancha(null);
          }}
        />
      </Modal>
    </>
  );
};

export default ProfileBox;