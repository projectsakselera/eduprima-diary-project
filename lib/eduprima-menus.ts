// 📁 lib/eduprima-menus.ts

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
  external?: boolean;
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
  external?: boolean;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
  external?: boolean;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getEduprimaMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "eduprima-dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/eduprima/dashboard",
          label: t("dashboard"),
          active: pathname.includes("/eduprima/dashboard"),
          icon: "heroicons-outline:academic-cap",
          submenus: [
            {
              href: "/eduprima/dashboard/overview",
              label: t("overview"),
              active: pathname === "/eduprima/dashboard/overview",
              icon: "heroicons:chart-bar",
              children: [],
            },
            {
              href: "/eduprima/dashboard/academic",
              label: t("academic"),
              active: pathname === "/eduprima/dashboard/academic",
              icon: "heroicons:academic-cap",
              children: [],
            },
            {
              href: "/eduprima/dashboard/financial",
              label: t("financial"),
              active: pathname === "/eduprima/dashboard/financial",
              icon: "heroicons:currency-dollar",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("academic"),
      id: "academic",
      menus: [
        {
          id: "students",
          href: "/eduprima/students",
          label: t("students"),
          active: pathname.includes("/eduprima/students"),
          icon: "heroicons-outline:user-group",
          submenus: [
            {
              href: "/eduprima/students/list",
              label: t("studentList"),
              active: pathname === "/eduprima/students/list",
              icon: "heroicons:list-bullet",
              children: [],
            },
            {
              href: "/eduprima/students/add",
              label: t("addStudent"),
              active: pathname === "/eduprima/students/add",
              icon: "heroicons:plus",
              children: [],
            },
            {
              href: "/eduprima/students/attendance",
              label: t("attendance"),
              active: pathname === "/eduprima/students/attendance",
              icon: "heroicons:calendar",
              children: [],
            },
            {
              href: "/eduprima/students/grades",
              label: t("grades"),
              active: pathname === "/eduprima/students/grades",
              icon: "heroicons:academic-cap",
              children: [],
            },
            {
              href: "/eduprima/students/matchmaking",
              label: "Matchmaking",
              active: pathname === "/eduprima/students/matchmaking",
              icon: "heroicons:heart",
              children: [],
            },
          ],
        },
        {
          id: "teachers",
          href: "/eduprima/teachers",
          label: t("teachers"),
          active: pathname.includes("/eduprima/teachers"),
          icon: "heroicons-outline:academic-cap",
          submenus: [
            {
              href: "/eduprima/teachers/list",
              label: t("teacherList"),
              active: pathname === "/eduprima/teachers/list",
              icon: "heroicons:list-bullet",
              children: [],
            },
            {
              href: "/eduprima/teachers/add",
              label: t("addTeacher"),
              active: pathname === "/eduprima/teachers/add",
              icon: "heroicons:plus",
              children: [],
            },
            {
              href: "/eduprima/teachers/schedule",
              label: t("schedule"),
              active: pathname === "/eduprima/teachers/schedule",
              icon: "heroicons:calendar",
              children: [],
            },
            {
              href: "/eduprima/teachers/availability",
              label: "Availability",
              active: pathname === "/eduprima/teachers/availability",
              icon: "heroicons:clock",
              children: [],
            },
          ],
        },
        {
          id: "classes",
          href: "/eduprima/classes",
          label: t("classes"),
          active: pathname.includes("/eduprima/classes"),
          icon: "heroicons-outline:building-office",
          submenus: [
            {
              href: "/eduprima/classes/list",
              label: t("classList"),
              active: pathname === "/eduprima/classes/list",
              icon: "heroicons:list-bullet",
              children: [],
            },
            {
              href: "/eduprima/classes/add",
              label: t("addClass"),
              active: pathname === "/eduprima/classes/add",
              icon: "heroicons:plus",
              children: [],
            },
            {
              href: "/eduprima/classes/schedule",
              label: t("classSchedule"),
              active: pathname === "/eduprima/classes/schedule",
              icon: "heroicons:calendar",
              children: [],
            },
            {
              href: "/eduprima/classes/assignments",
              label: "Assignments",
              active: pathname === "/eduprima/classes/assignments",
              icon: "heroicons:document-text",
              children: [],
            },
          ],
        },
        {
          id: "subjects",
          href: "/eduprima/subjects",
          label: t("subjects"),
          active: pathname.includes("/eduprima/subjects"),
          icon: "heroicons-outline:book-open",
          submenus: [
            {
              href: "/eduprima/subjects/list",
              label: t("subjectList"),
              active: pathname === "/eduprima/subjects/list",
              icon: "heroicons:list-bullet",
              children: [],
            },
            {
              href: "/eduprima/subjects/add",
              label: t("addSubject"),
              active: pathname === "/eduprima/subjects/add",
              icon: "heroicons:plus",
              children: [],
            },
            {
              href: "/eduprima/subjects/curriculum",
              label: t("curriculum"),
              active: pathname === "/eduprima/subjects/curriculum",
              icon: "heroicons:document-text",
              children: [],
            },
            {
              href: "/eduprima/subjects/materials",
              label: "Learning Materials",
              active: pathname === "/eduprima/subjects/materials",
              icon: "heroicons:book-open",
              children: [],
            },
          ],
        },
        {
          id: "enrollment",
          href: "/eduprima/enrollment",
          label: "Enrollment Management",
          active: pathname.includes("/eduprima/enrollment"),
          icon: "heroicons-outline:clipboard-document-list",
          submenus: [
            {
              href: "/eduprima/enrollment/applications",
              label: "Applications",
              active: pathname === "/eduprima/enrollment/applications",
              icon: "heroicons:clipboard-document-list",
              children: [],
            },
            {
              href: "/eduprima/enrollment/approval",
              label: "Approval Process",
              active: pathname === "/eduprima/enrollment/approval",
              icon: "heroicons:check-circle",
              children: [],
            },
            {
              href: "/eduprima/enrollment/status",
              label: "Enrollment Status",
              active: pathname === "/eduprima/enrollment/status",
              icon: "heroicons:chart-bar",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("communication"),
      id: "communication",
      menus: [
        {
          id: "chat",
          href: "https://chat.google.com",
          label: t("chat"),
          active: false,
          icon: "heroicons-outline:chat",
          submenus: [],
          external: true,
        },
        {
          id: "kanban",
          href: "https://trello.com/b/Cq8xUPCg/tutoring-operations",
          label: t("kanban"),
          active: false,
          icon: "heroicons-outline:view-boards",
          submenus: [],
          external: true,
        },
        {
          id: "crm",
          href: "https://chat.qontak.com",
          label: t("crm"),
          active: false,
          icon: "heroicons-outline:share",
          submenus: [],
          external: true,
        },
        {
          id: "google-drive",
          href: "https://drive.google.com",
          label: t("googleDrive"),
          active: false,
          icon: "heroicons-outline:cloud",
          submenus: [],
          external: true,
        },
      ],
    },

    {
      groupLabel: t("settings"),
      id: "settings",
      menus: [
        {
          id: "system-settings",
          href: "/eduprima/settings",
          label: t("systemSettings"),
          active: pathname.includes("/eduprima/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [
            {
              href: "/eduprima/settings/general",
              label: t("generalSettings"),
              active: pathname === "/eduprima/settings/general",
              icon: "heroicons:cog",
              children: [],
            },
            {
              href: "/eduprima/settings/users",
              label: t("userManagement"),
              active: pathname === "/eduprima/settings/users",
              icon: "heroicons:users",
              children: [],
            },
            {
              href: "/eduprima/settings/roles",
              label: t("roleManagement"),
              active: pathname === "/eduprima/settings/roles",
              icon: "heroicons:shield-check",
              children: [],
            },
            {
              href: "/eduprima/settings/backup",
              label: t("backupRestore"),
              active: pathname === "/eduprima/settings/backup",
              icon: "heroicons:cloud-arrow-up",
              children: [],
            },
          ],
        },
      ],
    },
  ];
} 