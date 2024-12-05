import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Políticas y términos de uso de la aplicación de alquiler de canchas de fútbol.',
}

export default function TermsOfUse() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Términos y Condiciones de Uso</h1>
            
            <h2 className="text-2xl font-semibold mt-6 mb-3">1. Introducción</h2>
            <p>Bienvenido a nuestra aplicación de alquiler de canchas de fútbol. Al utilizar esta aplicación, usted acepta estos términos y condiciones de uso.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">2. Uso de la Cámara</h2>
            <p>Nuestra aplicación requiere acceso a la cámara de su dispositivo para permitirle tomar fotos de las canchas, verificar su identidad durante el proceso de reserva y documentar el estado de las instalaciones. Su consentimiento es necesario para utilizar esta función.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">3. Uso de la Ubicación</h2>
            <p>Utilizamos su ubicación para mostrarle las canchas de fútbol más cercanas, proporcionar direcciones y mejorar la precisión de las reservas. Puede desactivar el acceso a la ubicación en cualquier momento desde la configuración de su dispositivo.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">4. Recopilación de Información</h2>
            <p>Recopilamos información sobre su ubicación y el uso de la cámara únicamente para mejorar su experiencia en la aplicación y facilitar el proceso de alquiler de canchas.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">5. Compartición de Información</h2>
            <p>No compartimos su información personal con terceros, excepto con los propietarios de las canchas cuando sea necesario para completar una reserva.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">6. Seguridad de la Información</h2>
            <p>Implementamos medidas de seguridad robustas para proteger su información personal y garantizar la integridad de nuestros servicios.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">7. Derechos del Usuario</h2>
            <p>Usted tiene derecho a acceder, corregir o eliminar su información personal en cualquier momento a través de la aplicación.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">8. Cambios en las Políticas</h2>
            <p>Cualquier modificación en nuestras políticas será notificada a través de la aplicación y requerirá su aceptación para continuar utilizando nuestros servicios.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contacto</h2>
            <p>Para cualquier pregunta o aclaración sobre estos términos y condiciones, por favor contáctenos en serato.arieli@gmail.com.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">10. Reservas y Cancelaciones</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>En las reservas sin señas, los complejos te podrán cancelar la reserva en cualquier momento.</li>
                <li>En las reservas con seña, una vez confirmada la reserva los complejos no podrán cancelarte la reserva.</li>
                <li>Las señas solo pueden efectuarse con tarjeta de crédito OCA, VISA Y MASTERCARD.</li>
                <li>Cancelación de reserva con seña: cancelando antes de 24hrs de la hora de juego el valor de la seña te quedará a favor para volver a usarlo en ese complejo. Este crédito a favor expirará a los 21 días de realizar la cancelación.</li>
                <li>Cancelación de reserva con seña: cancelando con menos de 24hrs de la hora de juego (mismo día) dependerás de que el complejo vuelva a reservar esa hora para que la seña te quede como crédito a favor. Si el complejo no logra volver a ocupar la hora, perderás el derecho de hacer uso de esa seña en otra oportunidad.</li>
                <li>En caso de hacer uso de esa seña a favor, si vuelves a cancelar, perderás el derecho a usarla nuevamente. Es decir, solo podrás cancelar por una vez.</li>
                <li>Nunca se te devuelve el valor de la seña en ninguno de los dos casos mencionados en los puntos anteriores.</li>
                <li>Cancelación por clima: esta opción solo está disponible en canchas abiertas. Para cancelar por...</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-3">11. Contacto</h2>
            <p>Para cualquier pregunta o aclaración sobre estos términos y condiciones, por favor contáctenos en serato.arieli@gmail.com.</p>
        </div>
    );
}
