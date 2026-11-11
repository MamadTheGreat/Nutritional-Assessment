# Code structure graph

This graph summarizes first-party modules under `src/` at the route and feature level. It excludes dependencies, generated route metadata, build output, environment files, and low-level UI primitives. The TanStack route hierarchy is shown conceptually; `routeTree.gen.ts` is not expanded.

Solid arrows indicate module imports, calls, or framework route relationships. Grouped nodes collapse related components and API handlers for readability.

```mermaid
flowchart LR
  subgraph Routes["Application routes"]
    Router["router.jsx"]
    RouteTree["TanStack route hierarchy"]
    Root["routes/__root.jsx"]
    Login["routes/login.jsx"]
    AuthLayout["routes/_authed.jsx"]
    AssessmentPage["routes/_authed/index.jsx"]
    PatientsPage["routes/_authed/patients.jsx"]
    PatientDetail["routes/_authed/patients_.$patientId.jsx"]
    LibraryPage["routes/_authed/library.jsx"]
    IcuPage["routes/_authed/icu.jsx"]

    Router -->|"configures"| RouteTree
    RouteTree -->|"root layout"| Root
    RouteTree -->|"login route"| Login
    RouteTree -->|"protected route group"| AuthLayout
    AuthLayout -->|"child routes"| AssessmentPage
    AuthLayout -->|"child routes"| PatientsPage
    AuthLayout -->|"child routes"| PatientDetail
    AuthLayout -->|"child routes"| LibraryPage
    AuthLayout -->|"child routes"| IcuPage
  end

  subgraph Features["Feature components"]
    LoginUI["LoginPage"]
    AssessmentUI["Assessment form, result, and intake/lab imports"]
    PatientUI["Patient review and follow-up components"]
    LibraryUI["Library and source dialogs"]
    NavShell["NavShell"]
    AuthGate["AuthGate"]
  end

  subgraph Shared["Shared application modules"]
    AuthContext["AuthContext"]
    GoogleAuth["googleAuth.js"]
    ServerFns["server-fns.js"]
    Clinical["clinical.js"]
    ReviewDates["reviewDates.js"]
    Defaults["clinicalDefaults.js and knowledgeBase.js"]
    DriveStore["driveStore.js"]
    IntakeFields["intakeFields.js"]
  end

  subgraph AI["AI request path"]
    AiRoutes["API routes: intake, labs, plan"]
    GoogleHandler["googleAi.server.js"]
    Gemini["Google Gemini API"]
  end

  Drive["Google Drive: nutrition-assessment.json"]

  Root -->|"provides"| AuthContext
  Login -->|"renders"| LoginUI
  LoginUI -->|"Google sign-in"| GoogleAuth
  AuthLayout -->|"checks session"| AuthGate
  AuthLayout -->|"renders"| NavShell
  AuthLayout -->|"loads due reviews"| ServerFns
  AuthLayout -->|"renders"| PatientUI
  AuthGate -->|"checks Google session"| GoogleAuth
  AuthContext -->|"subscribes to session"| GoogleAuth
  GoogleAuth -->|"sets Drive token"| DriveStore
  PatientUI --> ReviewDates
  LibraryUI --> Defaults

  AssessmentPage -->|"renders"| AssessmentUI
  AssessmentPage -->|"loads and saves assessments"| ServerFns
  AssessmentPage -->|"uses calculations"| Clinical
  AssessmentPage -->|"renders due reviews"| PatientUI
  AssessmentUI -->|"extracts intake and labs"| ServerFns
  AssessmentUI -->|"uses calculations"| Clinical
  AssessmentUI --> IntakeFields
  PatientsPage -->|"renders"| PatientUI
  PatientsPage -->|"loads patients and reviews"| ServerFns
  PatientDetail -->|"renders assessment result"| AssessmentUI
  PatientDetail -->|"loads patient data"| ServerFns
  LibraryPage -->|"renders"| LibraryUI
  LibraryPage -->|"manages library data"| ServerFns
  IcuPage -->|"loads formulas and patients"| ServerFns
  IcuPage -->|"calculates gavage plan"| Clinical

  ServerFns -->|"patient and library data"| DriveStore
  ServerFns -->|"session token"| GoogleAuth
  ServerFns -->|"deterministic calculations"| Clinical
  ServerFns -->|"defaults and review dates"| Defaults
  ServerFns --> ReviewDates
  ReviewDates --> Defaults
  DriveStore -->|"reads and writes private JSON"| Drive
  ServerFns -->|"POST /api/ai/*"| AiRoutes
  AiRoutes -->|"shared request handler"| GoogleHandler
  GoogleHandler --> IntakeFields
  GoogleHandler --> Gemini
```
