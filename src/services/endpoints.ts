/** Every API path the app calls, relative to the base URL set in http.ts. */
export const endpoints = {
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    logout: '/logout',
  },

  me: {
    profile: '/me',
    password: '/me/password',
    avatar: '/me/avatar',
    saved: '/me/saved',
    dashboard: '/me/dashboard',
    workouts: '/me/workouts',
    workout: (id: number) => `/me/workouts/${id}`,
    measurements: '/me/measurements',
  },

  exercises: {
    list: '/exercises',
    show: (key: string) => `/exercises/${key}`,
    save: (id: number) => `/exercises/${id}/save`,
  },

  routines: {
    list: '/routines',
    show: (key: string) => `/routines/${key}`,
    save: (id: number) => `/routines/${id}/save`,
  },

  articles: {
    list: '/articles',
    show: (key: string) => `/articles/${key}`,
  },

  taxonomies: '/taxonomies',

  chat: '/chat',

  calculators: {
    oneRepMax: '/calculators/one-rep-max',
    bmi: '/calculators/bmi',
    tdee: '/calculators/tdee',
    macros: '/calculators/macros',
    bodyFat: '/calculators/body-fat',
  },

  admin: {
    stats: '/admin/stats',
    activity: '/admin/activity',
    exercises: {
      list: '/admin/exercises',
      item: (id: number) => `/admin/exercises/${id}`,
    },
    routines: {
      list: '/admin/routines',
      item: (id: number) => `/admin/routines/${id}`,
    },
    articles: {
      list: '/admin/articles',
      item: (id: number) => `/admin/articles/${id}`,
    },
    users: {
      list: '/admin/users',
      item: (id: number) => `/admin/users/${id}`,
      toggleActive: (id: number) => `/admin/users/${id}/toggle-active`,
    },
  },
} as const
