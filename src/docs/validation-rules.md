**ZOD**
Use RHF over native implementation:
- both working together is the golden standard currently and will be a good learning experience
Where validation messages come from:
- using Zod build in messages becouse it has en/bg support if something is not per my liking there might be custom ones from me
Which side owns the rule
- the frontend will own the rules which the backend will need to comply and apply
How do server errors and schema errors meet?
- if the server returns an error it should be shown in a toast, it would be in english for now
Validate forms only, or API responses too
- there should be not alot of changes to the api responsese so validating forms only will be good for now

---

## How it's built

- **Schemas** live in `src/schemas/`, one file per form, named for what they describe
  (`changePasswordSchema` in `change-password.schema.ts`). Each file exports its
  inferred types next to the schema (`ChangePasswordValues`, plus `…Input` when the
  form holds strings that become numbers). Form value types are never written by
  hand: `UserForm`, `ArticleForm`, `ExerciseForm`, `RoutineForm` and the calculator
  request types in `src/types/` are aliases of the inferred ones.
- **Shared rules** are in `src/schemas/shared.ts`: `email`, `newPassword`,
  `requiredText`, `optionalHttpUrl`, `requiredNumber` / `optionalNumber` (inputs hold
  strings) and the `between` / `wholeBetween` ranges.
- **Schemas stay pure**: no React, no API calls. The only import beyond Zod is
  i18next, for our own messages, which are looked up when a value is validated so
  they follow the language. Zod's language setting is synced in `src/i18n/index.ts`.
- **Messages** say how to fix the value ("Enter a number from 1 to 300."), not only
  what's wrong. Zod's built-in (en/bg) messages are the fallback for anything we
  haven't worded ourselves.
- **Rhythm**: every form uses `mode: 'onTouched'` (with the default
  `reValidateMode: 'onChange'`): a field is checked when you leave it or submit,
  and once it shows an error it is re-checked as you type. After a failed submit,
  focus moves to the first invalid field (RHF's `shouldFocusError`, on by default;
  button groups pass `field.ref` to their first button). Errors are linked to their
  field with `aria-describedby`.
- **Submit buttons** are only disabled while a request is running, when their label
  says so ("Saving…"). They are never the only sign that something is wrong.
- **Server errors** are shown as a toast by the shared `MutationCache` in
  `src/services/queryClient.ts` (or the page's own `catch` for login, signup and
  password reset). An expired reset link gets its own screen.
- **Not over-validated**: names have no minimum length or pattern, and emails get
  Zod's email check only.

## Rules and where the API enforces them

Every rule in a schema must also exist in C#. Client checks are for fast feedback;
anyone can call the API directly. DTOs are in `FitTrack.Application/Dtos`,
services in `FitTrack.Application/Services`.

| Form / schema | Rule | API |
| --- | --- | --- |
| **All new passwords**: `newPassword` (signup, reset, change) | 8+ characters, a number, an uppercase letter | `PasswordRules` (`Common/PasswordRules.cs`) on `RegisterRequest`, `ResetPasswordRequest`, `ChangePasswordRequest`, `AdminUserRequest` |
| Password confirmation (signup, reset, change) | Matches the new password | `[Compare]` on reset and change; signup doesn't send it (client-only typo check) |
| `loginSchema` | Email; password not blank (no rule check, so older passwords still log in) | `LoginRequest` |
| `signupSchema` | Name required, ≤ 255; email ≤ 255 | `RegisterRequest` |
| `forgotPasswordSchema` | Email | `ForgotPasswordRequest` |
| `changePasswordSchema` | Current password required; new differs from current | `ChangePasswordRequest`; `ProfileService.ChangePasswordAsync` |
| `editProfileSchema` | Name required, ≤ 255; email ≤ 255; current password when the email changes | `UpdateProfileRequest`; `ProfileService.UpdateAsync` / `ChangeEmailAsync` |
| `measurementSchema` | Weight required, 0.1–999 lbs (453 kg); body fat 0–70; lengths 0.1–500 | `LogMeasurementRequest`, `CustomMeasurementsDto` |
| `adminUserSchema` | Name required, ≤ 255; email ≤ 255; role and status from the list | `AdminUserRequest`; `AdminUserService` (create and update) |
| `adminArticleSchema` | Title required, ≤ 255; body required when new; http(s) image URL ≤ 2048 | `ArticleRequest`; `AdminArticleService` |
| `adminExerciseSchema` | Name required, ≤ 255; description required; ≥ 1 muscle group; http(s) video and thumbnail URLs | `ExerciseRequest`; `AdminExerciseService` |
| `adminRoutineSchema` | Title required, ≤ 255; description required; 1–7 days a week; http(s) image URL; each day named ≤ 255 with ≥ 1 exercise, 1–20 sets, reps ≤ 20 characters, 0–900 s rest | `RoutineRequest`, `RoutineDayRequest`, `RoutineDayExerciseRequest`; `AdminRoutineService` |
| `oneRepMaxSchema` | Weight 0.1–5000; reps 1–20 (whole) | `OneRepMaxRequest` |
| `bmiSchema` | Weight 0.1–2000; height required (cm 1–300, or ft 0–10 + in 0–11.99) | `BmiRequest`; `CalculatorService.HeightInCm` |
| `tdeeSchema` | As BMI, plus age 1–120 (whole) and an activity level | `TdeeRequest` |
| `macroSchema` | Calories 1–20000 (whole); a split | `MacroRequest` |
| `bodyFatSchema` | Height; neck and waist 0.1–500; hip required for women; waist larger than neck | `BodyFatRequest`; `CalculatorService.BodyFat` |
| `chatMessageSchema` | Not blank, ≤ 1000 characters | `ChatRequest` |

The API's email check (`[EmailAddress]`) is looser than Zod's. That's fine: the
frontend is the stricter side, so everything it lets through, the API accepts.
When a rule changes, change it in both places and in this table.

