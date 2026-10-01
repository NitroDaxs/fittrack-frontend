// Calculator metadata for the hub page. These are all pure client-side
// formulas -- there's nothing here worth a backend round trip for.
export const calculators = [
  {
    slug: '1rm',
    name: '1RM Calculator',
    description: 'Estimate your one-rep max to optimize your training zones.',
    icon: 'fitness_center',
  },
  {
    slug: 'tdee',
    name: 'TDEE Calculator',
    description: 'Work out how many calories you burn on an average day.',
    icon: 'local_fire_department',
  },
  {
    slug: 'bmi',
    name: 'BMI Calculator',
    description: 'A rough population-level screen for body composition.',
    icon: 'scale',
  },
  {
    slug: 'macros',
    name: 'Macro Split Calculator',
    description: 'Divide your calorie target into protein, carbs, and fat.',
    icon: 'pie_chart',
  },
  {
    slug: 'bodyfat',
    name: 'Body Fat % Estimator',
    description: 'Estimate body fat from tape measurements.',
    icon: 'accessibility_new',
  },
]
