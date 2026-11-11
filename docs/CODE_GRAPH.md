# Code structure graph

This graph summarizes first-party modules under `src/` at the route and feature level. It excludes dependencies, generated route metadata, build output, environment files, and low-level UI primitives. The TanStack route hierarchy is shown conceptually; `routeTree.gen.ts` is not expanded.

Solid arrows indicate module imports, calls, or framework route relationships. Grouped nodes collapse related components and API handlers for readability.

```mermaid
flowchart LR
  subgraph Routes["Application routes"]
    Router["router.jsx"]
    RouteTree["TanStack route hierarchy"]
    Root["routes/__root.jsx"]
    LoginRedirect["routes/login.jsx (redirects to /)"]
    MainLayout["routes/_authed.jsx (Layout Shell)"]
    AssessmentPage["routes/_authed/index.jsx"]
    PatientsPage["routes/_authed/patients.jsx"]
    PatientDetail["routes/_authed/patients_.$patientId.jsx"]
    LibraryPage["routes/_authed/library.jsx"]
    IcuPage["routes/_authed/icu.jsx"]

    Router -->|"configures"| RouteTree
    RouteTree -->|"root layout"| Root
    RouteTree -->|"redirect route"| LoginRedirect
    RouteTree -->|"main layout shell"| MainLayout
    MainLayout -->|"child routes"| AssessmentPage
    MainLayout -->|"child routes"| PatientsPage
    MainLayout -->|"child routes"| PatientDetail
    MainLayout -->|"child routes"| LibraryPage
    MainLayout -->|"child routes"| IcuPage
  end

  subgraph Features["Feature components"]
    AssessmentUI["Assessment form, result, and intake/lab imports"]
    PatientUI["Patient review and follow-up components"]
    LibraryUI["Library and source dialogs"]
    NavShell["NavShell (navigation and backup controls)"]
    BackupDialog["BackupDialog (export/import JSON files)"]
  end

  subgraph Shared["Shared application modules"]
    ServerFns["server-fns.js"]
    Clinical["clinical.js"]
    ReviewDates["reviewDates.js"]
    Defaults["clinicalDefaults.js and knowledgeBase.js"]
    LocalStore["driveStore.js (IndexedDB + localStorage)"]
    IntakeFields["intakeFields.js"]
  end

  subgraph AI["AI request path"]
    AiRoutes["API routes: labs, plan"]
    GoogleHandler["googleAi.server.js"]
    Gemini["Google Gemini API"]
  end

  DeviceStorage["Device Storage: IndexedDB & JSON backup files"]

  MainLayout -->|"renders"| NavShell
  MainLayout -->|"loads due reviews"| ServerFns
  MainLayout -->|"renders"| PatientUI
  NavShell -->|"embeds"| BackupDialog
  BackupDialog -->|"exports and imports"| LocalStore
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

  ServerFns -->|"patient and library data"| LocalStore
  ServerFns -->|"deterministic calculations"| Clinical
  ServerFns -->|"defaults and review dates"| Defaults
  ServerFns --> ReviewDates
  ReviewDates --> Defaults
  LocalStore -->|"persists on device"| DeviceStorage
  ServerFns -->|"POST /api/ai/*"| AiRoutes
  AiRoutes -->|"shared request handler"| GoogleHandler
  GoogleHandler --> IntakeFields
  GoogleHandler --> Gemini
```
