// 📁 lib/dynamic-menu-factory.ts

export type DynamicMenuItem = {
  href: string;
  label: string;
  active: boolean;
  icon: string;
  children?: DynamicMenuItem[];
  external?: boolean;
};

export type DynamicMenuGroup = {
  groupLabel: string;
  currentPage: string;
  menus: DynamicMenuItem[];
  staticMenus?: DynamicMenuItem[];
};

export function getDynamicMenuByPath(pathname: string, t: any): DynamicMenuGroup {
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // Jika di halaman eduprima
  if (pathSegments[0] === 'eduprima') {
    return generateEduprimaMenu(pathSegments, pathname, t);
  }

  // Jika di halaman dashboard
  if (pathSegments[0] === 'dashboard') {
    return {
      groupLabel: t("dashboard"),
      currentPage: "Dashboard",
      menus: [
        {
          href: "/eduprima/dashboard",
          label: "Dashboard",
          active: pathname === "/eduprima/dashboard",
          icon: "heroicons:chart-bar",
          children: [
            {
              href: "/eduprima/dashboard/overview",
              label: t("overview"),
              active: pathname === "/eduprima/dashboard/overview",
              icon: "heroicons:chart-bar",
            },
            {
              href: "/eduprima/dashboard/academic",
              label: t("academic"),
              active: pathname === "/eduprima/dashboard/academic",
              icon: "heroicons:academic-cap",
            },
            {
              href: "/eduprima/dashboard/financial",
              label: t("financial"),
              active: pathname === "/eduprima/dashboard/financial",
              icon: "heroicons:currency-dollar",
            },
          ]
        }
      ],
      staticMenus: getStaticMenus(pathname, t)
    };
  }

  // Default fallback
  return {
    groupLabel: t("eduprima"),
    currentPage: "Eduprima",
    menus: [
      {
        href: "/eduprima/main",
        label: "Eduprima Main",
        active: pathname === "/eduprima/main",
        icon: "heroicons:home",
      }
    ]
  };
}

