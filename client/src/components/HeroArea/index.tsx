import React from 'react'
import Image from 'next/image';

const HeroArea = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center px-6 py-12 max-w-8xl mx-auto sm:py-28">
      <div className="md:w-1/2 mb-8 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-accent">
          Reserva tu cancha <br />
          <span className="text-primary">De la manera mas facil</span>
        </h1>
        <p className="text-gray-600 mb-6">
          La posibilidad de jugar al deporte mas lindo de la manera más simple con tus amigos
        </p>
        <div className="flex space-x-4">
          <button className="bg-primary text-white hover:bg-accent-dark px-4 py-2 rounded-md">
            Descargala
          </button>
          <button className="border rounded-md border-gray-300 px-4 py-2 rounded flex items-center">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
            </svg>
            Demo
          </button>
        </div>
      </div>
      <div className="md:w-1/2 relative flex justify-center items-center">
        <Image 
          src="/images/hero/hero-images.png" 
          alt="Captura de pantalla de la aplicación" 
          width={400} 
          height={800}
          className="relative z-10"
        />
      </div>
    </div>
  )
}

export default HeroArea;
