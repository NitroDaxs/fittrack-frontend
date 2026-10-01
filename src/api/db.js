// ---------------------------------------------------------------------------
// Seed data for the mock backend.
//
// Nothing outside src/api imports this file. When the Laravel API lands, this
// file and mockServer.js are deleted together and client.js starts issuing real
// HTTP requests -- every shape below is what the endpoints are expected to
// return, so it doubles as the contract for the backend.
// ---------------------------------------------------------------------------

const img = (id) => `https://lh3.googleusercontent.com/aida-public/${id}`

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
export const EQUIPMENT = ['Barbell', 'Dumbbell', 'Machine', 'Kettlebell', 'Bodyweight', 'None']
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
export const GOALS = ['Muscle Gain', 'Weight Loss', 'Strength', 'Endurance']
export const LEVELS = ['Beginner', 'Intermediate', 'Pro']
export const CATEGORIES = ['Nutrition', 'Training Theory', 'Recovery', 'Mindset', 'Biomechanics']

export const exercises = [
  {
    id: 1,
    slug: 'barbell-squat',
    name: 'Barbell Squat',
    description: 'A compound, full-body exercise focusing on the lower body. The king of leg builders.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Quadriceps, Glutes',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell, Power Rack',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuDdJWm1z1gpXbFljIn28JickVDYLnWX6nWuKKIBNTLAEbEHoq0HLE_-lxf1r6eP6F5C7qZrSECJznt5CLk4-zQ7MIEtW1yQLlLiscZaMJWmYC340tQir0qjNQbil4EtLCxwvOUdtZ_5VpDb20XHR4fA5supP_IsLUF5ailW4k76BWSAEQTYDRUA4jVZtlpIbYUkOkzJCvfs--I7kpl_LCyXcgKS4-sZNQ2dhD_GyxCcN2VW9BbCt38TpwsUrIyyJ0KY1UQGTlxLmCJm'
    ),
    steps: [
      { title: 'Setup', body: 'Position the bar on the rack at roughly mid-chest height. Step under it and rest it across your upper traps, not your neck.' },
      { title: 'Unrack & Stance', body: 'Brace, stand tall to clear the hooks, and take two controlled steps back. Feet shoulder-width, toes turned out 15-30 degrees.' },
      { title: 'Descent', body: 'Break at the hips and knees together. Descend until the hip crease passes below the knee, keeping a neutral spine throughout.' },
      { title: 'Ascent', body: 'Drive through mid-foot and extend hips and knees at the same rate. Lock out tall without hyperextending the lower back.' },
    ],
    tips: [
      'Keep your chest proud and upper back tight to support the bar.',
      'Ensure your knees track over your toes, avoiding inward collapse.',
      'Take a deep breath and brace your core before descending (Valsalva maneuver).',
    ],
    relatedIds: [7, 8, 9, 2],
  },
  {
    id: 2,
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    description: 'A hip-hinge movement that loads the hamstrings and glutes through a long eccentric.',
    muscleGroups: ['Legs', 'Back'],
    primaryMuscles: 'Hamstrings, Glutes',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuAdFqDTjykSo740iFNPNoDIoTVb6_K8SM-32Q0zG_Hg3VZgHe_cJhMWj6g5AGShAUXF1_o46fMiGSt7X-36yEr8m9j48pnR-AMXzseBcT7rSIhnsu6d8VPcHGtA3ZSekHPeglkgFJ8vFnEhbHEsLDxV4jPbyIMeIxLmQcr4z2HuJiNQoX-zxCGI4XonuMc80Ri9LBT1x-AHd0UPK6vVPaDzuUtV_UL-LpA__zVtDwZmNTl25XV4GNkRmPSyKSWyQwPlcjfL_p4TWgjY'
    ),
    steps: [
      { title: 'Setup', body: 'Hold the bar at hip height with a shoulder-width overhand grip, knees softly bent.' },
      { title: 'Descent', body: 'Push the hips straight back, letting the bar track down the thighs. Stop when the hamstrings reach end range.' },
      { title: 'Ascent', body: 'Drive the hips forward to stand tall, squeezing the glutes at the top.' },
    ],
    tips: [
      'Hinge at the hips and feel the stretch in your hamstrings.',
      'Do not round your lower back to chase extra range of motion.',
    ],
    relatedIds: [3, 1, 9],
  },
  {
    id: 3,
    slug: 'deadlift',
    name: 'Deadlift',
    description: 'The ultimate test of full-body strength, primarily engaging the posterior chain.',
    muscleGroups: ['Back', 'Legs'],
    primaryMuscles: 'Erectors, Glutes, Hamstrings',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuAsWCA_eDlmLWl_iy-wxwJHIV_BMi4SJPF3to49m8OQOKes6LWMFM3ShhphnSIpmZ8m9475CM_me6MDcCrfGAm9T7EDZQsi7HR4dGJqwPDPu_sKCQkXKV7hTPiYcQR8057KuaheP9f1lxLR1WfVFSCeZPrQAraQqTZGBnkBJvbgZeL7wM7uuNMiIi3voDXRUsOBAfVNTdWLKWnbj0jR7coMqnmmrNZRasyoFOB-Zpp5cDSCaCFVVxJIoNg_byoP04qoAjw5VkyM8qxQ'
    ),
    steps: [
      { title: 'Setup', body: 'Bar over mid-foot, shins an inch away. Hinge down and grip just outside the knees.' },
      { title: 'Brace', body: 'Drop the hips, lift the chest, and pull the slack out of the bar before it leaves the floor.' },
      { title: 'Pull', body: 'Push the floor away, keeping the bar in contact with the legs the whole way up.' },
    ],
    tips: ['Keep the bar path vertical.', 'Finish with hips and knees locked, not with a lean-back.'],
    relatedIds: [2, 1, 4],
  },
  {
    id: 4,
    slug: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    description: 'A compound movement targeting the chest, shoulders, and triceps. Essential for upper body strength.',
    muscleGroups: ['Chest'],
    primaryMuscles: 'Pectorals, Triceps',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell, Flat Bench',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuCZrBoeUanGSojWCCTtUgtXyO3ixvjRE1lecQjfxtkR1HYu2fjdN5yAsZIgE3DYTtWMud8T9CdbKRt8eV3C1CnV9z2_I-kcXJL2MoFuQafzzNu2kAgW0cEUBKOfacl0UtmBTXPTnOb-CE3crW6o0YTlxdZMHhokmofkxAqRqB4_HpqDkiqlkR-SnUWBLxhIBMkwZprxYijuhIm9iybmelt5kwbX6R0XTSu_122jnyym6pHjw8Ak6FeV4MqvFFuFFXLitIPoaL9NvE7V'
    ),
    steps: [
      { title: 'Setup', body: 'Eyes under the bar, shoulder blades retracted and pinned to the bench, feet flat.' },
      { title: 'Descent', body: 'Lower the bar under control to the lower chest with elbows at roughly 45 degrees.' },
      { title: 'Press', body: 'Drive the bar back over the shoulder joint, keeping upper-back tension.' },
    ],
    tips: ['Keep the shoulder blades retracted for the whole set.', 'Wrists stacked directly over the elbows.'],
    relatedIds: [5, 10, 6],
  },
  {
    id: 5,
    slug: 'push-ups',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for building foundational chest and core strength.',
    muscleGroups: ['Chest', 'Core'],
    primaryMuscles: 'Pectorals, Triceps',
    equipment: 'None',
    equipmentDetail: 'Bodyweight',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'self_improvement',
    image: img(
      'AB6AXuAaRLgGl1Vg2GmZRkNTWNmzeWLcRT7lSlkqg3cU-vVq3IG1Jfp5DTFRP0YKq1YMCxHFA9ULpRW7yKTpwRrw85-sTKzP61lW8YeO1yHuwv8-mf_zutms5z0SJnrQgYf0RiCZdB8q4LPWhf9fiEC9fhrxua0a4f3l73BLXp5T9roYirkQPW8dhb9M-0kKxmnBxXeOsIMwkZp9DQAGLf93IakY_Aj05_KTpLIbRWb876gHNSa0YXAWO92LHQCtVlgk3V09pobZYTtLfrA8'
    ),
    steps: [
      { title: 'Setup', body: 'Hands slightly wider than the shoulders, body in one straight line from heels to head.' },
      { title: 'Descent', body: 'Lower until the chest is an inch off the floor, elbows tucked to about 45 degrees.' },
      { title: 'Press', body: 'Push the floor away and finish with the shoulder blades spread.' },
    ],
    tips: ['Squeeze the glutes to stop the hips sagging.', 'Full lockout every rep.'],
    relatedIds: [4, 6, 12],
  },
  {
    id: 6,
    slug: 'dumbbell-row',
    name: 'Dumbbell Row',
    description: 'Unilateral back exercise focusing on lat development and core stabilization.',
    muscleGroups: ['Back', 'Arms'],
    primaryMuscles: 'Lats, Rhomboids',
    equipment: 'Dumbbell',
    equipmentDetail: 'Dumbbell, Bench',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuCPf8xz7tcyO1vRpR6ofc4wgIDy8rhoHpE5uvZgD7YeVoqT3NN5cbHfqBNZI3Z3abgbxKeorTDzhZ_JB89bmoeItZyd5f2JGI4Kmr3tFClx4iugPMTWOGYg77Oa8dNbIsEQIC-i8eHXacJ4pGYsBnNaQg3sWS0lnhzSRHMzcgllfqoTU1UW7rlCO-0S-88kb31eYrsKEF93bif6p1grcPUMT5_s5J1adccpPjgQW4s2twymmHTOBmgKG1dynWl8Tt0eCN94xl5jX1te'
    ),
    steps: [
      { title: 'Setup', body: 'One hand and knee on the bench, spine neutral, dumbbell hanging at arms length.' },
      { title: 'Pull', body: 'Drive the elbow toward the hip, finishing with the dumbbell beside the ribs.' },
      { title: 'Lower', body: 'Control the dumbbell back to a full stretch without rotating the torso.' },
    ],
    tips: ['Lead with the elbow, not the hand.', 'Keep the hips square to the floor.'],
    relatedIds: [11, 3, 4],
  },
  {
    id: 7,
    slug: 'front-squat',
    name: 'Front Squat',
    description: 'A quad-dominant squat variation that demands upright posture and thoracic mobility.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Quadriceps',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell, Power Rack',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuBR-V3nmfZW1_bM6ajQ5TjfQH3CFXUBAeBZ22uN9Dhj2N42TRf6cEif1aHUJicYm7Al8-jOLbwp_2uxnN3JqSS-ChXf3kQdlaQ8IOP0ZKOrJgjEuv786s8WuW_ObCP2IsXNxOCWpiaB-Ts1dZOjldufgeQ6cK72b-c6KCyinYqiROrlS6q8_USMYHNBhzT4yEcpu0ENRyaQ_xIu6i6NONKyl2XQqKLuwmh1Q64H_orh4nq01FovAwdI1pQxj9-5GJGd7R6VIKi4sdfy'
    ),
    steps: [
      { title: 'Rack Position', body: 'Bar across the front delts, elbows high, fingers under the bar for support.' },
      { title: 'Descent', body: 'Sit straight down keeping the elbows up; the torso stays near vertical.' },
      { title: 'Ascent', body: 'Drive up without letting the elbows drop.' },
    ],
    tips: ['Elbows up is the whole lift.', 'Use a lighter load than the back squat.'],
    relatedIds: [1, 9, 8],
  },
  {
    id: 8,
    slug: 'leg-press',
    name: 'Leg Press',
    description: 'Machine-based quad and glute builder that removes the stability demand of squatting.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Quadriceps, Glutes',
    equipment: 'Machine',
    equipmentDetail: 'Leg Press Machine',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuCzEyPRFETGqI8olySuwnrb8-2_pQfEROJn8i4Zid5ClicP-7NfJDPYokKgPdOYmh0G9LPsYUU9CN5L0YDFJDMOobUFUXf12D-J3KhVxLxyVEC_lXgIVakkYcMVHa60-nIqKTglHhbhUEHEt-yNdbbBxQsamEbJhy4BDcMBIJIODPZ98TEcaiZQJk5z2cImjC08cQmy7zVrHNLRc_Aw11pPfxZ4L8INSRLmTuFNrqE-v6BXSeUV6-ZsFG90_VgUY51Nyus-Pk5Jf60o'
    ),
    steps: [
      { title: 'Setup', body: 'Feet shoulder-width on the platform, back and hips flat against the pad.' },
      { title: 'Descent', body: 'Lower until the knees reach about 90 degrees without the lower back rounding off the pad.' },
      { title: 'Press', body: 'Drive through the whole foot; stop just short of locking the knees.' },
    ],
    tips: ['Control the eccentric.', 'Place feet lower on the platform to bias the quads.'],
    relatedIds: [1, 7, 9],
  },
  {
    id: 9,
    slug: 'dumbbell-lunge',
    name: 'Dumbbell Lunge',
    description: 'Unilateral leg work that exposes and corrects side-to-side strength differences.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Quadriceps, Glutes',
    equipment: 'Dumbbell',
    equipmentDetail: 'Dumbbells',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'accessibility_new',
    image: img(
      'AB6AXuAa0_FCMcC2c08ADlCAoh3srW1lbwAZ47WppBWS76euHVwtiTwQr_NCgQHUvc4kWyoaaBQngophTpvLAqga6SO2_Aw4N1pJo6JyG-aOML4NPBHYfy0FruZG8-a7OwTO_lzfchAfPMILPUfkyMjjv89WgRWl4OyLwLU7JJT_QaRhYV7z2MWF2PEb57YCRjSd2tTm5UgybMr3-qVIRGWaFn6GueT2HAAsEZhsSVkn0zAtM5iPI9TZleWGfpk8nv82okFDq7sHn5RZbRnl'
    ),
    steps: [
      { title: 'Setup', body: 'Dumbbells at your sides, chest tall, core braced.' },
      { title: 'Step', body: 'Take a controlled step forward and lower the back knee toward the floor.' },
      { title: 'Return', body: 'Push off the front heel to return to standing.' },
    ],
    tips: ['Keep the torso upright.', 'Front shin roughly vertical at the bottom.'],
    relatedIds: [1, 8, 2],
  },
  {
    id: 10,
    slug: 'overhead-press',
    name: 'Overhead Press',
    description: 'Standing vertical press that builds shoulder strength and full-body bracing.',
    muscleGroups: ['Shoulders', 'Arms'],
    primaryMuscles: 'Deltoids, Triceps',
    equipment: 'Barbell',
    equipmentDetail: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuA2r1u89fi_WJDaENJkStZCajqT8QBjZ6jAsDJwxmlOFbNth1K6tXp_agWld0hazUAdWENSDwZH2UV1M3s1rIi3bzRGAH6tLMxOobPh_85W371_vwqHN-pfabSCjJuyCPjoxbfEq4DlsnKq1xayO_McgICgN9TSyzBI7lfhS8Q3XdX_IcGpxjiopo3bvnUS_WuQBbCMMhM1HYBqz0HBwTS9JY-jj0AehNadzcN6MnLDJ7wgFsrmhFv06dRzYSLAF4AaRkKCPfIKdYkP'
    ),
    steps: [
      { title: 'Setup', body: 'Bar on the front delts, grip just outside shoulder-width, glutes and abs tight.' },
      { title: 'Press', body: 'Push the bar straight up, moving the head back slightly to clear a path.' },
      { title: 'Lockout', body: 'Finish with the bar over the mid-foot and the biceps beside the ears.' },
    ],
    tips: ['Squeeze the glutes to stop the lower back arching.', 'Do not press around the head -- move the head.'],
    relatedIds: [4, 5, 6],
  },
  {
    id: 11,
    slug: 'pull-ups',
    name: 'Pull-ups',
    description: 'The benchmark bodyweight pull. Builds lats, biceps, and grip simultaneously.',
    muscleGroups: ['Back', 'Arms'],
    primaryMuscles: 'Lats, Biceps',
    equipment: 'Bodyweight',
    equipmentDetail: 'Pull-up Bar',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'sports_gymnastics',
    image: img(
      'AB6AXuDcjZEs3m_8OCneWHkzVXb70FAdCRDrA8Qp5yu8I29gugZzzyb3Itws8sERu96maSp8ynYAwyDXTsFs9Hnt5KLSVSCBGCOVgosT-zaV9fGCwI-wM5BU0j-Re_3DZ9e4RMhyMK92xAse-jnVRnfr4Ji4Sfiu_xnHvd_2Ho2P4bs_l__PgKr_TR_5s5xPp1MRXl8y950Z2zfyANGQG_wHGSFsl7KK2_NpHmhPpwhqGKtiMuIh9NQ9qNVvb5bt-1iRFDYcEDNuSY2DnIqC'
    ),
    steps: [
      { title: 'Hang', body: 'Grip just outside shoulder-width, arms straight, shoulders active.' },
      { title: 'Pull', body: 'Drive the elbows down and back until the chin clears the bar.' },
      { title: 'Lower', body: 'Control the descent all the way to a dead hang.' },
    ],
    tips: ['Start each rep from a full hang.', 'Avoid kipping unless it is a deliberate variation.'],
    relatedIds: [6, 3, 10],
  },
  {
    id: 12,
    slug: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    description: 'Explosive hip hinge that trains the posterior chain and conditioning at once.',
    muscleGroups: ['Legs', 'Core'],
    primaryMuscles: 'Glutes, Hamstrings',
    equipment: 'Kettlebell',
    equipmentDetail: 'Kettlebell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Conditioning',
    icon: 'sports_gymnastics',
    image: img(
      'AB6AXuAa0_FCMcC2c08ADlCAoh3srW1lbwAZ47WppBWS76euHVwtiTwQr_NCgQHUvc4kWyoaaBQngophTpvLAqga6SO2_Aw4N1pJo6JyG-aOML4NPBHYfy0FruZG8-a7OwTO_lzfchAfPMILPUfkyMjjv89WgRWl4OyLwLU7JJT_QaRhYV7z2MWF2PEb57YCRjSd2tTm5UgybMr3-qVIRGWaFn6GueT2HAAsEZhsSVkn0zAtM5iPI9TZleWGfpk8nv82okFDq7sHn5RZbRnl'
    ),
    steps: [
      { title: 'Hike', body: 'Hinge and hike the bell back between the legs like a football snap.' },
      { title: 'Snap', body: 'Drive the hips forward hard; the bell floats to chest height on its own.' },
      { title: 'Catch', body: 'Let the bell fall, absorb it with a hinge, and repeat.' },
    ],
    tips: ['It is a hinge, not a squat.', 'The arms are ropes -- the hips do the work.'],
    relatedIds: [2, 3, 9],
  },
  {
    id: 13,
    slug: 'plank',
    name: 'Plank',
    description: 'Isometric anti-extension hold that teaches the core to resist movement.',
    muscleGroups: ['Core'],
    primaryMuscles: 'Rectus Abdominis, Transverse Abdominis',
    equipment: 'None',
    equipmentDetail: 'Bodyweight',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    category: 'Core',
    icon: 'self_improvement',
    image: img(
      'AB6AXuAaRLgGl1Vg2GmZRkNTWNmzeWLcRT7lSlkqg3cU-vVq3IG1Jfp5DTFRP0YKq1YMCxHFA9ULpRW7yKTpwRrw85-sTKzP61lW8YeO1yHuwv8-mf_zutms5z0SJnrQgYf0RiCZdB8q4LPWhf9fiEC9fhrxua0a4f3l73BLXp5T9roYirkQPW8dhb9M-0kKxmnBxXeOsIMwkZp9DQAGLf93IakY_Aj05_KTpLIbRWb876gHNSa0YXAWO92LHQCtVlgk3V09pobZYTtLfrA8'
    ),
    steps: [
      { title: 'Setup', body: 'Elbows under the shoulders, forearms flat, feet hip-width.' },
      { title: 'Brace', body: 'Tuck the pelvis, squeeze the glutes, and hold a straight line.' },
    ],
    tips: ['Quality over duration -- stop when the hips drop.'],
    relatedIds: [5, 12],
  },
  {
    id: 14,
    slug: 'lat-pulldown',
    name: 'Lat Pulldown',
    description: 'Machine vertical pull, a scalable route to the strength needed for pull-ups.',
    muscleGroups: ['Back', 'Arms'],
    primaryMuscles: 'Lats',
    equipment: 'Machine',
    equipmentDetail: 'Cable Machine',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'fitness_center',
    image: img(
      'AB6AXuCPf8xz7tcyO1vRpR6ofc4wgIDy8rhoHpE5uvZgD7YeVoqT3NN5cbHfqBNZI3Z3abgbxKeorTDzhZ_JB89bmoeItZyd5f2JGI4Kmr3tFClx4iugPMTWOGYg77Oa8dNbIsEQIC-i8eHXacJ4pGYsBnNaQg3sWS0lnhzSRHMzcgllfqoTU1UW7rlCO-0S-88kb31eYrsKEF93bif6p1grcPUMT5_s5J1adccpPjgQW4s2twymmHTOBmgKG1dynWl8Tt0eCN94xl5jX1te'
    ),
    steps: [
      { title: 'Setup', body: 'Thighs locked under the pad, grip wider than the shoulders.' },
      { title: 'Pull', body: 'Drive the elbows down to bring the bar to the collarbone.' },
      { title: 'Return', body: 'Let the bar rise until the lats are fully stretched.' },
    ],
    tips: ['Minimal torso swing.', 'Think elbows to pockets.'],
    relatedIds: [11, 6],
  },
  {
    id: 15,
    slug: 'treadmill-intervals',
    name: 'Treadmill Intervals',
    description: 'Structured work-to-rest running intervals for raising VO2 max.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Cardiovascular',
    equipment: 'Machine',
    equipmentDetail: 'Treadmill',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    category: 'Cardio',
    icon: 'directions_run',
    image: img(
      'AB6AXuAD4nyiiUgwm2MICTgF9FR4RjEjWroAddZSTYOalydSWVwp5uaMqySAPhfrj2W51-UJ-O9HLh4VdqLMcU77a_S1wKmSWdfTPtoSfPJinVyHBNPqkKj_D0YGyhNwfACcwToYalaaT-MTLm8xBWjRijY8239i4TjRO97ElrN2hY8iESGnMSWMrEUfQdyGeM-bi6_edlTt87BuG4GWMhudWIw37nGagw85OWlYWJx5XzwbAgPqUUbp4amYaCIeiZtYm33uk1hcGFlbb1yQ'
    ),
    steps: [
      { title: 'Warm-up', body: 'Ten easy minutes to raise core temperature.' },
      { title: 'Work', body: '60 seconds hard, 90 seconds easy. Repeat 8-10 times.' },
      { title: 'Cool-down', body: 'Five minutes easy, then walk.' },
    ],
    tips: ['Hold the same pace across every interval.'],
    relatedIds: [12],
  },
  {
    id: 16,
    slug: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    description: 'Rear-foot-elevated single-leg squat with a brutal stability demand.',
    muscleGroups: ['Legs'],
    primaryMuscles: 'Quadriceps, Glutes',
    equipment: 'Dumbbell',
    equipmentDetail: 'Dumbbells, Bench',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    category: 'Strength',
    icon: 'accessibility_new',
    image: img(
      'AB6AXuAa0_FCMcC2c08ADlCAoh3srW1lbwAZ47WppBWS76euHVwtiTwQr_NCgQHUvc4kWyoaaBQngophTpvLAqga6SO2_Aw4N1pJo6JyG-aOML4NPBHYfy0FruZG8-a7OwTO_lzfchAfPMILPUfkyMjjv89WgRWl4OyLwLU7JJT_QaRhYV7z2MWF2PEb57YCRjSd2tTm5UgybMr3-qVIRGWaFn6GueT2HAAsEZhsSVkn0zAtM5iPI9TZleWGfpk8nv82okFDq7sHn5RZbRnl'
    ),
    steps: [
      { title: 'Setup', body: 'Rear foot on a bench, front foot far enough forward to keep the shin vertical.' },
      { title: 'Descent', body: 'Lower until the rear knee is just off the floor.' },
      { title: 'Ascent', body: 'Drive through the front heel without pushing off the back foot.' },
    ],
    tips: ['Find the foot position before you add load.'],
    relatedIds: [9, 1, 8],
  },
]

