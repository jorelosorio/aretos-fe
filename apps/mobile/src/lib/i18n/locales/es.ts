type TranslationTree = { [key: string]: string | TranslationTree };

/** Source of truth: `Translations` is derived from this file's shape. */
export const es = {
  tabs: {
    home: 'Inicio',
    log: 'Registrar',
    diary: 'Diario',
    goals: 'Mis Metas',
    settings: 'Ajustes',
  },
  home: {
    title: 'Hoy',
    greeting: 'Hola, %{name}',
    welcomeBack: 'Bienvenido de vuelta',
    streaks: {
      days: '%{count} d',
      none: 'Sin racha',
      label: 'Racha de %{count} días',
    },
    today: {
      title: 'Hoy',
    },
    week: {
      complete: '%{count} completos',
      summary: '%{logged} de %{total} días registrados esta semana',
    },
    logged: 'Registrado',
    notLogged: 'Sin registrar',
    progress: '%{answered} de %{total}',
    noHabits: 'Sin hábitos todavía',
    empty: {
      title: 'Aún no hay nada que registrar',
      body: 'Crea tu primera meta y los hábitos que la vuelven real. Aquí verás cómo va cada período.',
      action: 'Crear una meta',
    },
  },
  diary: {
    title: 'Diario',
  },
  logs: {
    mood: {
      question: '¿Cómo te sentiste?',
      optional: '(opcional)',
      scaleLabel: 'Cómo te sentiste, del 1 al 5',
      clearHint: 'Toca de nuevo para quitar la respuesta',
      scale: {
        '1': 'Muy mal',
        '2': 'Mal',
        '3': 'Normal',
        '4': 'Bien',
        '5': 'Muy bien',
      },
    },
    optional: '(opcional)',
    pickTitle: 'Registrar',
    pickGoal: '¿Sobre qué meta quieres registrar?',
    period: {
      previous: 'Período anterior',
      next: 'Período siguiente',
      today: 'Hoy',
      week: 'Semana del %{date}',
    },
    editing: 'Estás editando un registro guardado',
    progress: '%{answered} de %{total}',
    save: 'Guardar registro',
    update: 'Actualizar registro',
    note: 'Nota',
    notePlaceholder: '¿Qué hizo que fuera así?',
    entry: {
      done: 'Hecho',
      notDone: 'Hoy no',
      skip: 'No aplica',
      unskip: 'Sí aplica',
      skipped: 'No aplica en este período',
      target: 'Meta: %{target} %{unit}',
      plan: 'Mi plan',
      clear: 'Toca de nuevo para quitar la respuesta',
    },
    empty: {
      noGoalsTitle: 'Primero necesitas una meta',
      noGoalsBody:
        'Un registro siempre es sobre una meta. Crea una y añade los hábitos que quieres seguir.',
      noGoalsAction: 'Crear una meta',
      noHabitsTitle: 'Esta meta no tiene hábitos',
      noHabitsBody:
        'Una meta se registra a través de sus hábitos. Añade el primero y vuelve aquí.',
      noHabitsAction: 'Añadir un hábito',
    },
    errors: {
      title: 'Algo salió mal',
      limitReached: 'Tu plan no permite más registros.',
      notFound: 'Ese registro ya no existe.',
      loadFailed: 'No pudimos abrir este período. Inténtalo de nuevo.',
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  goals: {
    title: 'Mis Metas',
    tagline:
      'Cada meta es algo grande. Dentro van los hábitos concretos que la vuelven real.',
    new: 'Nueva meta',
    actions: 'Opciones',
    edit: 'Editar meta',
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
    stats: {
      habits: 'Hábitos',
      frequency: 'Cadencia',
      streak: 'Racha',
    },
    limit: {
      usage: '%{used} de %{limit} metas de tu plan',
      title: 'Sigue varias metas a la vez',
      reached:
        'Estás usando %{used} de %{limit}. Puedes añadir todos los hábitos que quieras a las metas que ya tienes; con Premium sigues varias metas a la vez y ves cuál avanza y cuál se queda atrás.',
      blockedTitle: 'Empieza por tu primera meta',
      blocked:
        'Tu plan todavía no incluye metas. Actualízalo para empezar a seguir lo que te importa.',
    },
    empty: {
      title: 'Todavía no hay ninguna meta',
      body: 'Empieza por la meta grande, aunque suene abstracta. Después la traduces en hábitos que puedas marcar sin dudar.',
      archivedTitle: 'No hay metas archivadas',
      archivedBody:
        'Las metas que archives aparecen aquí, con su historial intacto.',
    },
    form: {
      newTitle: 'Nueva meta',
      editTitle: 'Editar meta',
      name: 'Nombre',
      namePlaceholder: 'Ej. Trabaja con excelencia',
      nameHint: 'La meta grande, en tus palabras. Los detalles van después.',
      description: 'Descripción (opcional)',
      descriptionPlaceholder: '¿Por qué te importa?',
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
      loggedShort: 'Registrar',
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
  habits: {
    section: 'Hábitos',
    countOne: '%{count} hábito',
    countMany: '%{count} hábitos',
    new: 'Añadir un hábito',
    actions: 'Opciones',
    archive: 'Archivar',
    restore: 'Restaurar',
    delete: 'Eliminar',
    deleteConfirmTitle: '¿Eliminar este hábito?',
    deleteConfirmBody:
      'Se borran también sus registros. Esto no se puede deshacer.',
    weight: {
      normal: 'Normal',
      double: 'Media',
      triple: 'Alta',
      doubleBadge: 'Importancia media',
      tripleBadge: 'Importancia alta',
    },
    weightBadge: '×%{weight}',
    targetBadge: '≥ %{target} %{unit}',
    empty: {
      title: 'Todavía no hay hábitos',
      body: 'Una meta se vuelve real cuando la traduces en hábitos que puedas marcar sin tener que interpretarlos.',
    },
    form: {
      newTitle: 'Nuevo hábito',
      editTitle: 'Editar hábito',
      name: 'Hábito',
      namePlaceholder: 'Ej. Llega a tiempo',
      nameHint: 'Algo concreto que puedas marcar sin tener que interpretarlo.',
      mode: '¿Cómo lo registras?',
      target: 'Umbral de éxito',
      targetHint: 'A partir de aquí cuenta como logrado.',
      weight: 'Importancia',
      weightHint:
        'Cuanta más importancia tiene un hábito, más mueve el progreso de la meta: media cuenta el doble que normal, y alta el triple.',
      plan: 'Plan si-entonces (opcional)',
      planPlaceholder: 'Si… entonces…',
      planHint:
        'Ej. «Si son las 7:15 a.m., entonces salgo de casa aunque no haya terminado el café». Decidir de antemano cuándo y dónde lo harás es lo que más sube la probabilidad de hacerlo.',
      create: 'Añadir hábito',
      save: 'Guardar cambios',
    },
    mode: {
      binary: 'Sí / No',
      binaryHint:
        'Lo hiciste o no. La menor fricción posible — ideal para hábitos de carácter.',
      count: 'Cantidad',
      countHint:
        'Cuenta cuántas veces ocurrió (llamadas hechas, gracias dados).',
      duration: 'Duración',
      durationHint: 'Registra minutos (trabajo profundo, lectura, ejercicio).',
      rating: 'Escala 1-5',
      ratingHint: 'Auto-evalúa la intensidad cuando no hay un sí/no honesto.',
    },
    unit: {
      count: 'veces',
      duration: 'min',
      rating: 'de 5',
    },
    errors: {
      title: 'Algo salió mal',
      limitReached: 'Tu plan no permite más hábitos.',
      notFound: 'Ese hábito ya no existe.',
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
