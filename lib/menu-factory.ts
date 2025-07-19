// 📁 lib/menu-factory.ts

import { getMenuList } from "./menus";
import { getEduprimaMenuList } from "./eduprima-menus";

export function getMenuByApp(pathname: string, t: any) {
  if (pathname.includes('/eduprima')) {
    return getEduprimaMenuList(pathname, t);
  }
  return getMenuList(pathname, t); // Dashcode default
} 