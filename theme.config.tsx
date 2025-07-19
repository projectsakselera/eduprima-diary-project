
import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import { Icon } from '@/components/ui/icon';
const config: DocsThemeConfig = {
  logo: (
    <span className=" inline-flex gap-2.5 items-center">
      <Icon icon="ph:graduation-cap" className="text-primary h-8 w-8" />
      <span className="  text-lg font-bold text-default ">EduPrima</span>
    </span>
  ),
  project: {
    link: "https://github.com/shuding/nextra",
  },
  banner: {
    key: "1.0-release",
    text: (
      <a href="/dashboard" target="_blank">
        🌍 Building Tomorrow's Civilization through Education
      </a>
    ),
  },
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} ©{" "}
        <a href="https://akselera.tech" target="_blank">
          Akselera Tech
        </a>
        .
      </span>
    ),
  },
  themeSwitch: {
    useOptions() {
      return {
        light: 'Light',
        dark: 'Dark',
        system: 'System', // Add this line
      };
    },
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – EduPrima",
    };
  },
};

export default config