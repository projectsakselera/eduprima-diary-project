'use client'
import React from "react";
import { Icon } from "@/components/ui/icon";
import { Link } from '@/i18n/routing';

const Logo = () => {
  return (
    <Link href="/dashcode/dashboard/analytics" className="flex gap-2 items-center">
      <Icon icon="ph:graduation-cap" className="text-primary h-12 w-12" />
      <h1 className="text-2xl font-semibold text-default-900">
        Eduprima Space
      </h1>
    </Link>
  );
}

export default Logo;