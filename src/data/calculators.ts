// Calculator list for the hub page. The calculations themselves run on the API.
export const calculators = [
  {
    slug: '1rm',
    name: '1RM Calculator',
    description: 'Estimate your one-rep max to optimize your training zones.',
    icon: 'dumbbell' as const,
  },
  {
    slug: 'tdee',
    name: 'TDEE Calculator',
    description: 'Work out how many calories you burn on an average day.',
    icon: 'flame' as const,
  },
  {
    slug: 'bmi',
    name: 'BMI Calculator',
    description: 'A rough population-level screen for body composition.',
    icon: 'scale' as const,
  },
  {
    slug: 'macros',
    name: 'Macro Split Calculator',
    description: 'Divide your calorie target into protein, carbs, and fat.',
    icon: 'chart-pie' as const,
  },
  {
    slug: 'bodyfat',
    name: 'Body Fat % Estimator',
    description: 'Estimate body fat from tape measurements.',
    icon: 'person-standing' as const,
  },
]
