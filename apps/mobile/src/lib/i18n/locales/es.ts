type TranslationTree = { [key: string]: string | TranslationTree };

/** Source of truth: `Translations` is derived from this file's shape. */
export const es = {
  tabs: {
    home: 'Inicio',
    log: 'Registrar',
    diary: 'Diario',
    analysis: 'Análisis',
    goals: 'Mis Metas',
    settings: 'Ajustes',
  },
  home: {
    greeting: 'Hola, %{name}',
    welcomeBack: 'Bienvenido de vuelta',
    streaks: {
      days: '%{count} d',
      none: 'Sin racha',
      label: 'Racha de %{count} días',
    },
    today: {
      title: 'Tu reporte de hoy',
    },
    week: {
      counted: '%{count} cuentan para la racha',
      summary: '%{complete} de %{total} períodos completos',
    },
    noHabits: 'Sin hábitos todavía',
    openCheckIn: 'Abre el registro de esta meta',
  },
  diary: {
    title: 'Diario',
    entry: {
      more: '+%{count} más',
    },
    close: 'Cerrar',
    empty: {
      title: 'Tu diario está vacío',
      body: 'Cada registro que guardes aparece aquí, con su nota y cómo te sentiste.',
    },
    cutoff: {
      title: 'Hasta aquí llega tu plan',
      body: 'Tu plan muestra el diario desde el %{date}. Lo anterior sigue guardado y vuelve a aparecer si mejoras tu plan.',
    },
    errors: {
      badRequest: 'No pudimos leer el diario. Inténtalo de nuevo.',
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  analysis: {
    title: 'Análisis',
    empty: 'sin dato',
    errors: {
      badRequest: 'No pudimos leer el análisis. Inténtalo de nuevo.',
      locked: 'Tu plan no incluye el análisis.',
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
    units: {
      answer: '%{count} respuestas',
      period: '%{count} períodos',
      day: '%{count} días',
      weekday_day: '%{count} días',
      pair: '%{count} pares de días',
      log: '%{count} registros',
    },
    basis: {
      thin: '%{sample} · provisional',
    },
    notEnough: {
      title: 'Aún no hay suficiente',
      body: 'Necesitamos %{need} para decir algo con fundamento.',
    },
    window: {
      '30': '30 días',
      '90': '90 días',
      '365': '1 año',
    },
    scope: {
      all: 'Todas las metas',
    },
    section: {
      summary: 'Resumen',
      rhythm: 'Ritmo',
      mood: 'Ánimo',
      detail: 'Detalle',
    },
    sectionHint: {
      summary: 'Qué tanto apareces y qué tanto cumples cuando lo haces.',
      rhythm: 'Dónde caen tus días buenos y flojos, y hacia dónde vas.',
      mood: 'Qué tanto depende lo que haces de cómo te sientes.',
      detail: 'Meta por meta y hábito por hábito.',
    },
    setup: {
      title: 'Tu configuración',
      subtitle:
        'Qué tan medible es lo que estás siguiendo. Esto se puede responder antes del primer registro.',
      counts: '%{goals} metas · %{habits} hábitos activos',
      planned: 'Con plan',
      thresholded: 'Con umbral',
      weighted: 'Con pesos',
    },
    cadence: {
      title: 'Constancia',
      subtitle:
        'Aparecer y cumplir son dos preguntas distintas. Una racha se rompe con un día; esto no.',
      logging: 'Registraste',
      completion: 'Cumpliste',
      counted: 'Cuenta para la racha',
      status: {
        complete: 'Completos',
        partial: 'Parciales',
        missed: 'Fallados',
        skipped: 'Omitidos',
        empty: 'Sin registro',
      },
    },
    mix: {
      title: 'De qué está hecho tu porcentaje',
      subtitle:
        'Cada respuesta cae en uno de cuatro estados. Solo los dos primeros entran en el cálculo.',
      achieved: 'Logrado',
      missed: 'Sin lograr',
      skipped: 'No aplicaba',
      blank: 'Sin respuesta',
      center: '%{achieved} de %{opportunities} oportunidades',
      excluded:
        '%{count} respuestas quedaron fuera del porcentaje: %{skipped} por no aplicar y %{blank} sin respuesta. Es intencional, pero significa que tu porcentaje describe una base más pequeña de lo que parece.',
    },
    weekday: {
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',
    },
    rhythm: {
      title: 'Tu ritmo semanal',
      subtitle:
        'El promedio esconde la forma de la semana. Aquí se ve si hay un día concreto que se te escapa.',
      spreadLabel: 'Diferencia entre tu mejor y tu peor día',
      spreadValue: '%{points} pts',
      spreadReading:
        '%{best} es tu día fuerte (%{bestRate}) y %{worst} el más flojo (%{worstRate}). Una brecha así suele ser de calendario, no de fuerza de voluntad.',
      needExtremes: '%{count} días por cada día de la semana',
      regularityLabel: 'Regularidad',
      regularityReading:
        'Tus días varían ±%{deviation} puntos alrededor del %{mean}.',
      needRegularity: '%{count} días con registro',
    },
    trend: {
      title: '¿Vas mejorando?',
      subtitle:
        'La segunda mitad del período contra la primera, partida por fecha.',
      first: 'Primera mitad',
      second: 'Segunda mitad',
      half: '%{count} días',
      deltaLabel: 'Cambio',
      deltaValue: '%{points} pts',
      direction: {
        improving: 'Vas mejorando.',
        steady: 'Te mantienes estable.',
        declining: 'Vas bajando.',
      },
      need: '%{count} días en cada mitad',
    },
    strength: {
      negligible: 'Insignificante',
      weak: 'Débil',
      moderate: 'Moderada',
      strong: 'Fuerte',
    },
    moods: {
      title: 'Tu ánimo',
      subtitle:
        'Cómo usaste la escala del 1 al 5, y cada cuánto la respondiste.',
      summary: 'Respondiste en %{answered} de %{total} registros (%{rate}).',
    },
    moodPerformance: {
      title: 'Ánimo contra logro',
      subtitle:
        'Qué tanto depende tu conducta de cómo te sientes. Una brecha pequeña es el buen resultado.',
      low: 'Días flojos',
      neutral: 'Días neutros',
      high: 'Días buenos',
      days: '%{count} días',
      gapLabel: 'Brecha por ánimo',
      gapValue: '%{points} pts',
      automaticity: {
        automatic:
          'Tu conducta aguanta igual en días malos que en buenos. Eso es lo que hace un hábito formado.',
        mixed: 'Tu conducta aguanta en parte, pero el ánimo todavía pesa.',
        dependent:
          'Tu conducta todavía depende de cómo te sientes. Un plan concreto para los días flojos suele ser lo que cierra esa brecha.',
      },
      need: '%{count} días en los extremos de la escala',
    },
    direction: {
      title: 'Dirección',
      subtitle:
        'El mismo día no distingue causa de efecto. Emparejar cada día con el siguiente sí rompe esa simetría.',
      sameDay: 'Ánimo y logro el mismo día',
      moodLeads: 'Ánimo hoy → logro mañana',
      performanceLeads: 'Logro hoy → ánimo mañana',
      caveat:
        'Esto acota las posibilidades, no las resuelve: algo que moviera ambos aparecería igual en las dos columnas.',
      need: '%{count} pares de días consecutivos',
    },
    heatmap: {
      title: 'Mapa de constancia',
      subtitle:
        'Un cuadro por día. Los días en blanco no tenían nada pendiente — no son fallos.',
      less: 'Menos',
      more: 'Más',
      summary: '%{logged} días registrados de %{tracked} con algo pendiente.',
    },
    goals: {
      title: 'Por meta',
      subtitle:
        'Cada meta con su propio calendario. Para una meta semanal este es el único que se lee bien.',
      streaks: 'Racha %{current} · máxima %{longest}',
    },
    habits: {
      title: 'Tus hábitos',
      subtitle:
        'Cada hábito por separado. La mediana para automatizar uno es de %{median} repeticiones, con un rango observado de %{low} a %{high}.',
      formation: 'Formación',
      repetitions: '%{count} de %{median} repeticiones',
      span: 'A lo largo de %{count} días',
    },
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
    close: 'Cerrar',
    pickTitle: 'Registrar',
    pickGoal: '¿Sobre qué meta quieres registrar?',
    period: {
      previousWeek: 'Semana anterior',
      nextWeek: 'Semana siguiente',
      today: 'Hoy',
      week: 'Semana del %{date}',
    },
    status: {
      complete: 'Completo',
      partial: 'En camino',
      missed: 'Esta vez no',
      skipped: 'No aplicaba',
      empty: 'Sin registrar',
    },
    outcome: {
      done: 'Hecho',
      missed: 'Esta vez no',
      skipped: 'No aplica',
      pending: 'Sin responder',
    },
    tap: {
      done: 'Toca para marcarlo',
      amount: 'Toca para sumar',
    },
    editing: 'Estás editando un registro guardado',
    progress: '%{answered} de %{total}',
    save: 'Guardar registro',
    update: 'Actualizar registro',
    note: 'Nota',
    noteEditor: {
      open: 'Ampliar la nota',
      collapse: 'Contraer la nota',
    },
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
      noHabitsTitle: 'Esta meta no tiene hábitos',
      noHabitsBody:
        'Una meta se registra a través de sus hábitos. Añade el primero y vuelve aquí.',
      noHabitsAction: 'Añadir un hábito',
    },
    errors: {
      title: 'Algo salió mal',
      limitReached: 'Tu plan no permite más registros.',
      notFound: 'Ese registro ya no existe.',
      goalArchived:
        'Esta meta está archivada. Restáurala antes de registrar nada más.',
      loadFailed: 'No pudimos abrir este período. Inténtalo de nuevo.',
      network: 'No pudimos conectar con el servidor. Revisa tu conexión.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  goals: {
    title: 'Mis Metas',
    tagline:
      'Cada meta es algo grande. Dentro van los hábitos concretos que la vuelven real.',
    progress: '%{answered} de %{total}',
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
    archivedNotice: {
      title: 'Esta meta está archivada',
      body: 'Sus hábitos y su historial se quedan como están. Restáurala desde el menú de arriba para volver a hacer cambios.',
    },
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
      title: 'Todavía no has creado ninguna meta',
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
      create: 'Crear',
      save: 'Guardar',
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
      archived: 'Esta meta está archivada. Restáurala antes de hacer cambios.',
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
      create: 'Añadir',
      save: 'Guardar',
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
      goalArchived:
        'Su meta está archivada. Restaura la meta antes de hacer cambios.',
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
    attributions: 'Atribuciones',
    legal: 'Legal',
    licenses: 'Licencias',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Automático',
    language: 'Idioma',
  },
} satisfies TranslationTree;

export type Translations = typeof es;
