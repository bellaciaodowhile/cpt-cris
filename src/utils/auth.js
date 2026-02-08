/**
 * Utilidades de autenticación personalizada
 */

/**
 * Hash simple de contraseña usando Web Crypto API
 * NOTA: Para producción, considera usar bcrypt en el backend
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifica si una contraseña coincide con su hash
 */
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Guarda el usuario en localStorage
 */
export function saveUser(user) {
  localStorage.setItem('cpt_user', JSON.stringify(user));
}

/**
 * Obtiene el usuario de localStorage
 */
export function getUser() {
  const userStr = localStorage.getItem('cpt_user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Elimina el usuario de localStorage
 */
export function removeUser() {
  localStorage.removeItem('cpt_user');
}

/**
 * Verifica si hay un usuario autenticado
 */
export function isAuthenticated() {
  return getUser() !== null;
}
