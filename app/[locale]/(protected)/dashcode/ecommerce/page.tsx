"use client";
import { redirect } from "@/components/navigation";
const Backend = () => {
  redirect({ href: '/dashcode/ecommerce/frontend', locale: 'en' })
  return null;
};

export default Backend;
