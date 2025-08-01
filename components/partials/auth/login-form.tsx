"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from '@/i18n/routing';
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react';
import { toast } from "sonner"
import { useRouter } from '@/components/navigation';
import { signIn } from "next-auth/react";
// Using NextAuth with custom credentials provider for universal table authentication

const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});
const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const [passwordType, setPasswordType] = React.useState("password");


  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Removed credential select - using real accounts only

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      try {
        console.log('🔐 Attempting NextAuth login for:', data.email.trim());
        
        // Use NextAuth signIn with credentials provider
        const result = await signIn('credentials', {
          email: data.email.trim(),
          password: data.password,
          redirect: false, // Handle redirect manually
        });

        console.log('🔍 NextAuth SignIn Result:', result);

        if (result?.error) {
          console.error('❌ NextAuth login failed:', result.error);
          
          // Handle different error types for better UX
          if (result.error === 'CredentialsSignin') {
            // This includes both invalid credentials AND unauthorized roles
            toast.error('Invalid email/password or user not authorized to access this system');
          } else {
            toast.error('Login failed. Please try again.');
          }
          return;
        }

        if (result?.ok) {
          console.log('✅ NextAuth login successful');
          toast.success('Login successful!');
          
          // No need to store user in sessionStorage - NextAuth handles session
          // Redirect based on role or default to tutor database
          // Note: Remove /en/ prefix - next-intl router will auto-add current locale
          const redirectUrl = '/eduprima/main/ops/em/matchmaking/database-tutor/view-all';
          
          console.log('🚀 Attempting redirect to:', redirectUrl);
          
          // Use router for navigation
          try {
            console.log('Method 1: Using next-intl router.push...');
            router.push(redirectUrl);
            
            // Fallback after a delay in case router fails
            setTimeout(() => {
              if (window.location.pathname.includes('/auth/login')) {
                console.log('Method 2: Using window.location.href as fallback...');
                // For fallback, we need to include current locale
                const currentLocale = window.location.pathname.split('/')[1] || 'en';
                window.location.href = `/${currentLocale}${redirectUrl}`;
              }
            }, 1000);
            
          } catch (routerError) {
            console.error('Router error:', routerError);
            console.log('Method 3: Direct window.location.href...');
            // For direct fallback, we need to include current locale
            const currentLocale = window.location.pathname.split('/')[1] || 'en';
            window.location.href = `/${currentLocale}${redirectUrl}`;
          }
        } else {
          console.log('❌ NextAuth login failed - no ok status');
          toast.error('Login failed - please try again');
        }
      } catch (err: any) {
        console.error('❌ NextAuth login error:', err);
        toast.error('Network error. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className=" font-medium text-default-600">
          Email{" "}
        </Label>
        <Input size="lg"
          disabled={isPending}
          {...register("email")}
          type="email"
          id="email"
          className={cn("", {
            "border-destructive ": errors.email,
          })}
        />
      </div>
      {errors.email && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.email.message}
        </div>
      )}

      <div className="mt-3.5 space-y-2">
        <Label htmlFor="password" className="mb-2 font-medium text-default-600">
          Password{" "}
        </Label>
        <div className="relative">
          <Input size="lg"
            disabled={isPending}
            {...register("password")}
            type={passwordType}
            id="password"
            className="peer  "
            placeholder=" "
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={togglePasswordType}
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
      </div>
      {errors.password && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.password.message}
        </div>
      )}

      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <Checkbox id="checkbox" defaultChecked />
          <Label htmlFor="checkbox">Keep Me Signed In</Label>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-default-800 dark:text-default-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div>
      <Button fullWidth disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Loading..." : "Sign In"}
      </Button>
      
      {/* Test credentials removed - use real accounts from universal table */}
    </form>
  );
};
export default LoginForm;
