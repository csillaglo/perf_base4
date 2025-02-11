export const hu = {
  common: {
    welcome: 'Üdvözöljük',
    welcomeBack: 'Üdvözöljük újra, {{name}}',
    name: 'Név',
    actions: 'Műveletek',
    noNameSet: 'Nincs név beállítva',
    dashboard: 'Vezérlőpult',
    sending: 'Küldés...',
    login: 'Bejelentkezés',
    logout: 'Kijelentkezés',
    email: 'Email',
    password: 'Jelszó',
    submit: 'Küldés',
    cancel: 'Mégse',
    save: 'Mentés',
    delete: 'Törlés',
    edit: 'Szerkesztés',
    create: 'Létrehozás',
    search: 'Keresés',
    loading: 'Betöltés...',
    error: 'Hiba',
    success: 'Sikeres',
    saving: 'Mentés...',
    saveChanges: 'Változtatások mentése',
    na: 'N/A',
  },
  auth: {
    signIn: 'Bejelentkezés',
    signInTo: 'Bejelentkezés a PerformancePro-ba',
    passwordsDontMatch: 'A jelszavak nem egyeznek',
    newPassword: 'Új jelszó',
    confirmNewPassword: 'Új jelszó megerősítése',
    setNewPassword: 'Új jelszó beállítása',
    setNewPasswordInstructions: 'Kérjük, adja meg az új jelszavát.',
    resetting: 'Visszaállítás...',
    resetSuccess: 'A jelszó sikeresen visszaállítva',
    resetFailed: 'Nem sikerült visszaállítani a jelszót',
    backToLogin: 'Vissza a bejelentkezéshez',
    signingIn: 'Bejelentkezés...',
    signUp: 'Regisztráció',
    createAccount: 'Fiók létrehozása',
    creatingAccount: 'Fiók létrehozása...',
    forgotPassword: 'Elfelejtett jelszó?',
    resetPassword: 'Jelszó visszaállítása',
    resetPasswordInstructions: 'Adja meg az email címét és küldünk utasításokat a jelszó visszaállításához.',
    sendResetInstructions: 'Visszaállítási utasítások küldése',
    resetInstructionsSent: 'A jelszó visszaállítási utasításokat elküldtük az email címére',
    resetInstructionsFailed: 'Nem sikerült elküldeni a visszaállítási utasításokat',
    noAccount: 'Nincs még fiókja?',
    hasAccount: 'Már van fiókja?',
    emailAddress: 'Email cím',
    passwordRequirement: 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
  },
  goals: {
    title: 'Célok',
    pageTitle: 'Célok és Értékelések',
    weight: 'Súly',
    allocatedWeight: 'Kiosztott célok súlya',
    allocableWeight: 'Kiosztható célok súlya',
    totalWeight: 'Összsúly',
    weightWarning: 'A célok összsúlyának pontosan 100%-nak kell lennie',
    noDueDate: 'Nincs határidő',
    noGoals: 'Nincsenek célok',
    dueInDays: '{{days}} nap múlva esedékes',
    dueToday: 'Ma esedékes',
    overdueDays: '{{days}} napja lejárt',
    evaluation: {
      score: 'Pontszám',
      summary: 'Összefoglaló értékelés',
      overallEvaluation: 'Átfogó értékelés',
      furtherSuggestions: 'További javaslatok',
      noEvaluationProvided: 'Még nem érkezett értékelés.',
      noSuggestionsProvided: 'Még nem érkezett javaslat.',
      deleteConfirmation: 'Biztosan törölni szeretné ezt a célt? Ez a művelet nem vonható vissza.',
      scoreFormat: 'Pontszám: {{score}}/5',
      impact: {
        title: 'Célok és hatásuk',
        subtitle: 'A célok fontosság szerint súlyozva és 1-5 skálán értékelve',
        impact: 'Hatás',
        noGoals: 'Nincsenek célok'
      },
      radar: {
        title: 'Célteljesítmény eloszlás',
        weight: 'Súly',
        noGoals: 'Nincsenek célok',
        dragAndDrop: 'Húzza és ejtse a célokat a vezetőkhöz rendeléshez'
      },
      performance: {
        title: 'Teljesítmény pontszám',
        score: 'Pontszám',
        ownOverview: 'Saját teljesítmény áttekintése',
        subtitle: 'A célok súlyozott átlaga alapján',
        outOf: '/',
        gradeLevel: 'Értékelési szint',
        currentLevel: 'Jelenlegi szint',
        scoreRange: 'Pontszám tartomány',
        grade: 'Értékelés',
        level: 'Szint',
        grades: {
          unsatisfactory: 'Nem megfelelő',
          weak: 'Gyenge',
          normal: 'Átlagos',
          good: 'Jó',
          excellent: 'Kiváló'
        }
      },
      metrics: {
        title: 'Teljesítmény mutatók',
        totalGoals: 'Összes cél',
        completedGoals: 'Teljesített célok',
        inProgressGoals: 'Folyamatban lévő célok',
        overdueGoals: 'Lejárt célok',
        noGoals: 'Nincsenek célok',
        description: 'Célok teljesítési státuszának áttekintése'
      },
      status: {
        pending: 'Függőben',
        in_progress: 'Folyamatban',
        completed: 'Teljesítve'
      },
      manager: {
        title: 'Csapat teljesítmény áttekintés',
        teamMembers: 'Összes csapattag',
        pendingEvaluations: 'Függőben lévő értékelések',
        completedEvaluations: 'Befejezett értékelések',
        averageScore: 'Átlagos pontszám',
        gradeDistribution: 'Értékelés eloszlás',
        employee: 'munkatárs',
        employees: 'munkatárs',
        topPerformers: 'Legjobb teljesítők',
        needsImprovement: 'Fejlesztendő területek',
        score: 'Pontszám',
        noData: 'Nincs elérhető adat',
        loading: 'Vezetői áttekintés betöltése...'
      },
      report: {
        title: 'Teljesítmény jelentés',
        employeeInfo: 'Munkatárs adatai',
        filename: 'teljesitmeny_jelentes',
        employee: 'munkatars'
      }
    },
    form: {
      title: 'Cím',
      description: 'Leírás',
      status: 'Státusz',
      weight: 'Súlyozás (%)',
      evaluationScore: 'Értékelési pontszám (1-5)',
      evaluationNotes: 'Értékelési megjegyzések',
      dueDate: 'Határidő',
      evaluationCycle: 'Értékelési ciklus',
      selectCycle: 'Válasszon értékelési ciklust',
      onlyManagersCanModify: '(Csak vezetők és adminok módosíthatják)',
      onlyVisibleToManagers: '(Csak vezetők és adminok láthatják)',
      addEvaluationNotes: 'Adjon hozzá értékelési megjegyzéseket...',
      cancel: 'Mégse',
      deleteGoal: 'Cél törlése',
      update: 'Cél frissítése',
      create: 'Cél létrehozása'
    },
    status: {
      pending: 'Függőben',
      inProgress: 'Folyamatban',
      in_progress: 'Folyamatban',
      completed: 'Teljesítve'
    }
  },
  admin: {
    systemOverview: 'Rendszer áttekintés',
    title: 'Adminisztráció',
    evaluation: {
      loading: 'Beosztottak betöltése...',
      noTeamMembers: 'Nincsenek értékelhető csapattagok',
      status: 'Értékelés állapota',
      subordinates: 'Beosztottak értékelése',
      statuses: {
        awaitingGoalSetting: 'Célok beállítására vár',
        awaitingEvaluation: 'Értékelésre vár',
        awaitingApproval: 'Jóváhagyásra vár',
        finalized: 'Lezárva'
      },
      detail: {
        loading: 'Értékelési részletek betöltése...',
        userNotFound: 'Felhasználó nem található',
        backToTeam: 'Vissza a csapattagokhoz',
        currentPhase: 'Az értékelési folyamat jelenlegi fázisa',
        currentStatus: 'Jelenlegi állapot',
        deleteConfirmation: 'Biztosan törölni szeretné ezt a célt? Ez a művelet nem vonható vissza.',
        statusDescriptions: {
          awaitingGoalSetting: 'A munkatársnak be kell állítania a céljait',
          awaitingEvaluation: 'A célok készen állnak az értékelésre',
          awaitingApproval: 'Az értékelés vezetői jóváhagyásra vár',
          finalized: 'Az értékelési folyamat lezárult'
        }
      }
    },
    users: {
      title: 'Felhasználók',
      total: 'Összes felhasználó',
      active: 'Aktív felhasználók',
      inactive: 'Inaktív felhasználók',
      status: 'Státusz',
      activePercentage: '{{percentage}}% aktív',
      invite: 'Felhasználó meghívása',
      edit: 'Felhasználó szerkesztése',
      delete: 'Felhasználó törlése',
      management: 'Felhasználók kezelése',
      listView: 'Lista nézet',
      orgChart: 'Szervezeti ábra',
      invitationSent: 'Meghívó elküldve: {{email}}!',
      invitationFailed: 'Nem sikerült elküldeni a meghívót',
      deleteSuccess: 'Felhasználó sikeresen törölve!',
      updateSuccess: 'Profil sikeresen frissítve!',
      filters: {
        title: 'Szűrők',
        organization: 'Szervezet',
        allOrganizations: 'Minden szervezet',
        role: 'Szerepkör',
        allRoles: 'Minden szerepkör',
        manager: 'Vezető',
        allManagers: 'Minden vezető',
        clearFilters: 'Szűrők törlése'
      },
      table: {
        user: 'Felhasználó',
        organization: 'Szervezet',
        role: 'Szerepkör',
        manager: 'Vezető',
        status: 'Státusz',
        actions: 'Műveletek',
        noOrg: 'Nincs szervezet',
        noManager: 'Nincs vezető',
        unnamed: 'Névtelen munkatárs'
      }
    },
    roles: {
      employee: 'Munkatárs',
      manager: 'Vezető',
      hrAdmin: 'HR Admin',
      companyAdmin: 'Cég Admin',
      superadmin: 'Szuperadmin'
    },
    organizations: {
      title: 'Szervezetek',
      withoutAdmin: '{{count}} admin nélkül',
      new: 'Új szervezet',
      edit: 'Szervezet szerkesztése',
      delete: 'Szervezet törlése',
      noOrganization: 'Nincs szervezet',
      createSuccess: 'Szervezet sikeresen létrehozva!',
      deleteSuccess: 'Szervezet sikeresen törölve!',
      adminAddSuccess: 'Admin sikeresen hozzáadva!'
    },
    welcomeMessage: {
      title: 'Üdvözlő üzenet',
      edit: 'Üzenet szerkesztése',
      noMessage: 'Nincs beállítva üdvözlő üzenet. Kattintson az "Üzenet szerkesztése" gombra egy hozzáadásához.',
      updateSuccess: 'Üdvözlő üzenet sikeresen frissítve!'
    },
    cycles: {
      title: 'Értékelési ciklusok',
      table: {
        name: 'Név',
        startDate: 'Kezdő dátum',
        endDate: 'Záró dátum',
        status: 'Státusz',
        actions: 'Műveletek'
      },
      new: 'Új ciklus',
      edit: 'Ciklus szerkesztése',
      delete: 'Ciklus törlése',
      createSuccess: 'Értékelési ciklus sikeresen létrehozva!',
      deleteSuccess: 'Értékelési ciklus sikeresen törölve!',
      statusUpdateSuccess: '{{name}} ciklus sikeresen {{status}}',
      activated: 'aktiválva',
      deactivated: 'deaktiválva'
    },
    download: {
      title: 'Eredmények letöltése',
      button: 'Excel jelentés letöltése',
      selectCycle: 'Értékelési ciklus kiválasztása',
      selectEmployee: 'Munkatárs kiválasztása',
      allEmployees: 'Minden munkatárs'
    }
  },
  profile: {
    title: 'Profil',
    personalInfo: 'Személyes adatok',
    fullName: 'Teljes név',
    fullNamePlaceholder: 'Kovács János',
    department: 'Részleg',
    departmentPlaceholder: 'pl. Fejlesztés',
    jobLevel: 'Beosztási szint',
    jobLevelPlaceholder: 'pl. Senior',
    jobName: 'Munkakör',
    jobNamePlaceholder: 'pl. Szoftverfejlesztő',
    position: 'Pozíció',
    role: 'Szerepkör',
    theme: 'Téma',
    lightMode: 'Világos mód',
    darkMode: 'Sötét mód'
  }
};
