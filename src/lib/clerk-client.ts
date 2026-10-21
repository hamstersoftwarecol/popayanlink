import type { Clerk } from '@clerk/clerk-js';

type ClerkWindow = Window & { __internal_ClerkUICtor?: any };
let uiPromise: Promise<void> | undefined;

// Clerk Core 3 loads its prebuilt UI separately from the JavaScript client.
async function loadClerkUI(publishableKey: string) {
  const target = window as ClerkWindow;
  if (target.__internal_ClerkUICtor) return;
  if (!uiPromise) {
    uiPromise = new Promise<void>((resolve, reject) => {
      const encoded = publishableKey.split('_')[2];
      let domain: string;
      try { domain = atob(encoded).replace(/\$$/, ''); }
      catch { reject(new Error('La clave pública de Clerk no es válida.')); return; }
      if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(domain)) {
        reject(new Error('El dominio de Clerk no es válido.')); return;
      }
      const script = document.createElement('script');
      script.src = `https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.popayanlinkClerkUi = 'true';
      const timeout = window.setTimeout(() => {
        script.remove(); reject(new Error('Clerk tardó demasiado en responder.'));
      }, 20000);
      script.onload = () => {
        window.clearTimeout(timeout);
        if (target.__internal_ClerkUICtor) resolve();
        else { script.remove(); reject(new Error('No se pudo iniciar la interfaz de Clerk.')); }
      };
      script.onerror = () => {
        window.clearTimeout(timeout); script.remove();
        reject(new Error('No se pudo cargar la interfaz de Clerk.'));
      };
      document.head.appendChild(script);
    }).catch(error => { uiPromise = undefined; throw error; });
  }
  await uiPromise;
}

export async function loadClerkClient(publishableKey: string): Promise<Clerk> {
  const [{ Clerk }, { esES }] = await Promise.all([import('@clerk/clerk-js'), import('@clerk/localizations/es-ES'), loadClerkUI(publishableKey)]);
  const client = new Clerk(publishableKey);
  await client.load({
    localization: esES,
    ui: { ClerkUI: (window as ClerkWindow).__internal_ClerkUICtor },
    appearance: { variables: { colorPrimary: '#f56735', borderRadius: '0.5rem', fontFamily: 'DM Sans, sans-serif' } },
  });
  return client;
}
