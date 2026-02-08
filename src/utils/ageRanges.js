import { differenceInYears, parseISO } from 'date-fns';

/**
 * Calcula el rango de edad basado en la fecha de nacimiento
 * @param {string} dob - Fecha de nacimiento en formato ISO (YYYY-MM-DD)
 * @returns {string} - Rango de edad
 */
export function getAgeRange(dob) {
  if (!dob) return 'Edad Ignorada';
  
  try {
    const birthDate = typeof dob === 'string' ? parseISO(dob) : dob;
    const age = differenceInYears(new Date(), birthDate);
    
    if (age < 1) return '<1';
    if (age >= 1 && age <= 4) return '1-4';
    if (age >= 5 && age <= 6) return '5-6';
    if (age >= 7 && age <= 9) return '7-9';
    if (age >= 10 && age <= 11) return '10-11';
    if (age >= 12 && age <= 14) return '12-14';
    if (age >= 15 && age <= 19) return '15-19';
    if (age >= 20 && age <= 24) return '20-24';
    if (age >= 25 && age <= 44) return '25-44';
    if (age >= 45 && age <= 59) return '45-59';
    if (age >= 60 && age <= 64) return '60-64';
    if (age >= 65) return '65+';
    
    return 'Edad Ignorada';
  } catch (error) {
    console.error('Error calculando edad:', error);
    return 'Edad Ignorada';
  }
}

export const AGE_RANGES = [
  '<1', '1-4', '5-6', '7-9', '10-11', '12-14', 
  '15-19', '20-24', '25-44', '45-59', '60-64', '65+', 'Edad Ignorada'
];
