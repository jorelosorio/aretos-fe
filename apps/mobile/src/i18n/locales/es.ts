type TranslationTree = { [key: string]: string | TranslationTree };

/** Source of truth: `Translations` is derived from this file's shape. */
export const es = {
  tabs: {
    home: 'Inicio',
    progress: 'Progreso',
    diary: 'Diario',
    goals: 'Mis Metas',
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
} satisfies TranslationTree;

export type Translations = typeof es;
