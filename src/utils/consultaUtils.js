import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Caracas';

/**
 * Clasifica el tipo de consulta según la hora
 * @param {Date|string} datetime - Fecha y hora de la consulta
 * @returns {string} - 'Consultorio' o 'Terreno'
 */
export function clasificarTipoConsulta(datetime) {
  const date = typeof datetime === 'string' ? parseISO(datetime) : datetime;
  const zonedDate = utcToZonedTime(date, TIMEZONE);
  const hour = zonedDate.getHours();
  
  // Consultorio: 07:00-12:00
  // Terreno: 13:00-16:00
  if (hour >= 7 && hour < 12) return 'Consultorio';
  if (hour >= 13 && hour < 17) return 'Terreno';
  
  return 'Consultorio'; // Por defecto
}

/**
 * Formatea fecha para zona horaria de Caracas
 */
export function formatCaracasDate(date, formatStr = 'dd/MM/yyyy HH:mm') {
  const zonedDate = utcToZonedTime(date, TIMEZONE);
  return format(zonedDate, formatStr);
}

/**
 * Convierte fecha local a UTC para guardar en DB
 */
export function toUTC(date) {
  return zonedTimeToUtc(date, TIMEZONE);
}

export const ENFERMEDADES_PREDETERMINADAS = [
  'Hipertensión arterial',
  'Cardiopatía isquémica',
  'Enfermedad cerebrovascular',
  'Asma bronquial',
  'Diabetes mellitus',
  'Tumores malignos',
  'Epilepsia',
  'Otras crónicas no transmisibles',
  'Síndrome Febril',
  'Parasitismo',
  'Restos de las causas'
];

// Enfermedades para tabla de Crónicas No Transmisibles
export const ENFERMEDADES_CRONICAS = [
  'Hipertensión arterial',
  'Cardiopatía isquémica',
  'Enfermedad cerebrovascular',
  'Asma bronquial',
  'Diabetes mellitus',
  'Tumores malignos',
  'Epilepsia',
  'Otras crónicas no transmisibles',
  'Restos de las causas'
];

// Enfermedades para tabla de Morbilidad
export const ENFERMEDADES_MORBILIDAD = [
  'Hipertensión Arterial',
  'Diabetes Mellitus',
  'Síndrome febril',
  'Asma Bronquial',
  'Parasitismo intestinal'
];
