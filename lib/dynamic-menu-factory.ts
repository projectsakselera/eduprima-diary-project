export interface DynamicMenuItem {
  href: string;
  label: string;
  active: boolean;
  icon: string;
  children?: DynamicMenuItem[];
  external?: boolean;
}

export interface DynamicMenuGroup {
  groupLabel: string;
  currentPage: string;
  menus: DynamicMenuItem[];
  staticMenus?: DynamicMenuItem[];
}

// Helper function to add locale prefix to internal URLs
function addLocalePrefix(href: string, locale: string): string {
  if (href.startsWith('http') || href.startsWith('https')) {
    return href; // External links don't need locale prefix
  }
  // Don't add locale prefix since next-intl Link component handles it automatically
  return href;
}

export function getDynamicMenuByPath(pathname: string, t: any): DynamicMenuGroup {
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // Get locale from pathname
  const locale = pathSegments[0] || 'en';
  
  // Remove locale from path segments
  const segments = pathSegments.filter(segment => !['en', 'id', 'ar'].includes(segment));
  
  // Debug: log the path segments
  console.log('🔍 Dynamic Menu Debug:');
  console.log('  Pathname:', pathname);
  console.log('  Path segments:', segments);
  console.log('  Locale:', locale);
  
  // If we're in eduprima
  if (segments[0] === 'eduprima') {
    return generateEduprimaMenu(segments, pathname, t, locale);
  }
  
  // Default fallback
  return {
    groupLabel: "Eduprima",
    currentPage: "Eduprima",
    menus: [
      {
        href: addLocalePrefix("/eduprima/main", locale),
        label: "Eduprima Main",
        active: pathname === addLocalePrefix("/eduprima/main", locale),
        icon: "heroicons:home",
      }
    ],
    staticMenus: getStaticMenus(pathname, t, locale)
  };
}

