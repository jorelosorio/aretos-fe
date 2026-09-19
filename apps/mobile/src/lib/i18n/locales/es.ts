type TranslationTree = { [key: string]: string | TranslationTree };

/** Source of truth: `Translations` is derived from this file's shape. */
export const es = {
  tabs: {
    home: 'Inicio',
    progress: 'Progreso',
    diary: 'Diario',
    goals: 'Mis Metas',
    settings: 'Ajustes',
  },
  home: {
    logEntry: 'Registrar',
    viewProgress: 'Ver mi progreso',
  },
  progress: {
    title: 'Progreso',
  },
  diary: {
    title: 'Diario',
  },
  goals: {
    title: 'Mis Metas',
  },
  auth: {
    title: 'Aretos',
    tagline: 'Registra tus metas y sigue tu progreso.',
    continueWithGoogle: 'Continuar con Google',
    signingIn: 'Iniciando sesión…',
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando sesión…',
    signOutConfirmTitle: '¿Cerrar sesión?',
    signOutConfirmBody: 'Tendrás que volver a iniciar sesión con Google.',
    cancel: 'Cancelar',
    errors: {
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      redirectNotAllowed:
        'Esta app no está autorizada por el servidor. Avisa al equipo.',
      emailNotVerified:
        'Tu cuenta de Google no tiene un correo verificado. Verifícalo e inténtalo de nuevo.',
      providerAuthFailed:
        'Google no pudo verificar tu cuenta. Inténtalo otra vez.',
      tierNotAllowed: 'Tu plan no permite el acceso a Aretos.',
      expiredCode: 'El inicio de sesión tardó demasiado. Inténtalo de nuevo.',
      sessionExpired: 'Tu sesión terminó. Inicia sesión de nuevo.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  settings: {
    appearance: 'Apariencia',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Automático',
    language: 'Idioma',
  },
} satisfies TranslationTree;

export type Translations = typeof es;
