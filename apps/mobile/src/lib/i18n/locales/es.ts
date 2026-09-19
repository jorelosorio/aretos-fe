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
    tagline:
      'Cada meta es algo grande. Dentro van las acciones concretas que la vuelven real.',
    new: 'Nueva meta',
    actions: 'Opciones',
    archive: 'Archivar',
    restore: 'Restaurar',
    filter: {
      active: 'Activas',
      archived: 'Archivadas',
    },
    delete: 'Eliminar',
    deleteConfirmTitle: '¿Eliminar esta meta?',
    deleteConfirmBody:
      'Se borran también sus hábitos y registros. Esta acción no se puede deshacer.',
    empty: {
      title: 'Todavía no hay ninguna meta',
      body: 'Empieza por la meta grande, aunque suene abstracta. Después la traduces en acciones que puedas marcar sin dudar.',
      archivedTitle: 'No hay metas archivadas',
      archivedBody:
        'Las metas que archives aparecen aquí, con su historial intacto.',
    },
    form: {
      newTitle: 'Nueva meta',
      editTitle: 'Editar meta',
      name: 'Nombre',
      namePlaceholder: 'Ej. Trabaja con excelencia',
      description: 'Descripción (opcional)',
      descriptionPlaceholder: '¿Por qué te importa esta meta?',
      frequency: 'Tu cadencia',
      streakRule: '¿Qué mantiene viva la racha?',
      threshold: 'Mínimo',
      create: 'Crear meta',
      save: 'Guardar cambios',
    },
    frequency: {
      daily: 'Diaria',
      dailyHint: 'Cada día cuenta como un periodo para la racha.',
      weekly: 'Semanal',
      weeklyHint: 'Cada semana cuenta como un periodo para la racha.',
      flexible: 'Flexible',
      flexibleHint: 'Registra cuando quieras; la racha se mide por semana.',
    },
    streak: {
      logged: 'Registrar, aunque sea parcial',
      loggedHint: 'Presentarte cuenta. La opción más sostenible.',
      threshold: 'Alcanzar un mínimo',
      thresholdHint:
        'El periodo cuenta solo si llegas al porcentaje que elijas.',
    },
    errors: {
      title: 'Algo salió mal',
      limitReached: 'Tu plan no permite más metas.',
      notFound: 'Esa meta ya no existe.',
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
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