function generateEduprimaMenu(pathSegments: string[], pathname: string, t: any): DynamicMenuGroup {
  // Jika di halaman main
  if (pathSegments[1] === 'main') {
    // Jika di halaman main root
    if (pathSegments.length === 2) {
      return {
        groupLabel: "Eduprima",
        currentPage: "Eduprima Main",
        menus: [
          {
            href: "/eduprima/main",
            label: "Eduprima Main",
            active: true,
            icon: "heroicons:home",
            children: [
              {
                href: "/eduprima/main/ops",
                label: "Operasional (Ops)",
                active: false,
                icon: "heroicons:cog-6-tooth",
              },
              {
                href: "/eduprima/main/program",
                label: "Program",
                active: false,
                icon: "heroicons:academic-cap",
              },
              {
                href: "/eduprima/main/ba",
                label: "Business Affair",
                active: false,
                icon: "heroicons:building-office",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops
    if (pathSegments[2] === 'ops') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Operasional",
        menus: [
          {
            href: "/eduprima/main/ops",
            label: "Operasional",
            active: true,
            icon: "heroicons:cog-6-tooth",
            children: [
              {
                href: "/eduprima/main/ops/em",
                label: "Education Management (EM)",
                active: pathname.includes("/eduprima/main/ops/em"),
                icon: "heroicons:user-group",
              },
              {
                href: "/eduprima/main/ops/ec",
                label: "Education Consulting",
                active: pathname.includes("/eduprima/main/ops/ec"),
                icon: "heroicons:academic-cap",
              },
              {
                href: "/eduprima/main/ops/adm",
                label: "Admin",
                active: pathname.includes("/eduprima/main/ops/adm"),
                icon: "heroicons:shield-check",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman program
    if (pathSegments[2] === 'program') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Program",
        menus: [
          {
            href: "/eduprima/main/program",
            label: "Program",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: "/eduprima/main/program/courses",
                label: "Courses",
                active: pathname.includes("/eduprima/main/program/courses"),
                icon: "heroicons:book-open",
              },
              {
                href: "/eduprima/main/program/curriculum",
                label: "Curriculum",
                active: pathname.includes("/eduprima/main/program/curriculum"),
                icon: "heroicons:document-text",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman business affair
    if (pathSegments[2] === 'ba') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Business Affair",
        menus: [
          {
            href: "/eduprima/main/ba",
            label: "Business Affair",
            active: true,
            icon: "heroicons:building-office",
            children: [
              {
                href: "/eduprima/main/ba/partnership",
                label: "Partnership",
                active: pathname.includes("/eduprima/main/ba/partnership"),
                icon: "heroicons:handshake",
              },
              {
                href: "/eduprima/main/ba/marketing",
                label: "Marketing",
                active: pathname.includes("/eduprima/main/ba/marketing"),
                icon: "heroicons:megaphone",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/em (root EM page)
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments.length === 4) {
      return {
        groupLabel: "Eduprima",
        currentPage: "Education Management",
        menus: [
          {
            href: "/eduprima/main/ops/em",
            label: "Education Management (EM)",
            active: true,
            icon: "heroicons:user-group",
            children: [
              {
                href: "/eduprima/main/ops/em/matchmaking",
                label: "EM Matchmaking",
                active: false,
                icon: "heroicons:user-plus",
              },
              {
                href: "/eduprima/main/ops/em/cms",
                label: "EM Class Management (CMS)",
                active: false,
                icon: "heroicons:academic-cap",
              },
              {
                href: "/eduprima/main/ops/em/engagement",
                label: "EM Engagement",
                active: false,
                icon: "heroicons:heart",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/em/matchmaking
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'matchmaking') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Matchmaking",
        menus: [
          {
            href: "/eduprima/main/ops/em/matchmaking",
            label: "EM Matchmaking",
            active: true,
            icon: "heroicons:user-plus",
            children: [
              {
                href: "/eduprima/main/ops/em/matchmaking/data-followup",
                label: "Unit Penyiapan Data & Follow Up GT",
                active: pathname.includes("/eduprima/main/ops/em/matchmaking/data-followup"),
                icon: "heroicons:clipboard-document-list",
              },
              {
                href: "/eduprima/main/ops/em/matchmaking/offering",
                label: "Unit Offering",
                active: pathname.includes("/eduprima/main/ops/em/matchmaking/offering"),
                icon: "heroicons:presentation-chart-line",
              },
              {
                href: "/eduprima/main/ops/em/matchmaking/tutor-case",
                label: "Unit Ganti Tutor & Case Solving",
                active: pathname.includes("/eduprima/main/ops/em/matchmaking/tutor-case"),
                icon: "heroicons:user-group",
              },
              {
                href: "/eduprima/main/ops/em/matchmaking/komunikasi",
                label: "EM Komunikasi",
                active: pathname.includes("/eduprima/main/ops/em/matchmaking/komunikasi"),
                icon: "heroicons:chat-bubble-left-right",
              },
              {
                href: "/eduprima/main/ops/em/matchmaking/plp",
                label: "Unit Penyiapan PLP",
                active: pathname.includes("/eduprima/main/ops/em/matchmaking/plp"),
                icon: "heroicons:document-text",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/em/cms
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'cms') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Class Management (CMS)",
        menus: [
          {
            href: "/eduprima/main/ops/em/cms",
            label: "EM Class Management (CMS)",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: "/eduprima/main/ops/em/cms/monitoring-kelas",
                label: "Monitoring Kelas & Presensi Tutor",
                active: pathname.includes("/eduprima/main/ops/em/cms/monitoring-kelas"),
                icon: "heroicons:eye",
              },
              {
                href: "/eduprima/main/ops/em/cms/monitoring-ruang",
                label: "Monitoring Ruang Kelas Edufio x ILC",
                active: pathname.includes("/eduprima/main/ops/em/cms/monitoring-ruang"),
                icon: "heroicons:building-office",
              },
              {
                href: "/eduprima/main/ops/em/cms/monitoring-pembayaran",
                label: "Monitoring Pembayaran/Tagihan",
                active: pathname.includes("/eduprima/main/ops/em/cms/monitoring-pembayaran"),
                icon: "heroicons:currency-dollar",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/em/engagement
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'engagement') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Engagement",
        menus: [
          {
            href: "/eduprima/main/ops/em/engagement",
            label: "EM Engagement",
            active: true,
            icon: "heroicons:heart",
            children: [
              {
                href: "/eduprima/main/ops/em/engagement/recruitment",
                label: "Recruitment Unit",
                active: pathname.includes("/eduprima/main/ops/em/engagement/recruitment"),
                icon: "heroicons:user-plus",
              },
              {
                href: "/eduprima/main/ops/em/engagement/development",
                label: "Development Unit",
                active: pathname.includes("/eduprima/main/ops/em/engagement/development"),
                icon: "heroicons:academic-cap",
              },
              {
                href: "/eduprima/main/ops/em/engagement/relations",
                label: "Relations Unit",
                active: pathname.includes("/eduprima/main/ops/em/engagement/relations"),
                icon: "heroicons:handshake",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/ec
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'ec') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Education Consulting",
        menus: [
          {
            href: "/eduprima/main/ops/ec",
            label: "Education Consulting",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: "/eduprima/main/ops/ec/consultation",
                label: "Consultation",
                active: pathname.includes("/eduprima/main/ops/ec/consultation"),
                icon: "heroicons:chat-bubble-left-right",
              },
              {
                href: "/eduprima/main/ops/ec/training",
                label: "Training",
                active: pathname.includes("/eduprima/main/ops/ec/training"),
                icon: "heroicons:academic-cap",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
    
    // Jika di halaman ops/adm
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'adm') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Admin",
        menus: [
          {
            href: "/eduprima/main/ops/adm",
            label: "Admin",
            active: true,
            icon: "heroicons:shield-check",
            children: [
              {
                href: "/eduprima/main/ops/adm/users",
                label: "Users",
                active: pathname.includes("/eduprima/main/ops/adm/users"),
                icon: "heroicons:users",
              },
              {
                href: "/eduprima/main/ops/adm/permissions",
                label: "Permissions",
                active: pathname.includes("/eduprima/main/ops/adm/permissions"),
                icon: "heroicons:key",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t)
      };
    }
  }

  // Default fallback untuk eduprima
  return {
    groupLabel: t("eduprima"),
    currentPage: "Eduprima",
    menus: [
      {
        href: "/eduprima/main",
        label: "Eduprima Main",
        active: pathname === "/eduprima/main",
        icon: "heroicons:home",
      }
    ]
  };
}

function getStaticMenus(pathname: string, t: any): DynamicMenuItem[] {
  return [
    {
      href: "https://chat.google.com",
      label: t("chat"),
      active: false,
      icon: "heroicons-outline:chat",
      external: true,
    },
    {
      href: "https://trello.com/b/Cq8xUPCg/tutoring-operations",
      label: t("kanban"),
      active: false,
      icon: "heroicons-outline:view-boards",
      external: true,
    },
    {
      href: "https://chat.qontak.com",
      label: t("crm"),
      active: false,
      icon: "heroicons-outline:share",
      external: true,
    },
    {
      href: "https://drive.google.com",
      label: t("googleDrive"),
      active: false,
      icon: "heroicons-outline:cloud",
      external: true,
    },
    {
      href: "/eduprima/settings",
      label: t("systemSettings"),
      active: pathname.includes("/eduprima/settings"),
      icon: "heroicons-outline:cog-6-tooth",
    },
  ];
} 