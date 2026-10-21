export const viewPaths: Record<string, string> = {
  landing: '/', website: '/catalogo', workshop: '/taller', marketplace: '/ventas',
  portal: '/mi-portal', signin: '/acceso', dashboard: '/dashboard',
  bookings: '/dashboard/reservas', rentals: '/dashboard/vehiculos', repairs: '/dashboard/taller',
  sales: '/dashboard/ventas', customers: '/dashboard/clientes', agents: '/dashboard/agentes',
  messages: '/dashboard/mensajes', finances: '/dashboard/pagos', settings: '/dashboard/configuracion',
};
const publicViews = new Set(['landing', 'website', 'workshop', 'marketplace', 'portal', 'signin']);
export const isAdminView = (view: string) => Object.hasOwn(viewPaths, view) && !publicViews.has(view);
export function resolveView(pathname: string, hash = '') {
  const legacy = hash.replace(/^#/, '');
  if (Object.hasOwn(viewPaths, legacy)) return legacy;
  return Object.keys(viewPaths).find(view => viewPaths[view] === (pathname.replace(/\/$/, '') || '/')) || 'landing';
}
export function isAdminPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}
export function safeReturnPath(value: string | null) {
  return value && Object.values(viewPaths).includes(value) && value !== '/acceso' ? value : '/mi-portal';
}
