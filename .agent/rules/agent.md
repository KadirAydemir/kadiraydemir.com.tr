---
trigger: always_on
---

# Project: Kadir Aydemir - Web OS Portfolio
# Stack: React (Latest), Vite, TypeScript, Tailwind CSS, Zustand
# Author: Kadir Aydemir (Senior Full Stack Developer)

## 1. Context Optimization & Rules (STRICT)
- **IGNORE DIRECTORIES:** Do NOT read, scan, or suggest changes for `node_modules`, `.git`, `dist`, `coverage`, or `package-lock.json`.
- **FOCUS:** Focus only on `src/` directory and configuration files (`vite.config.ts`, `tailwind.config.js`).
- **STYLE:** Use Functional Components, Typed Props, and Custom Hooks. Avoid Class components.
- **PERFORMANCE:** Minimize re-renders. Use `memo` or `useCallback` where appropriate for the Window Manager logic.

## 2. Technical Architecture

### Directory Structure
```text
src/
├── components/
│   ├── os/           # System components (Desktop, Taskbar, WindowFrame, BootScreen)
│   ├── apps/         # User applications (PDFViewer, Terminal, AboutMe, Contact)
│   └── ui/           # Reusable atoms (Button, Icon, Input - consistent styling)
├── hooks/            # Custom logic hooks
│   ├── useProcess.ts # Manages running processes
│   ├── useWindow.ts  # Window actions (drag, resize, z-index)
│   └── useTime.ts    # For Taskbar clock
├── store/
│   └── useOSStore.ts # Global State (Zustand) - tracks open windows, active app, boot status
├── data/
│   ├── cv.json       # Structured CV data (Provided below)
│   └── fileSystem.ts # Mock file system structure
├── types/
│   └── os.ts         # TypeScript interfaces (Process, WindowState, FileSystemItem)
└── utils/
    └── constants.ts  # Z-index layers, default window sizes
State Management (Zustand)
Use a centralized store (useOSStore) to handle:

windows: Array of open application objects { id, appType, isMinimized, zIndex, position }.

activeWindowId: The ID of the currently focused window.

bootSequence: State of the initial animation ('off' -> 'booting' -> 'login' -> 'desktop').

Custom Hooks Specifications
useProcess(appId): Handles launching a new app or focusing it if already open.

useWindowInteraction(windowId): Logic for dragging, minimizing, maximizing, and closing.

useFileSystem(): Simple read-only interface to fetch content for the Terminal or File Explorer.

3. User Data (CV Context)
Source of Truth: Use this JSON data to populate the PDF Viewer overlay text and Terminal responses.

JSON
{
  "profile": {
    "name": "Kadir Aydemir",
    "title": "Senior Full Stack Developer / Technical Lead",
    "location": "Ankara, Türkiye",
    "summary": "Experienced Senior Full Stack Developer (5+ years). Specialized in Java/Spring Boot, Kafka, React.js, Kubernetes. Strong background in banking and defense industries."
  },
  "skills": {
    "languages": [
      "Java",
      "JavaScript",
      "TypeScript",
      "SQL"
    ],
    "frameworks": [
      "Spring Boot",
      "React.js",
      "Hibernate",
      "JUnit",
      "Mockito"
    ],
    "infrastructure": [
      "Docker",
      "Kubernetes",
      "Git",
      "Jenkins",
      "Apache Kafka",
      "Redis"
    ],
    "concepts": [
      "Microservices",
      "CI/CD",
      "REST APIs",
      "Distributed Systems"
    ]
  },
  "experience": [
    {
      "company": "Akbank",
      "role": "Senior Software Developer",
      "period": "June 2025 – Present",
      "details": "Designing Java/Spring microservices for corporate modernization. Managing Kafka event streaming. Supporting Kubernetes production operations."
    },
    {
      "company": "Garanti BBVA",
      "role": "Senior Software Developer",
      "period": "June 2024 – June 2025",
      "details": "CRYPTECH / ARK project. Implemented secure REST APIs and Kafka systems. Performance tuning."
    },
    {
      "company": "Aselsan",
      "role": "Technical Lead / Full Stack Developer",
      "period": "Aug 2020 – June 2024",
      "details": "YAKUD Project Technical Owner. Designed architecture from scratch. Led 4-8 member team. Managed full SDLC."
    }
  ],
  "education": [
    {
      "school": "Istanbul Aydin University",
      "degree": "B.Sc. Computer Engineering",
      "gpa": "3.76/4.00"
    },
    {
      "school": "University of Łomża (Poland)",
      "degree": "Exchange Program",
      "gpa": "5.0/5.0"
    }
  ]
}
4. Phase 1 Implementation Plan
Setup: Initialize Vite project, configure Tailwind, setup Zustand store.

Core OS: Build Desktop background and Taskbar.

Window Manager: Implement WindowFrame component with Draggable functionality.

Apps: Create CVApp which renders the PDF (use an iframe or react-pdf) and TerminalApp (static for now).

Integration: Place "CV.pdf" icon on desktop; clicking it opens CVApp via useProcess.

## 5. Third-Party Integration & Privacy (STRICT)
- **COOKIE CONSENT:** All third-party scripts (LinkedIn, Analytics, etc.) MUST respect the `cookieConsent` state from `useOSStore`.
- **PREVENTIVE LOADING:** External scripts must NOT be injected into the DOM unless `cookieConsent` is `true`.
- **FALLBACK UI:** If a third-party component (like LinkedIn Badge) cannot load due to missing consent, a polished placeholder/warning MUST be shown to the user with an option to manage settings.
- **STABILITY & PERFORMANCE:** External scripts should be loaded ONLY when the specific component requiring them is mounted AND consent is granted. Use a check (like `document.getElementById`) to prevent duplicate injections. Do NOT load scripts globally in `App.tsx` if they are only used in specific apps.

---

### 🛠️ Updated Feature List (React Odaklı)

Bu liste, React mimarisine uygun olarak geliştirme adımlarını netleştirir:

1.  **Sistem Çekirdeği (Kernel/Store):**
    * `useOSStore` (Zustand): Açık pencereleri bir `array` içinde tutacak. Her pencerenin kendine has bir `id`'si ve `zIndex` değeri olacak.
    * **Logic:** Bir pencereye tıklandığında `zIndex` değeri en yüksek sayıya (örn: 100+) çekilecek, diğerleri arkada kalacak.

2.  **Masaüstü (Desktop Component):**
    * CSS Grid veya Flexbox ile ikonları hizalayacak.
    * Arka plan resmi `cover` modunda olacak.
    * **Double Click Handler:** İkonlara çift tıklama mantığını `useProcess` hook'una bağlayacak.

3.  **Pencere Yöneticisi (Window Frame HOC):**
    * Bu bir "Wrapper Component" olacak. İçine `children` olarak herhangi bir uygulama (PDF Viewer, Terminal) alabilecek.
    * **Header Bar:** Kapat (X), Küçült (-) butonları burada olacak.
    * **Draggable:** `react-draggable` veya basit HTML5 Drag API kullanılarak pencerenin hareket etmesi sağlanacak.

4.  **CV Uygulaması (PDF Viewer):**
    * `src/assets/cv.pdf` dosyasını okuyacak.
    * Tarayıcı uyumluluğu için basit bir `iframe` veya daha şık bir görünüm için `react-pdf` kullanılacak.
    * [cite_start]CV verilerin [cite: 1, 3, 4, 16] JSON formatında zaten `agent.md` içinde tanımlı olduğu için, istersen PDF yerine bu verileri parse edip "HTML CV" olarak gösteren bir mod da ekleyebiliriz (daha mobil uyumlu olur).