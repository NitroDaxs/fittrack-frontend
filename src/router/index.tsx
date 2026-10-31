import { Navigate, Route, Routes } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import RequireRole from './RequireRole'

import Home from '../pages/Home'
import ExerciseLibrary from '../pages/ExerciseLibrary'
import ExerciseDetail from '../pages/ExerciseDetail'
import RoutinesCatalog from '../pages/RoutinesCatalog'
import RoutineDetail from '../pages/RoutineDetail'
import ArticlesListing from '../pages/ArticlesListing'
import ArticleDetail from '../pages/ArticleDetail'
import CalculatorsHub from '../pages/CalculatorsHub'
import OneRepMaxCalculator from '../pages/OneRepMaxCalculator'
import TdeeCalculator from '../pages/TdeeCalculator'
import BmiCalculator from '../pages/BmiCalculator'
import MacroCalculator from '../pages/MacroCalculator'
import BodyFatCalculator from '../pages/BodyFatCalculator'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import StaticPage from '../pages/StaticPage'
import NotFound from '../pages/NotFound'

import Dashboard from '../pages/Dashboard'
import WorkoutBuilder from '../pages/WorkoutBuilder'
import ActiveWorkout from '../pages/ActiveWorkout'
import WorkoutHistory from '../pages/WorkoutHistory'
import BodyMeasurements from '../pages/BodyMeasurements'
import ProfileSettings from '../pages/ProfileSettings'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminExercises from '../pages/admin/AdminExercises'
import AdminRoutines from '../pages/admin/AdminRoutines'
import AdminArticles from '../pages/admin/AdminArticles'
import AdminUsers from '../pages/admin/AdminUsers'

export default function App() {
  return (
    <Routes>
      {/* Public + member screens share the marketing chrome */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />

        <Route path="library" element={<ExerciseLibrary />} />
        <Route path="library/:slug" element={<ExerciseDetail />} />
        <Route path="routines" element={<RoutinesCatalog />} />
        <Route path="routines/:slug" element={<RoutineDetail />} />
        <Route path="articles" element={<ArticlesListing />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
        <Route path="calculators" element={<CalculatorsHub />} />
        <Route path="calculators/1rm" element={<OneRepMaxCalculator />} />
        <Route path="calculators/tdee" element={<TdeeCalculator />} />
        <Route path="calculators/bmi" element={<BmiCalculator />} />
        <Route path="calculators/macros" element={<MacroCalculator />} />
        <Route path="calculators/bodyfat" element={<BodyFatCalculator />} />

        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route path="about" element={<StaticPage />} />
        <Route path="contact" element={<StaticPage />} />
        <Route path="legal" element={<StaticPage />} />
        <Route path="privacy" element={<StaticPage />} />

        {/* The builder is open to guests; everything that reads personal data needs a session. */}
        <Route path="builder" element={<WorkoutBuilder />} />
        <Route path="workout/active" element={<ActiveWorkout />} />

        <Route
          path="dashboard"
          element={
            <RequireRole role="member">
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="history"
          element={
            <RequireRole role="member">
              <WorkoutHistory />
            </RequireRole>
          }
        />
        <Route
          path="measurements"
          element={
            <RequireRole role="member">
              <BodyMeasurements />
            </RequireRole>
          }
        />
        <Route
          path="profile"
          element={
            <RequireRole role="member">
              <ProfileSettings />
            </RequireRole>
          }
        />
      </Route>

      {/* Admin console has its own shell */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="exercises" element={<AdminExercises />} />
        <Route path="routines" element={<AdminRoutines />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="/exercises" element={<Navigate to="/library" replace />} />
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