function generateEduprimaMenu(pathSegments: string[], pathname: string, t: any, locale: string): DynamicMenuGroup {
  // If we're in main section
  if (pathSegments[1] === 'main') {
    // If we're in main root
    if (pathSegments.length === 2) {
      return {
        groupLabel: "Eduprima",
        currentPage: "Eduprima Main",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main", locale),
            label: "Eduprima Main",
            active: true,
            icon: "heroicons:home",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops", locale),
                label: "Operasional (Ops)",
                active: false,
                icon: "heroicons:cog-6-tooth",
              },
              {
                href: addLocalePrefix("/eduprima/main/program", locale),
                label: "Program",
                active: false,
                icon: "heroicons:academic-cap",
              },
              {
                href: addLocalePrefix("/eduprima/main/ba", locale),
                label: "Business Affair",
                active: false,
                icon: "heroicons:building-office",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops section
    if (pathSegments[2] === 'ops') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Operasional",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops", locale),
            label: "Operasional",
            active: true,
            icon: "heroicons:cog-6-tooth",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em", locale),
                label: "Education Management (EM)",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em", locale)),
                icon: "heroicons:user-group",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/ec", locale),
                label: "Education Consulting",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/ec", locale)),
                icon: "heroicons:academic-cap",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/adm", locale),
                label: "Admin",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/adm", locale)),
                icon: "heroicons:shield-check",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in program section
    if (pathSegments[2] === 'program') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Program",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/program", locale),
            label: "Program",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/program/courses", locale),
                label: "Courses",
                active: pathname.includes(addLocalePrefix("/eduprima/main/program/courses", locale)),
                icon: "heroicons:book-open",
              },
              {
                href: addLocalePrefix("/eduprima/main/program/curriculum", locale),
                label: "Curriculum",
                active: pathname.includes(addLocalePrefix("/eduprima/main/program/curriculum", locale)),
                icon: "heroicons:document-text",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in business affair section
    if (pathSegments[2] === 'ba') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Business Affair",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ba", locale),
            label: "Business Affair",
            active: true,
            icon: "heroicons:building-office",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ba/partnership", locale),
                label: "Partnership",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ba/partnership", locale)),
                icon: "heroicons:handshake",
              },
              {
                href: addLocalePrefix("/eduprima/main/ba/marketing", locale),
                label: "Marketing",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ba/marketing", locale)),
                icon: "heroicons:megaphone",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/em (root EM page)
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments.length === 4) {
      return {
        groupLabel: "Eduprima",
        currentPage: "Education Management",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/em", locale),
            label: "Education Management (EM)",
            active: true,
            icon: "heroicons:user-group",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking", locale),
                label: "EM Matchmaking",
                active: false,
                icon: "heroicons:user-plus",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/cms", locale),
                label: "EM Class Management (CMS)",
                active: false,
                icon: "heroicons:academic-cap",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/engagement", locale),
                label: "EM Engagement",
                active: false,
                icon: "heroicons:heart",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/em/matchmaking
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'matchmaking') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Matchmaking",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/em/matchmaking", locale),
            label: "EM Matchmaking",
            active: true,
            icon: "heroicons:user-plus",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/data-followup", locale),
                label: "Unit Penyiapan Data & Follow Up GT",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/data-followup", locale)),
                icon: "heroicons:clipboard-document-list",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/offering", locale),
                label: "Unit Offering",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/offering", locale)),
                icon: "heroicons:presentation-chart-line",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/tutor-case", locale),
                label: "Unit Ganti Tutor & Case Solving",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/tutor-case", locale)),
                icon: "heroicons:user-group",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/komunikasi", locale),
                label: "EM Komunikasi",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/komunikasi", locale)),
                icon: "heroicons:chat-bubble-left-right",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/plp", locale),
                label: "Unit Penyiapan PLP",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/plp", locale)),
                icon: "heroicons:document-text",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/database-tutor", locale),
                label: "Database Tutor",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/matchmaking/database-tutor", locale)),
                icon: "heroicons:server-stack",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/em/matchmaking/database-tutor
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'matchmaking' && pathSegments[5] === 'database-tutor') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Database Tutor",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/em/matchmaking", locale),
            label: "EM Matchmaking",
            active: false,
            icon: "heroicons:user-plus",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/data-followup", locale),
                label: "Unit Penyiapan Data & Follow Up GT",
                active: false,
                icon: "heroicons:clipboard-document-list",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/offering", locale),
                label: "Unit Offering",
                active: false,
                icon: "heroicons:presentation-chart-line",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/tutor-case", locale),
                label: "Unit Ganti Tutor & Case Solving",
                active: false,
                icon: "heroicons:user-group",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/komunikasi", locale),
                label: "EM Komunikasi",
                active: false,
                icon: "heroicons:chat-bubble-left-right",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/plp", locale),
                label: "Unit Penyiapan PLP",
                active: false,
                icon: "heroicons:document-text",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/matchmaking/database-tutor", locale),
                label: "Database Tutor",
                active: true,
                icon: "heroicons:server-stack",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/em/cms
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'cms') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Class Management (CMS)",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/em/cms", locale),
            label: "EM Class Management (CMS)",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-kelas", locale),
                label: "Monitoring Kelas & Presensi Tutor",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-kelas", locale)),
                icon: "heroicons:eye",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-ruang", locale),
                label: "Monitoring Ruang Kelas Edufio x ILC",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-ruang", locale)),
                icon: "heroicons:building-office",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-pembayaran", locale),
                label: "Monitoring Pembayaran/Tagihan",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/cms/monitoring-pembayaran", locale)),
                icon: "heroicons:currency-dollar",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/em/engagement
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'em' && pathSegments[4] === 'engagement') {
      return {
        groupLabel: "Eduprima",
        currentPage: "EM Engagement",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/em/engagement", locale),
            label: "EM Engagement",
            active: true,
            icon: "heroicons:heart",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/em/engagement/recruitment", locale),
                label: "Recruitment Unit",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/engagement/recruitment", locale)),
                icon: "heroicons:user-plus",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/engagement/development", locale),
                label: "Development Unit",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/engagement/development", locale)),
                icon: "heroicons:academic-cap",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/em/engagement/relations", locale),
                label: "Relations Unit",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/em/engagement/relations", locale)),
                icon: "heroicons:handshake",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/ec
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'ec') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Education Consulting",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/ec", locale),
            label: "Education Consulting",
            active: true,
            icon: "heroicons:academic-cap",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/ec/consultation", locale),
                label: "Consultation",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/ec/consultation", locale)),
                icon: "heroicons:chat-bubble-left-right",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/ec/training", locale),
                label: "Training",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/ec/training", locale)),
                icon: "heroicons:academic-cap",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
    
    // If we're in ops/adm
    if (pathSegments[2] === 'ops' && pathSegments[3] === 'adm') {
      return {
        groupLabel: "Eduprima",
        currentPage: "Admin",
        menus: [
          {
            href: addLocalePrefix("/eduprima/main/ops/adm", locale),
            label: "Admin",
            active: true,
            icon: "heroicons:shield-check",
            children: [
              {
                href: addLocalePrefix("/eduprima/main/ops/adm/users", locale),
                label: "Users",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/adm/users", locale)),
                icon: "heroicons:users",
              },
              {
                href: addLocalePrefix("/eduprima/main/ops/adm/permissions", locale),
                label: "Permissions",
                active: pathname.includes(addLocalePrefix("/eduprima/main/ops/adm/permissions", locale)),
                icon: "heroicons:key",
              },
            ]
          }
        ],
        staticMenus: getStaticMenus(pathname, t, locale)
      };
    }
  }
  
  // Default fallback for eduprima
  return {
    groupLabel: "Eduprima",
    currentPage: "Eduprima",
    menus: [
      {
        href: addLocalePrefix("/eduprima/main", locale),
        label: "Eduprima Main",
        active: pathname === addLocalePrefix("/eduprima/main", locale),
        icon: "heroicons:home",
      }
    ],
    staticMenus: getStaticMenus(pathname, t, locale)
  };
}

function getStaticMenus(pathname: string, t: any, locale: string): DynamicMenuItem[] {
  return [
    {
      href: "https://chat.google.com",
      label: "Chat",
      active: false,
      icon: "heroicons-outline:chat",
      external: true,
    },
    {
      href: "https://trello.com/b/Cq8xUPCg/tutoring-operations",
      label: "Kanban",
      active: false,
      icon: "heroicons-outline:view-boards",
      external: true,
    },
    {
      href: "https://chat.qontak.com",
      label: "CRM",
      active: false,
      icon: "heroicons-outline:share",
      external: true,
    },
    {
      href: "https://drive.google.com",
      label: "Google Drive",
      active: false,
      icon: "heroicons-outline:cloud",
      external: true,
    },
    {
      href: addLocalePrefix("/eduprima/settings", locale),
      label: "System Settings",
      active: pathname.includes(addLocalePrefix("/eduprima/settings", locale)),
      icon: "heroicons-outline:cog-6-tooth",
    },
  ];
} 