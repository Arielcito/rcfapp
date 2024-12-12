'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Phone, Image as ImageIcon, PlusCircle } from 'lucide-react'
import { useRouter } from "next/navigation";
import { LocationSelector } from '@/components/Maps/LocationSelector'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { api } from '@/app/libs/axios'

interface Cancha {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  imagen: string | ImageFile;
  precio: number;
  precioSena: number;
}

interface Establecimiento {
  nombre: string;
  imagen: string | ImageFile;
  ubicacion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  horarioApertura: string;
  horarioCierre: string;
  telefono: string;
  descripcion: string;
}

interface ImageFile {
  file: File;
  preview: string;
}

export function OnboardingPageComponent() {
  const [step, setStep] = useState(1)
  const [establecimiento, setEstablecimiento] = useState<Establecimiento>({
    nombre: '',
    imagen: '',
    ubicacion: '',
    coordenadas: {
      lat: 0,
      lng: 0
    },
    horarioApertura: '',
    horarioCierre: '',
    telefono: '',
    descripcion: ''
  })
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const router = useRouter();
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleEstablecimientoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEstablecimiento(prev => ({ ...prev, [name]: value }))
  }

  const handleCanchaAdd = () => {
    setCanchas(prev => [...prev, { 
      id: crypto.randomUUID(),
      nombre: '', 
      descripcion: '', 
      tipo: '', 
      imagen: '',
      precio: 0,
      precioSena: 0
    }])
  }

  const handleCanchaChange = (
    index: number, 
    field: keyof Cancha, 
    value: string | number | ImageFile
  ) => {
    setCanchas(prev => {
      const newCanchas = [...prev]
      if (!newCanchas[index]) {
        newCanchas[index] = { id: '', nombre: '', descripcion: '', tipo: '', imagen: '', precio: 0, precioSena: 0 }
      }
      newCanchas[index] = { ...newCanchas[index], [field]: value }
      return newCanchas
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      const newErrors: {[key: string]: string} = {}
      
      if (!establecimiento.nombre.trim()) {
        newErrors.nombre = "El nombre es obligatorio"
      }
      if (!establecimiento.imagen) {
        newErrors.imagen = "La imagen es obligatoria"
      }
      if (!establecimiento.ubicacion) {
        newErrors.ubicacion = "La ubicación es obligatoria"
      }
      if (!establecimiento.horarioApertura) {
        newErrors.horarioApertura = "El horario de apertura es obligatorio"
      }
      if (!establecimiento.horarioCierre) {
        newErrors.horarioCierre = "El horario de cierre es obligatorio"
      }
      if (!establecimiento.telefono) {
        newErrors.telefono = "El teléfono es obligatorio"
      }
      if (!establecimiento.descripcion.trim()) {
        newErrors.descripcion = "La descripción es obligatoria"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      
      setErrors({})
      setStep(2)
    } else {
      if (canchas.length === 0) {
        setErrors({ canchas: "Debe agregar al menos una cancha" })
        return
      }

      const canchasErrors: {[key: string]: string}[] = []
      let hasErrors = false

      canchas.forEach((cancha, index) => {
        const canchaErrors: {[key: string]: string} = {}
        
        if (!cancha.nombre.trim()) {
          canchaErrors.nombre = "El nombre es obligatorio"
          hasErrors = true
        }
        if (!cancha.descripcion.trim()) {
          canchaErrors.descripcion = "La descripción es obligatoria"
          hasErrors = true
        }
        if (!cancha.tipo) {
          canchaErrors.tipo = "El tipo de cancha es obligatorio"
          hasErrors = true
        }
        if (!cancha.imagen) {
          canchaErrors.imagen = "La imagen es obligatoria"
          hasErrors = true
        }
        if (!cancha.precio || cancha.precio <= 0) {
          canchaErrors.precio = "El precio es obligatorio y debe ser mayor a 0"
          hasErrors = true
        }
        if (cancha.precioSena < 0) {
          canchaErrors.precioSena = "La seña no puede ser negativa"
          hasErrors = true
        }
        if (cancha.precioSena > cancha.precio) {
          canchaErrors.precioSena = "La seña no puede ser mayor al precio total"
          hasErrors = true
        }

        canchasErrors[index] = canchaErrors
      })

      if (hasErrors) {
        setErrors({ canchas: JSON.stringify(canchasErrors) })
        return
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const horarioAperturaDateTime = `${today}T${establecimiento.horarioApertura}:00.000Z`;
        const horarioCierreDateTime = `${today}T${establecimiento.horarioCierre}:00.000Z`;

        let establecimientoImageUrl = establecimiento.imagen;
        if (typeof establecimiento.imagen !== 'string') {
          const formData = new FormData();
          formData.append('file', establecimiento.imagen.file);
          const response = await fetch('/api/uploadthing', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          establecimientoImageUrl = data.url;
        }

        const canchasConImagenes = await Promise.all(
          canchas.map(async (cancha) => {
            let imagenUrl = cancha.imagen;
            if (typeof cancha.imagen !== 'string') {
              const formData = new FormData();
              formData.append('file', cancha.imagen.file);
              const response = await fetch('/api/uploadthing', {
                method: 'POST',
                body: formData
              });
              const data = await response.json();
              imagenUrl = data.url;
            }
            return { ...cancha, imagen: imagenUrl };
          })
        );

        const predioData = {
          nombre: establecimiento.nombre,
          direccion: establecimiento.ubicacion || 'amat',
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          telefono: establecimiento.telefono,
          latitud: establecimiento.coordenadas.lat,
          longitud: establecimiento.coordenadas.lng,
          horarioApertura: horarioAperturaDateTime,
          horarioCierre: horarioCierreDateTime,
          imagenUrl: establecimientoImageUrl,
          descripcion: establecimiento.descripcion,
          canchas: canchasConImagenes.map(cancha => ({
            nombre: cancha.nombre,
            tipo: cancha.tipo,
            descripcion: cancha.descripcion,
            imagenUrl: cancha.imagen,
            precio: cancha.precio,
            precioSena: cancha.precioSena
          }))
        }

        const response = await api.post('/api/predios', predioData)

        if (response.status !== 200) {
          throw new Error('Error al crear el predio')
        }

        router.push("/dashboard")
      } catch (error) {
        console.error('Error al crear el predio:', error)
      }
    }
  }

  const handleLocationSelect = (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    setEstablecimiento(prev => ({
      ...prev,
      ubicacion: location.address,
      coordenadas: {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      }
    }))
    if (errors.ubicacion) {
      setErrors(prev => {
        const newErrors = { ...prev }
        newErrors.ubicacion = ''
        return newErrors
      })
    }
  }

  const ImageDropzone = ({ 
    value, 
    onChange, 
    error 
  }: { 
    value: string | ImageFile; 
    onChange: (file: ImageFile | string) => void;
    error?: string;
  }) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png']
      },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        onChange({
          file,
          preview: URL.createObjectURL(file)
        });
      }
    });

    return (
      <div className="flex flex-col gap-2">
        {value && (
          <img 
            src={typeof value === 'string' ? value : value.preview} 
            alt="Vista previa" 
            className="w-40 h-40 object-cover rounded-md"
          />
        )}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer ${
            error ? 'border-red-500' : ''
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-gray-500 text-center">
            Arrastra y suelta una imagen aquí o haz clic para seleccionar
          </p>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Configuración de tu Predio Deportivo</CardTitle>
          <CardDescription>Paso {step} de 2</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Predio</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={establecimiento.nombre}
                    onChange={handleEstablecimientoChange}
                    required
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="imagen">Imagen del Predio</Label>
                  <ImageDropzone
                    value={establecimiento.imagen}
                    onChange={(file) => setEstablecimiento(prev => ({
                      ...prev,
                      imagen: file
                    }))}
                    error={errors.imagen}
                  />
                </div>
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    defaultValue={establecimiento.ubicacion}
                    error={errors.ubicacion}
                  />
                  {errors.ubicacion && (
                    <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>
                  )}
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="horarioApertura">Horario de Apertura</Label>
                    <div className="flex">
                      <Input
                        id="horarioApertura"
                        name="horarioApertura"
                        type="time"
                        value={establecimiento.horarioApertura}
                        onChange={handleEstablecimientoChange}
                        required
                        className={errors.horarioApertura ? "border-red-500" : ""}
                      />
                      <Clock className="ml-2 h-4 w-4 self-center" />
                    </div>
                    {errors.horarioApertura && (
                      <p className="text-red-500 text-sm mt-1">{errors.horarioApertura}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="horarioCierre">Horario de Cierre</Label>
                    <div className="flex">
                      <Input
                        id="horarioCierre"
                        name="horarioCierre"
                        type="time"
                        value={establecimiento.horarioCierre}
                        onChange={handleEstablecimientoChange}
                        required
                        className={errors.horarioCierre ? "border-red-500" : ""}
                      />
                      <Clock className="ml-2 h-4 w-4 self-center" />
                    </div>
                    {errors.horarioCierre && (
                      <p className="text-red-500 text-sm mt-1">{errors.horarioCierre}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="telefono">Número de Teléfono</Label>
                  <div className="flex">
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={establecimiento.telefono}
                      onChange={handleEstablecimientoChange}
                      required
                      className={errors.telefono ? "border-red-500" : ""}
                    />
                    <Phone className="ml-2 h-4 w-4 self-center" />
                  </div>
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={establecimiento.descripcion}
                    onChange={handleEstablecimientoChange}
                    rows={3}
                    className={errors.descripcion ? "border-red-500" : ""}
                  />
                  {errors.descripcion && (
                    <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {errors.canchas && (
                  <p className="text-red-500 text-sm">Por favor, complete todos los campos de las canchas</p>
                )}
                {canchas.map((cancha: Cancha) => (
                  <Card key={cancha.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">Cancha {canchas.indexOf(cancha) + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`cancha-nombre-${canchas.indexOf(cancha)}`}>Nombre de la Cancha</Label>
                          <Input
                            id={`cancha-nombre-${canchas.indexOf(cancha)}`}
                            value={cancha.nombre}
                            onChange={(e) => handleCanchaChange(canchas.indexOf(cancha), 'nombre', e.target.value)}
                            required
                            className={errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.nombre ? "border-red-500" : ""}
                          />
                          {errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.nombre && (
                            <p className="text-red-500 text-sm mt-1">{JSON.parse(errors.canchas)[canchas.indexOf(cancha)].nombre}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`cancha-descripcion-${canchas.indexOf(cancha)}`}>Descripción</Label>
                          <Textarea
                            id={`cancha-descripcion-${canchas.indexOf(cancha)}`}
                            value={cancha.descripcion}
                            onChange={(e) => handleCanchaChange(canchas.indexOf(cancha), 'descripcion', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`cancha-tipo-${canchas.indexOf(cancha)}`}>Tipo de Cancha</Label>
                          <Select
                            value={cancha.tipo}
                            onValueChange={(value) => handleCanchaChange(canchas.indexOf(cancha), 'tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de cancha" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="futbol5">Fútbol 5</SelectItem>
                              <SelectItem value="futbol7">Fútbol 7</SelectItem>
                              <SelectItem value="futbol9">Fútbol 9</SelectItem>
                              <SelectItem value="futbol11">Fútbol 11</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`cancha-imagen-${canchas.indexOf(cancha)}`}>Imagen de la Cancha</Label>
                          <ImageDropzone
                            value={cancha.imagen}
                            onChange={(file) => handleCanchaChange(canchas.indexOf(cancha), 'imagen', file)}
                            error={errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.imagen}
                          />
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <Label htmlFor={`cancha-precio-${canchas.indexOf(cancha)}`}>Precio Total</Label>
                            <div className="flex items-center">
                              <span className="mr-2">$</span>
                              <Input
                                id={`cancha-precio-${canchas.indexOf(cancha)}`}
                                type="number"
                                min="0"
                                value={cancha.precio}
                                onChange={(e) => handleCanchaChange(canchas.indexOf(cancha), 'precio', e.target.value)}
                                required
                                className={errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.precio ? "border-red-500" : ""}
                              />
                            </div>
                            {errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.precio && (
                              <p className="text-red-500 text-sm mt-1">{JSON.parse(errors.canchas)[canchas.indexOf(cancha)].precio}</p>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <Label htmlFor={`cancha-sena-${canchas.indexOf(cancha)}`}>Precio de Seña</Label>
                            <div className="flex items-center">
                              <span className="mr-2">$</span>
                              <Input
                                id={`cancha-sena-${canchas.indexOf(cancha)}`}
                                type="number"
                                min="0"
                                value={cancha.precioSena}
                                onChange={(e) => handleCanchaChange(canchas.indexOf(cancha), 'precioSena', e.target.value)}
                                className={errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.precioSena ? "border-red-500" : ""}
                              />
                            </div>
                            {errors.canchas && JSON.parse(errors.canchas)[canchas.indexOf(cancha)]?.precioSena && (
                              <p className="text-red-500 text-sm mt-1">{JSON.parse(errors.canchas)[canchas.indexOf(cancha)].precioSena}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={handleCanchaAdd} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agregar otra cancha
                </Button>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Anterior
            </Button>
          )}
          <Button type="submit" onClick={handleSubmit}>
            {step === 1 ? 'Siguiente' : 'Finalizar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}