export const routines = [
  {
    id: 1,
    slug: 'hypertrophy-split',
    title: 'Hypertrophy Split',
    subtitle: 'Advanced Hypertrophy Protocol',
    description: 'Focus on building lean muscle mass with this proven 4-day upper/lower split program.',
    goal: 'Muscle Gain',
    level: 'Intermediate',
    daysPerWeek: 4,
    weeks: 8,
    minutes: 75,
    durationLabel: '60-90 Min',
    icon: 'fitness_center',
    image: img(
      'AB6AXuDcjZEs3m_8OCneWHkzVXb70FAdCRDrA8Qp5yu8I29gugZzzyb3Itws8sERu96maSp8ynYAwyDXTsFs9Hnt5KLSVSCBGCOVgosT-zaV9fGCwI-wM5BU0j-Re_3DZ9e4RMhyMK92xAse-jnVRnfr4Ji4Sfiu_xnHvd_2Ho2P4bs_l__PgKr_TR_5s5xPp1MRXl8y950Z2zfyANGQG_wHGSFsl7KK2_NpHmhPpwhqGKtiMuIh9NQ9qNVvb5bt-1iRFDYcEDNuSY2DnIqC'
    ),
    days: [
      {
        name: 'Day 1',
        focus: 'Upper Body Power',
        minutes: 70,
        exercises: [
          { exerciseId: 4, sets: '4-5', reps: '4-6', note: 'Work up to a heavy top set, then back off 10%.' },
          { exerciseId: 11, sets: '4', reps: '6-8', note: 'Add load once you clear 8 clean reps.' },
          { exerciseId: 10, sets: '3', reps: '6-8', note: 'Strict, no leg drive.' },
        ],
      },
      {
        name: 'Day 2',
        focus: 'Lower Body Power',
        minutes: 75,
        exercises: [
          { exerciseId: 1, sets: '4-6', reps: '4-6', note: 'Rest three full minutes between working sets.' },
          { exerciseId: 2, sets: '3', reps: '8-10', note: 'Hinge at the hips and feel the stretch in your hamstrings. Do not round your lower back.' },
          { exerciseId: 8, sets: '3', reps: '10-12', note: 'Control the eccentric. Place feet lower on the platform to bias the quads.' },
        ],
      },
      { name: 'Day 3', focus: 'Active Recovery', minutes: 30, exercises: [{ exerciseId: 13, sets: '3', reps: '45s', note: 'Hold quality position.' }] },
      {
        name: 'Day 4',
        focus: 'Push Hypertrophy',
        minutes: 65,
        exercises: [
          { exerciseId: 4, sets: '4', reps: '8-12', note: 'Slow eccentric, one second pause on the chest.' },
          { exerciseId: 5, sets: '3', reps: 'AMRAP', note: 'Stop two reps shy of failure.' },
        ],
      },
      {
        name: 'Day 5',
        focus: 'Pull Hypertrophy',
        minutes: 65,
        exercises: [
          { exerciseId: 6, sets: '4', reps: '10-12', note: 'Full stretch at the bottom of every rep.' },
          { exerciseId: 14, sets: '3', reps: '12-15', note: 'Squeeze for a beat at the bottom.' },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'fat-burn-hiit',
    title: 'Fat Burn HIIT',
    subtitle: 'Metabolic Conditioning Block',
    description: 'High-intensity interval training designed to maximize calorie burn in minimal time.',
    goal: 'Weight Loss',
    level: 'Beginner',
    daysPerWeek: 3,
    weeks: 6,
    minutes: 30,
    durationLabel: '25-35 Min',
    icon: 'directions_run',
    image: img(
      'AB6AXuCArTRg4n8_1K6RAa4yl6z-ozuVnAyxhRe4l99-624abG_gzpAHMaXQTWY11l5-r3wKj2QfgbAwYWBL7qEwGXYpo4O6R3r3dxpPSzJ5VAJY4cWmrIxaO9fMtsM3O4bpevBVEEyccq3XNtmA8WspKFzYhd-4BQBxmu0l9P2p_S1J4Sr3jhcx3C5GUVRAkpsNkSdVIfUkrajwkrHn4-NcG_RakuGePFuI8wyoSg4KNJF76t-WPE5ORC9L-1tjPnibwojkf7vCMN8PDmsr'
    ),
    days: [
      {
        name: 'Day 1',
        focus: 'Interval Running',
        minutes: 30,
        exercises: [{ exerciseId: 15, sets: '8', reps: '60s', note: '90 seconds easy between efforts.' }],
      },
      {
        name: 'Day 2',
        focus: 'Full Body Circuit',
        minutes: 28,
        exercises: [
          { exerciseId: 12, sets: '5', reps: '20', note: 'Rest 60 seconds between rounds.' },
          { exerciseId: 5, sets: '5', reps: '12', note: 'Straight into the swings.' },
        ],
      },
      { name: 'Day 3', focus: 'Core & Conditioning', minutes: 25, exercises: [{ exerciseId: 13, sets: '4', reps: '60s', note: '' }] },
    ],
  },
  {
    id: 3,
    slug: 'powerlifting-peak',
    title: 'Powerlifting Peak',
    subtitle: 'Competition Peaking Block',
    description: 'Advanced strength program focusing on the big three lifts: squat, bench, and deadlift.',
    goal: 'Strength',
    level: 'Pro',
    daysPerWeek: 5,
    weeks: 12,
    minutes: 90,
    durationLabel: '75-105 Min',
    icon: 'sports_martial_arts',
    image: img(
      'AB6AXuCNsewniIbu03EMqk_e4oWUY9m5BIqV-QOpq7_mY9yMutMYJCpfblSjpX5MMBxq835KPxjnAJ4EynIxTnCXG7N9Cq6E6kTBkAbyiW9JnqcISmS8wQnhSN2SQWc1LZ7VuaVXESLmNJjKHY6dyih6Ijsgsnwh3-9NEBa1hhrCaVyjUeoGT4S4Iewr52HzsCAfk_QBsHbaY2r5M3A6JtsaguMXruXjWVVRnAqfdEb5xMFfsbw4-Dt_PxrU8nZsN-vJLvF7Jyguj6EAvPYR'
    ),
    days: [
      { name: 'Day 1', focus: 'Squat Focus', minutes: 90, exercises: [{ exerciseId: 1, sets: '6', reps: '3', note: 'Percentage based -- 82% of training max.' }, { exerciseId: 7, sets: '3', reps: '5', note: '' }] },
      { name: 'Day 2', focus: 'Bench Focus', minutes: 80, exercises: [{ exerciseId: 4, sets: '6', reps: '3', note: '' }, { exerciseId: 10, sets: '3', reps: '6', note: '' }] },
      { name: 'Day 3', focus: 'Deadlift Focus', minutes: 85, exercises: [{ exerciseId: 3, sets: '5', reps: '2', note: 'Reset every rep.' }, { exerciseId: 2, sets: '3', reps: '8', note: '' }] },
      { name: 'Day 4', focus: 'Accessory Upper', minutes: 60, exercises: [{ exerciseId: 6, sets: '4', reps: '10', note: '' }, { exerciseId: 11, sets: '4', reps: '8', note: '' }] },
      { name: 'Day 5', focus: 'Accessory Lower', minutes: 60, exercises: [{ exerciseId: 16, sets: '4', reps: '8', note: '' }, { exerciseId: 8, sets: '3', reps: '12', note: '' }] },
    ],
  },
  {
    id: 4,
    slug: 'push-power-build',
    title: 'Push Power Build',
    subtitle: 'Upper Body Density Protocol',
    description: 'Focus on chest, shoulders, and triceps with this high-volume density protocol.',
    goal: 'Muscle Gain',
    level: 'Intermediate',
    daysPerWeek: 3,
    weeks: 6,
    minutes: 45,
    durationLabel: '45 Min',
    icon: 'fitness_center',
    image: img(
      'AB6AXuBR-V3nmfZW1_bM6ajQ5TjfQH3CFXUBAeBZ22uN9Dhj2N42TRf6cEif1aHUJicYm7Al8-jOLbwp_2uxnN3JqSS-ChXf3kQdlaQ8IOP0ZKOrJgjEuv786s8WuW_ObCP2IsXNxOCWpiaB-Ts1dZOjldufgeQ6cK72b-c6KCyinYqiROrlS6q8_USMYHNBhzT4yEcpu0ENRyaQ_xIu6i6NONKyl2XQqKLuwmh1Q64H_orh4nq01FovAwdI1pQxj9-5GJGd7R6VIKi4sdfy'
    ),
    days: [
      { name: 'Day 1', focus: 'Heavy Push', minutes: 45, exercises: [{ exerciseId: 4, sets: '5', reps: '5', note: '' }, { exerciseId: 10, sets: '4', reps: '8', note: '' }] },
      { name: 'Day 2', focus: 'Volume Push', minutes: 45, exercises: [{ exerciseId: 5, sets: '5', reps: '15', note: '' }, { exerciseId: 4, sets: '4', reps: '12', note: '' }] },
      { name: 'Day 3', focus: 'Density Push', minutes: 40, exercises: [{ exerciseId: 10, sets: '6', reps: '6', note: 'EMOM.' }] },
    ],
  },
  {
    id: 5,
    slug: 'vo2-max-sprinter',
    title: 'VO2 Max Sprinter',
    subtitle: 'Aerobic Ceiling Block',
    description: 'Brutal interval sprints designed to increase cardiovascular capacity quickly.',
    goal: 'Endurance',
    level: 'Intermediate',
    daysPerWeek: 3,
    weeks: 4,
    minutes: 30,
    durationLabel: '30 Min',
    icon: 'directions_run',
    image: img(
      'AB6AXuAD4nyiiUgwm2MICTgF9FR4RjEjWroAddZSTYOalydSWVwp5uaMqySAPhfrj2W51-UJ-O9HLh4VdqLMcU77a_S1wKmSWdfTPtoSfPJinVyHBNPqkKj_D0YGyhNwfACcwToYalaaT-MTLm8xBWjRijY8239i4TjRO97ElrN2hY8iESGnMSWMrEUfQdyGeM-bi6_edlTt87BuG4GWMhudWIw37nGagw85OWlYWJx5XzwbAgPqUUbp4amYaCIeiZtYm33uk1hcGFlbb1yQ'
    ),
    days: [
      { name: 'Day 1', focus: 'Short Intervals', minutes: 30, exercises: [{ exerciseId: 15, sets: '10', reps: '45s', note: '' }] },
      { name: 'Day 2', focus: 'Tempo', minutes: 35, exercises: [{ exerciseId: 15, sets: '3', reps: '8min', note: '' }] },
      { name: 'Day 3', focus: 'Long Intervals', minutes: 32, exercises: [{ exerciseId: 15, sets: '5', reps: '3min', note: '' }] },
    ],
  },
  {
    id: 6,
    slug: 'kettlebell-core',
    title: 'Kettlebell Core',
    subtitle: 'Functional Full Body',
    description: 'Dynamic full-body movements focusing on posterior chain and stability.',
    goal: 'Endurance',
    level: 'Beginner',
    daysPerWeek: 3,
    weeks: 6,
    minutes: 60,
    durationLabel: '60 Min',
    icon: 'sports_gymnastics',
    image: img(
      'AB6AXuAa0_FCMcC2c08ADlCAoh3srW1lbwAZ47WppBWS76euHVwtiTwQr_NCgQHUvc4kWyoaaBQngophTpvLAqga6SO2_Aw4N1pJo6JyG-aOML4NPBHYfy0FruZG8-a7OwTO_lzfchAfPMILPUfkyMjjv89WgRWl4OyLwLU7JJT_QaRhYV7z2MWF2PEb57YCRjSd2tTm5UgybMr3-qVIRGWaFn6GueT2HAAsEZhsSVkn0zAtM5iPI9TZleWGfpk8nv82okFDq7sHn5RZbRnl'
    ),
    days: [
      { name: 'Day 1', focus: 'Hinge & Carry', minutes: 60, exercises: [{ exerciseId: 12, sets: '5', reps: '15', note: '' }, { exerciseId: 13, sets: '3', reps: '45s', note: '' }] },
      { name: 'Day 2', focus: 'Squat & Press', minutes: 55, exercises: [{ exerciseId: 9, sets: '4', reps: '10', note: '' }, { exerciseId: 10, sets: '3', reps: '10', note: '' }] },
      { name: 'Day 3', focus: 'Full Body Flow', minutes: 60, exercises: [{ exerciseId: 12, sets: '6', reps: '12', note: '' }, { exerciseId: 5, sets: '4', reps: '12', note: '' }] },
    ],
  },
  {
    id: 7,
    slug: 'beginner-foundations',
    title: 'Beginner Foundations',
    subtitle: 'First 8 Weeks',
    description: 'A full-body three-day programme that teaches the core lifts without wrecking you.',
    goal: 'Strength',
    level: 'Beginner',
    daysPerWeek: 3,
    weeks: 8,
    minutes: 50,
    durationLabel: '45-55 Min',
    icon: 'fitness_center',
    image: img(
      'AB6AXuCZrBoeUanGSojWCCTtUgtXyO3ixvjRE1lecQjfxtkR1HYu2fjdN5yAsZIgE3DYTtWMud8T9CdbKRt8eV3C1CnV9z2_I-kcXJL2MoFuQafzzNu2kAgW0cEUBKOfacl0UtmBTXPTnOb-CE3crW6o0YTlxdZMHhokmofkxAqRqB4_HpqDkiqlkR-SnUWBLxhIBMkwZprxYijuhIm9iybmelt5kwbX6R0XTSu_122jnyym6pHjw8Ak6FeV4MqvFFuFFXLitIPoaL9NvE7V'
    ),
    days: [
      { name: 'Day 1', focus: 'Full Body A', minutes: 50, exercises: [{ exerciseId: 8, sets: '3', reps: '10', note: '' }, { exerciseId: 4, sets: '3', reps: '8', note: '' }, { exerciseId: 14, sets: '3', reps: '10', note: '' }] },
      { name: 'Day 2', focus: 'Full Body B', minutes: 50, exercises: [{ exerciseId: 9, sets: '3', reps: '10', note: '' }, { exerciseId: 5, sets: '3', reps: '12', note: '' }, { exerciseId: 6, sets: '3', reps: '10', note: '' }] },
      { name: 'Day 3', focus: 'Full Body C', minutes: 45, exercises: [{ exerciseId: 2, sets: '3', reps: '10', note: '' }, { exerciseId: 13, sets: '3', reps: '30s', note: '' }] },
    ],
  },
  {
    id: 8,
    slug: 'lean-recomposition',
    title: 'Lean Recomposition',
    subtitle: 'Strength in a Deficit',
    description: 'Keep your strength while dropping body fat with heavy lifting plus low-intensity cardio.',
    goal: 'Weight Loss',
    level: 'Intermediate',
    daysPerWeek: 4,
    weeks: 10,
    minutes: 55,
    durationLabel: '50-60 Min',
    icon: 'local_fire_department',
    image: img(
      'AB6AXuCArTRg4n8_1K6RAa4yl6z-ozuVnAyxhRe4l99-624abG_gzpAHMaXQTWY11l5-r3wKj2QfgbAwYWBL7qEwGXYpo4O6R3r3dxpPSzJ5VAJY4cWmrIxaO9fMtsM3O4bpevBVEEyccq3XNtmA8WspKFzYhd-4BQBxmu0l9P2p_S1J4Sr3jhcx3C5GUVRAkpsNkSdVIfUkrajwkrHn4-NcG_RakuGePFuI8wyoSg4KNJF76t-WPE5ORC9L-1tjPnibwojkf7vCMN8PDmsr'
    ),
    days: [
      { name: 'Day 1', focus: 'Lower Strength', minutes: 55, exercises: [{ exerciseId: 1, sets: '4', reps: '6', note: '' }, { exerciseId: 16, sets: '3', reps: '10', note: '' }] },
      { name: 'Day 2', focus: 'Upper Strength', minutes: 55, exercises: [{ exerciseId: 4, sets: '4', reps: '6', note: '' }, { exerciseId: 11, sets: '4', reps: '6', note: '' }] },
      { name: 'Day 3', focus: 'Zone 2 Cardio', minutes: 45, exercises: [{ exerciseId: 15, sets: '1', reps: '40min', note: 'Conversational pace throughout.' }] },
      { name: 'Day 4', focus: 'Full Body Circuit', minutes: 50, exercises: [{ exerciseId: 12, sets: '4', reps: '20', note: '' }, { exerciseId: 5, sets: '4', reps: '15', note: '' }] },
    ],
  },
]

export const articles = [
  {
    id: 1,
    slug: 'science-of-hypertrophy',
    title: 'The Science of Hypertrophy',
    excerpt: 'What actually drives muscle growth, and how to structure training around the three mechanisms that matter.',
    category: 'Training Theory',
    author: 'Dr. E. Reynolds',
    date: '2023-10-24',
    readMinutes: 8,
    status: 'Published',
    image: img(
      'AB6AXuCZrBoeUanGSojWCCTtUgtXyO3ixvjRE1lecQjfxtkR1HYu2fjdN5yAsZIgE3DYTtWMud8T9CdbKRt8eV3C1CnV9z2_I-kcXJL2MoFuQafzzNu2kAgW0cEUBKOfacl0UtmBTXPTnOb-CE3crW6o0YTlxdZMHhokmofkxAqRqB4_HpqDkiqlkR-SnUWBLxhIBMkwZprxYijuhIm9iybmelt5kwbX6R0XTSu_122jnyym6pHjw8Ak6FeV4MqvFFuFFXLitIPoaL9NvE7V'
    ),
    body: [
      { type: 'p', text: 'Muscle growth is not the mysterious process it is often made out to be. Three decades of resistance-training research converge on a small set of mechanisms, and once you understand them, programme design stops being guesswork.' },
      { type: 'h2', text: 'The Pillars of Muscle Growth' },
      { type: 'p', text: 'Mechanical Tension: the force a muscle produces against resistance, held for long enough to matter. This is the dominant driver, and it is why progressive overload sits at the centre of every serious programme.' },
      { type: 'p', text: 'Metabolic Stress: the accumulation of metabolites during sustained effort. Higher-rep work taken close to failure contributes here, which is why pure strength blocks are usually paired with some hypertrophy volume.' },
      { type: 'p', text: 'Muscle Damage: microtrauma from eccentric loading. Its contribution is smaller and more contested than the other two, and chasing soreness for its own sake is a reliable way to blunt progress.' },
      { type: 'quote', text: 'Tension applied consistently over months beats novelty applied enthusiastically for three weeks.' },
      { type: 'h2', text: 'Optimizing Your Routine' },
      { type: 'p', text: 'Ten to twenty hard sets per muscle group per week covers most trainees. Distribute them across two sessions rather than one, keep two to three reps in reserve on most sets, and add load or reps whenever you clear the top of a prescribed range.' },
      { type: 'callout', text: 'Key Takeaway: pick a small number of lifts, add weight to them steadily, and give each muscle group two exposures a week. Everything else is refinement.' },
    ],
    relatedIds: [2, 3, 4],
  },
  {
    id: 2,
    slug: 'macronutrient-timing',
    title: 'Macronutrient Timing: Optimizing Fuel for Hypertrophy',
    excerpt: 'When to eat for optimal recovery, and why total daily intake still matters more than the clock.',
    category: 'Nutrition',
    author: 'S. Mitchell, RD',
    date: '2023-10-28',
    readMinutes: 6,
    status: 'Published',
    image: img(
      'AB6AXuAaRLgGl1Vg2GmZRkNTWNmzeWLcRT7lSlkqg3cU-vVq3IG1Jfp5DTFRP0YKq1YMCxHFA9ULpRW7yKTpwRrw85-sTKzP61lW8YeO1yHuwv8-mf_zutms5z0SJnrQgYf0RiCZdB8q4LPWhf9fiEC9fhrxua0a4f3l73BLXp5T9roYirkQPW8dhb9M-0kKxmnBxXeOsIMwkZp9DQAGLf93IakY_Aj05_KTpLIbRWb876gHNSa0YXAWO92LHQCtVlgk3V09pobZYTtLfrA8'
    ),
    body: [
      { type: 'p', text: 'The anabolic window turned out to be a barn door. Protein distribution across the day matters, but the urgency once attached to the post-workout shake has not survived closer study.' },
      { type: 'h2', text: 'What The Evidence Supports' },
      { type: 'p', text: 'Hit your daily protein target first: roughly 1.6 to 2.2 grams per kilogram of body weight. Spread it across three to five feedings. Carbohydrates around training help performance more than they help growth directly.' },
      { type: 'callout', text: 'Key Takeaway: total intake sets the ceiling; timing decides how comfortably you reach it.' },
    ],
    relatedIds: [1, 3],
  },
  {
    id: 3,
    slug: 'sleep-architecture',
    title: 'The Science of Sleep Architecture and Athletic Output',
    excerpt: 'Deep sleep is where adaptation happens. Here is what shortens it and what protects it.',
    category: 'Recovery',
    author: 'Dr. E. Reynolds',
    date: '2023-11-06',
    readMinutes: 7,
    status: 'Published',
    image: img(
      'AB6AXuAD4nyiiUgwm2MICTgF9FR4RjEjWroAddZSTYOalydSWVwp5uaMqySAPhfrj2W51-UJ-O9HLh4VdqLMcU77a_S1wKmSWdfTPtoSfPJinVyHBNPqkKj_D0YGyhNwfACcwToYalaaT-MTLm8xBWjRijY8239i4TjRO97ElrN2hY8iESGnMSWMrEUfQdyGeM-bi6_edlTt87BuG4GWMhudWIw37nGagw85OWlYWJx5XzwbAgPqUUbp4amYaCIeiZtYm33uk1hcGFlbb1yQ'
    ),
    body: [
      { type: 'p', text: 'Growth hormone release clusters in slow-wave sleep, most of which occurs in the first half of the night. Cutting sleep short at the back end costs you REM; going to bed late costs you deep sleep, which is the more expensive loss for an athlete.' },
      { type: 'h2', text: 'Protecting Deep Sleep' },
      { type: 'p', text: 'Consistent sleep and wake times do more than any supplement. Keep the room cool, cut caffeine eight hours before bed, and treat late-evening high-intensity training as a cost rather than a free lunch.' },
      { type: 'callout', text: 'Key Takeaway: a regular bedtime is the highest-leverage recovery intervention available, and it is free.' },
    ],
    relatedIds: [1, 5],
  },
  {
    id: 4,
    slug: 'progressive-overload-vs-vbt',
    title: 'Progressive Overload vs. Velocity Based Training',
    excerpt: 'Two ways to decide what to lift today, and how to choose between them.',
    category: 'Training Theory',
    author: 'Coach D. Vance',
    date: '2023-11-14',
    readMinutes: 9,
    status: 'Published',
    image: img(
      'AB6AXuCNsewniIbu03EMqk_e4oWUY9m5BIqV-QOpq7_mY9yMutMYJCpfblSjpX5MMBxq835KPxjnAJ4EynIxTnCXG7N9Cq6E6kTBkAbyiW9JnqcISmS8wQnhSN2SQWc1LZ7VuaVXESLmNJjKHY6dyih6Ijsgsnwh3-9NEBa1hhrCaVyjUeoGT4S4Iewr52HzsCAfk_QBsHbaY2r5M3A6JtsaguMXruXjWVVRnAqfdEb5xMFfsbw4-Dt_PxrU8nZsN-vJLvF7Jyguj6EAvPYR'
    ),
    body: [
      { type: 'p', text: 'Linear progression tells you what to lift before you walk in the door. Velocity-based training tells you what to lift after the first warm-up set. Both work; they fail in different ways.' },
      { type: 'h2', text: 'Choosing Your Model' },
      { type: 'p', text: 'If your life is stable and your training age is low, percentages are simpler and just as effective. If sleep and stress vary week to week, autoregulation stops you grinding through sessions you should have backed off.' },
      { type: 'callout', text: 'Key Takeaway: autoregulation earns its complexity only once fixed percentages start failing you.' },
    ],
    relatedIds: [1, 6],
  },
  {
    id: 5,
    slug: 'cognitive-framing-max-effort',
    title: 'Cognitive Framing for Max Effort Lifts',
    excerpt: 'The mental routine that separates a confident attempt from a tentative one.',
    category: 'Mindset',
    author: 'J. Doe',
    date: '2023-11-21',
    readMinutes: 5,
    status: 'Published',
    image: img(
      'AB6AXuBR-V3nmfZW1_bM6ajQ5TjfQH3CFXUBAeBZ22uN9Dhj2N42TRf6cEif1aHUJicYm7Al8-jOLbwp_2uxnN3JqSS-ChXf3kQdlaQ8IOP0ZKOrJgjEuv786s8WuW_ObCP2IsXNxOCWpiaB-Ts1dZOjldufgeQ6cK72b-c6KCyinYqiROrlS6q8_USMYHNBhzT4yEcpu0ENRyaQ_xIu6i6NONKyl2XQqKLuwmh1Q64H_orh4nq01FovAwdI1pQxj9-5GJGd7R6VIKi4sdfy'
    ),
    body: [
      { type: 'p', text: 'Arousal helps up to a point and then wrecks technique. The trick is a repeatable pre-lift routine that puts you in the same state every time, rather than a one-off surge of aggression.' },
      { type: 'h2', text: 'Building The Routine' },
      { type: 'p', text: 'Fix the number of breaths, the walk-up, and the cue you say to yourself. Rehearse it on warm-up sets so it is automatic when the bar is heavy.' },
      { type: 'callout', text: 'Key Takeaway: rehearse the routine on light sets so it costs you nothing on heavy ones.' },
    ],
    relatedIds: [4, 1],
  },
  {
    id: 6,
    slug: 'periodization-models',
    title: 'Periodization Models: Linear vs. Undulating',
    excerpt: 'How to structure your training cycles to prevent plateaus and ensure continuous progress.',
    category: 'Training Theory',
    author: 'Coach D. Vance',
    date: '2023-12-02',
    readMinutes: 10,
    status: 'Published',
    image: img(
      'AB6AXuAsWCA_eDlmLWl_iy-wxwJHIV_BMi4SJPF3to49m8OQOKes6LWMFM3ShhphnSIpmZ8m9475CM_me6MDcCrfGAm9T7EDZQsi7HR4dGJqwPDPu_sKCQkXKV7hTPiYcQR8057KuaheP9f1lxLR1WfVFSCeZPrQAraQqTZGBnkBJvbgZeL7wM7uuNMiIi3voDXRUsOBAfVNTdWLKWnbj0jR7coMqnmmrNZRasyoFOB-Zpp5cDSCaCFVVxJIoNg_byoP04qoAjw5VkyM8qxQ'
    ),
    body: [
      { type: 'p', text: 'Linear periodization moves from high volume to high intensity across a block. Undulating models vary both within a week. The research shows comparable outcomes; the practical differences are about adherence and recovery.' },
      { type: 'h2', text: 'Picking A Structure' },
      { type: 'p', text: 'Linear blocks suit peaking for a date. Undulating suits open-ended training where you want frequent exposure to every quality.' },
      { type: 'callout', text: 'Key Takeaway: choose the model that matches whether you have a competition date or an open horizon.' },
    ],
    relatedIds: [4, 1],
  },
  {
    id: 7,
    slug: 'mastering-the-deadlift-hinge',
    title: 'Mastering the Deadlift Hinge',
    excerpt: 'A deep dive into the mechanics of the hip hinge and how to maximize recruitment safely.',
    category: 'Biomechanics',
    author: 'Dr. E. Reynolds',
    date: '2023-12-11',
    readMinutes: 7,
    status: 'Draft',
    image: img(
      'AB6AXuAsWCA_eDlmLWl_iy-wxwJHIV_BMi4SJPF3to49m8OQOKes6LWMFM3ShhphnSIpmZ8m9475CM_me6MDcCrfGAm9T7EDZQsi7HR4dGJqwPDPu_sKCQkXKV7hTPiYcQR8057KuaheP9f1lxLR1WfVFSCeZPrQAraQqTZGBnkBJvbgZeL7wM7uuNMiIi3voDXRUsOBAfVNTdWLKWnbj0jR7coMqnmmrNZRasyoFOB-Zpp5cDSCaCFVVxJIoNg_byoP04qoAjw5VkyM8qxQ'
    ),
    body: [
      { type: 'p', text: 'The hinge is a hip-dominant pattern with minimal knee travel. Confusing it with a squat is the single most common reason lifters feel deadlifts in the wrong places.' },
      { type: 'callout', text: 'Key Takeaway: the bar path should be vertical, and the hips should be the last thing to finish.' },
    ],
    relatedIds: [1, 6],
  },
  {
    id: 8,
    slug: 'zone-2-cardio-protocols',
    title: 'Zone 2 Cardio Protocols',
    excerpt: 'Building a vast aerobic base without compromising your strength work.',
    category: 'Recovery',
    author: 'Coach D. Vance',
    date: '2023-12-19',
    readMinutes: 6,
    status: 'Draft',
    image: img(
      'AB6AXuAD4nyiiUgwm2MICTgF9FR4RjEjWroAddZSTYOalydSWVwp5uaMqySAPhfrj2W51-UJ-O9HLh4VdqLMcU77a_S1wKmSWdfTPtoSfPJinVyHBNPqkKj_D0YGyhNwfACcwToYalaaT-MTLm8xBWjRijY8239i4TjRO97ElrN2hY8iESGnMSWMrEUfQdyGeM-bi6_edlTt87BuG4GWMhudWIw37nGagw85OWlYWJx5XzwbAgPqUUbp4amYaCIeiZtYm33uk1hcGFlbb1yQ'
    ),
    body: [
      { type: 'p', text: 'Zone 2 is the highest intensity you can hold while still breathing through your nose and holding a conversation. It is meant to feel easy, and the discipline is in keeping it that way.' },
      { type: 'callout', text: 'Key Takeaway: if you can not talk in full sentences, you are not in zone 2.' },
    ],
    relatedIds: [3, 6],
  },
]

export const users = [
  { id: 1, name: 'Alex Alexson', email: 'alex@fittrack.example', role: 'Admin', joined: '2023-10-12', status: 'Active' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.c@fittrack.example', role: 'Member', joined: '2023-11-04', status: 'Active' },
  { id: 3, name: 'John Doe', email: 'john.doe@fittrack.example', role: 'Member', joined: '2023-12-18', status: 'Suspended' },
  { id: 4, name: 'Priya Raman', email: 'priya.r@fittrack.example', role: 'Member', joined: '2024-01-09', status: 'Active' },
  { id: 5, name: 'Marcus Webb', email: 'm.webb@fittrack.example', role: 'Member', joined: '2024-01-27', status: 'Active' },
  { id: 6, name: 'Dana Kovač', email: 'dana.k@fittrack.example', role: 'Editor', joined: '2024-02-14', status: 'Active' },
  { id: 7, name: 'Tom Ellery', email: 't.ellery@fittrack.example', role: 'Member', joined: '2024-03-02', status: 'Inactive' },
  { id: 8, name: 'Nina Bauer', email: 'nina.b@fittrack.example', role: 'Member', joined: '2024-03-21', status: 'Active' },
  { id: 9, name: 'Omar Haddad', email: 'omar.h@fittrack.example', role: 'Editor', joined: '2024-04-08', status: 'Active' },
  { id: 10, name: 'Grace Lin', email: 'grace.l@fittrack.example', role: 'Member', joined: '2024-05-16', status: 'Active' },
  { id: 11, name: 'Felix Moreau', email: 'felix.m@fittrack.example', role: 'Member', joined: '2024-06-01', status: 'Suspended' },
  { id: 12, name: 'Amara Osei', email: 'amara.o@fittrack.example', role: 'Member', joined: '2024-06-23', status: 'Active' },
]

export const currentUser = {
  id: 1,
  name: 'Alex',
  fullName: 'Alex Alexson',
  email: 'alex@example.com',
  plan: 'Premium Member',
  joined: '2022',
  level: 12,
  title: 'Pro Walker',
  units: 'imperial',
  pushNotifications: true,
  avatar: img(
    'AB6AXuDFI_dOrmYS7UkK1aYHE13RYgvJ-5lUY9CGgk0k-pakP1AYrH5G9GRkWsUvPf19g0dHRrui3J2JT7kVSJYMVndERsPYCHpBTjMLv6Yy-T3NZTjcC9owANJV4k9KQ5teXYHSK59DWYh_hRABYqxVbc6kLUgEDH0tXhbddZ-ruoKEJX0F-VLtBqOv-DzBX1F9UhtwI7GVAuP6NfP8KNnailYOSZrpswPzgyGEcx7yUIjHlAtXfk7VHSnTHK6D8NBcQch5dB8henz6MOqR'
  ),
  savedRoutineIds: [1, 6],
  favoriteExerciseIds: [12, 3, 15],
}

export const workoutHistory = [
  {
    id: 1,
    name: 'Leg Day Annihilation',
    performedAt: '2024-06-26T08:30:00',
    minutes: 75,
    tags: ['Lower Body', 'Strength'],
    icon: 'fitness_center',
    volume: 41250,
    entries: [
      { exerciseId: 1, sets: [{ weight: 225, reps: 8 }, { weight: 225, reps: 8 }, { weight: 235, reps: 6 }, { weight: 235, reps: 6 }] },
      { exerciseId: 2, sets: [{ weight: 185, reps: 10 }, { weight: 185, reps: 10 }, { weight: 185, reps: 9 }] },
      { exerciseId: 8, sets: [{ weight: 450, reps: 12 }, { weight: 450, reps: 12 }, { weight: 450, reps: 10 }] },
    ],
  },
  {
    id: 2,
    name: 'Morning 5K Sprint',
    performedAt: '2024-06-25T06:15:00',
    minutes: 28,
    tags: ['Cardio', 'Outdoor'],
    icon: 'directions_run',
    volume: 0,
    entries: [{ exerciseId: 15, sets: [{ weight: 0, reps: 1 }] }],
  },
  {
    id: 3,
    name: 'Active Recovery Flow',
    performedAt: '2024-06-24T19:00:00',
    minutes: 45,
    tags: ['Mobility', 'Recovery'],
    icon: 'self_improvement',
    volume: 0,
    entries: [{ exerciseId: 13, sets: [{ weight: 0, reps: 60 }, { weight: 0, reps: 60 }, { weight: 0, reps: 45 }] }],
  },
  {
    id: 4,
    name: 'Push Power Build',
    performedAt: '2024-06-22T17:40:00',
    minutes: 52,
    tags: ['Upper Body', 'Hypertrophy'],
    icon: 'fitness_center',
    volume: 18400,
    entries: [
      { exerciseId: 4, sets: [{ weight: 185, reps: 8 }, { weight: 185, reps: 8 }, { weight: 185, reps: 7 }, { weight: 175, reps: 8 }] },
      { exerciseId: 10, sets: [{ weight: 115, reps: 8 }, { weight: 115, reps: 7 }, { weight: 105, reps: 9 }] },
    ],
  },
  {
    id: 5,
    name: 'Pull Hypertrophy',
    performedAt: '2024-06-20T18:05:00',
    minutes: 61,
    tags: ['Upper Body', 'Hypertrophy'],
    icon: 'fitness_center',
    volume: 22100,
    entries: [
      { exerciseId: 11, sets: [{ weight: 0, reps: 9 }, { weight: 0, reps: 8 }, { weight: 0, reps: 7 }, { weight: 0, reps: 6 }] },
      { exerciseId: 6, sets: [{ weight: 80, reps: 12 }, { weight: 80, reps: 12 }, { weight: 85, reps: 10 }] },
    ],
  },
  {
    id: 6,
    name: 'Zone 2 Base Run',
    performedAt: '2024-06-18T06:45:00',
    minutes: 40,
    tags: ['Cardio', 'Endurance'],
    icon: 'directions_run',
    volume: 0,
    entries: [{ exerciseId: 15, sets: [{ weight: 0, reps: 1 }] }],
  },
  {
    id: 7,
    name: 'Full Body Circuit',
    performedAt: '2024-06-16T10:20:00',
    minutes: 38,
    tags: ['Full Body', 'Conditioning'],
    icon: 'sports_gymnastics',
    volume: 9800,
    entries: [
      { exerciseId: 12, sets: [{ weight: 53, reps: 20 }, { weight: 53, reps: 20 }, { weight: 53, reps: 18 }] },
      { exerciseId: 5, sets: [{ weight: 0, reps: 15 }, { weight: 0, reps: 14 }, { weight: 0, reps: 12 }] },
    ],
  },
]

export const measurements = [
  { id: 1, date: '2024-06-26', weight: 185.2, bodyFat: 14.8, waist: 32.5, chest: 42.5, arms: 15.6 },
  { id: 2, date: '2024-06-19', weight: 186.4, bodyFat: 15.0, waist: 32.6, chest: 42.0, arms: 15.5 },
  { id: 3, date: '2024-06-12', weight: 187.2, bodyFat: 15.2, waist: 32.8, chest: 42.0, arms: 15.5 },
  { id: 4, date: '2024-06-05', weight: 188.0, bodyFat: 15.4, waist: 33.0, chest: 41.8, arms: 15.4 },
  { id: 5, date: '2024-05-29', weight: 189.1, bodyFat: 15.7, waist: 33.2, chest: 41.6, arms: 15.3 },
  { id: 6, date: '2024-05-22', weight: 190.3, bodyFat: 16.0, waist: 33.4, chest: 41.5, arms: 15.2 },
  { id: 7, date: '2024-05-15', weight: 191.0, bodyFat: 16.2, waist: 33.6, chest: 41.4, arms: 15.2 },
  { id: 8, date: '2024-05-08', weight: 191.8, bodyFat: 16.5, waist: 33.8, chest: 41.2, arms: 15.1 },
  { id: 9, date: '2024-05-01', weight: 192.4, bodyFat: 16.8, waist: 34.0, chest: 41.0, arms: 15.0 },
  { id: 10, date: '2024-04-24', weight: 193.5, bodyFat: 17.1, waist: 34.2, chest: 40.8, arms: 14.9 },
  { id: 11, date: '2024-04-17', weight: 194.2, bodyFat: 17.4, waist: 34.5, chest: 40.6, arms: 14.8 },
  { id: 12, date: '2024-04-10', weight: 195.0, bodyFat: 17.8, waist: 34.8, chest: 40.4, arms: 14.7 },
]

// Estimated 1RM by month for the three main lifts.
export const strengthProgression = {
  'Squat (1RM)': [
    { month: 'Jan', value: 285 }, { month: 'Feb', value: 295 }, { month: 'Mar', value: 305 },
    { month: 'Apr', value: 300 }, { month: 'May', value: 320 }, { month: 'Jun', value: 335 },
  ],
  'Bench Press (1RM)': [
    { month: 'Jan', value: 195 }, { month: 'Feb', value: 200 }, { month: 'Mar', value: 205 },
    { month: 'Apr', value: 215 }, { month: 'May', value: 215 }, { month: 'Jun', value: 225 },
  ],
  'Deadlift (1RM)': [
    { month: 'Jan', value: 355 }, { month: 'Feb', value: 375 }, { month: 'Mar', value: 385 },
    { month: 'Apr', value: 395 }, { month: 'May', value: 410 }, { month: 'Jun', value: 425 },
  ],
}

// 126 days (18 weeks) of session counts, generated deterministically so the
// heatmap looks the same on every render.
export const consistency = (() => {
  const days = []
  const end = new Date('2024-06-26')
  let seed = 20240626
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  for (let i = 125; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const r = rand()
    let count = 0
    if (r > 0.58) count = 1
    if (r > 0.82) count = 2
    if (r > 0.94) count = 3
    // Sundays are usually rest days.
    if (d.getDay() === 0 && r < 0.9) count = 0
    days.push({ date: d.toISOString().slice(0, 10), count })
  }
  return days
})()

export const dashboardStats = {
  streak: 7,
  workoutsThisWeek: 4,
  latestWeight: 185.4,
  weightUnit: 'lbs',
}

export const adminStats = {
  totalExercises: 245,
  totalRoutines: 112,
  publishedArticles: 84,
  totalUsers: 12000,
  exerciseDelta: '+12 this week',
  routineDelta: '+5 this week',
  articleDelta: 'Steady',
  userDelta: '+340 this month',
  apiUptime: 99.9,
  storageCapacity: 78,
}

export const adminActivity = [
  { id: 1, icon: 'add_circle', tone: 'primary', text: 'New exercise added: Bulgarian Split Squat', meta: 'Added by Admin • 10 mins ago' },
  { id: 2, icon: 'person_add', tone: 'secondary', text: 'User Alex J. joined the platform.', meta: 'Organic Sign-up • 1 hour ago' },
  { id: 3, icon: 'publish', tone: 'tertiary', text: 'Article "The Science of Sleep" published.', meta: 'Author: Dr. Sarah K. • 3 hours ago' },
  { id: 4, icon: 'update', tone: 'neutral', text: 'Routine "HIIT Core Burner" updated.', meta: 'Modified 2 exercises • 5 hours ago' },
]

export const calculators = [
  { slug: '1rm', name: '1RM Calculator', description: 'Estimate your one-rep max to optimize your training zones.', icon: 'fitness_center', available: true },
  { slug: 'tdee', name: 'TDEE Calculator', description: 'Work out how many calories you burn on an average day.', icon: 'local_fire_department', available: true },
  { slug: 'bmi', name: 'BMI Calculator', description: 'A rough population-level screen for body composition.', icon: 'scale', available: false },
  { slug: 'macros', name: 'Macro Split Calculator', description: 'Divide your calorie target into protein, carbs, and fat.', icon: 'pie_chart', available: false },
  { slug: 'bodyfat', name: 'Body Fat % Estimator', description: 'Estimate body fat from tape measurements.', icon: 'accessibility_new', available: false },
]
