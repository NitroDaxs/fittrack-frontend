// Calculator list for the hub page. The calculations themselves run on the API.
export const calculators = [
  {
    slug: '1rm',
    name: 'common.x1rmCalculator',
    description: 'common.estimateYourOneRepMaxTo',
    icon: 'dumbbell' as const,
  },
  {
    slug: 'tdee',
    name: 'common.tdeeCalculator',
    description: 'calculators.hub.workOutHowManyCaloriesYou',
    icon: 'flame' as const,
  },
  {
    slug: 'bmi',
    name: 'common.bmiCalculator',
    description: 'calculators.hub.aRoughPopulationLevelScreenFor',
    icon: 'scale' as const,
  },
  {
    slug: 'macros',
    name: 'common.macroSplitCalculator',
    description: 'calculators.hub.divideYourCalorieTargetIntoProtein',
    icon: 'chart-pie' as const,
  },
  {
    slug: 'bodyfat',
    name: 'common.bodyFatEstimator',
    description: 'calculators.hub.estimateBodyFatFromTapeMeasurements',
    icon: 'person-standing' as const,
  },
]
