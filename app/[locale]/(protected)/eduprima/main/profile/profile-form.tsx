"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  user_code: string;
  email: string;
  phone?: string;
  phone_verified: boolean;
  email_verified: boolean;
  user_status: string;
  account_type: string;
  primary_role: string;
  role: string;
  primary_country?: string;
  timezone?: string;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  login_count: number;
}

const profileSchema = z.object({
  phone: z.string().regex(/^[0-9+\-\s()]*$/, { message: "Please enter a valid phone number." }).optional(),
  primary_country: z.string().min(2, { message: "Country must be at least 2 characters." }).optional(),
  timezone: z.string().optional(),
  marketing_consent: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userProfile: UserProfile;
}

const timezoneOptions = [
  { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
  { value: "Asia/Makassar", label: "Asia/Makassar (WITA)" },
  { value: "Asia/Jayapura", label: "Asia/Jayapura (WIT)" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok" },
  { value: "UTC", label: "UTC" },
];

const countryOptions = [
  { value: "Indonesia", label: "Indonesia" },
  { value: "Singapore", label: "Singapore" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Thailand", label: "Thailand" },
  { value: "Philippines", label: "Philippines" },
];

export default function ProfileForm({ userProfile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [marketingConsent, setMarketingConsent] = useState(userProfile.marketing_consent);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: userProfile.phone || "",
      primary_country: userProfile.primary_country || "",
      timezone: userProfile.timezone || "",
      marketing_consent: userProfile.marketing_consent,
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userProfile.email,
            ...data,
            marketing_consent: marketingConsent,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          toast.success('Profile updated successfully!');
          router.refresh(); // Refresh to show updated data
        } else {
          toast.error(result.message || 'Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('An error occurred while updating profile');
      }
    });
  };

  const handleReset = () => {
    reset({
      phone: userProfile.phone || "",
      primary_country: userProfile.primary_country || "",
      timezone: userProfile.timezone || "",
      marketing_consent: userProfile.marketing_consent,
    });
    setMarketingConsent(userProfile.marketing_consent);
    toast.info('Form reset to original values');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="Enter your phone number (e.g., +62 812-3456-7890)"
          disabled={isPending}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Country Field */}
      <div className="space-y-2">
        <Label htmlFor="primary_country">Country</Label>
        <Select 
          onValueChange={(value) => setValue("primary_country", value)}
          defaultValue={userProfile.primary_country || ""}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.primary_country && (
          <p className="text-sm text-destructive">{errors.primary_country.message}</p>
        )}
      </div>

      {/* Timezone Field */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select 
          onValueChange={(value) => setValue("timezone", value)}
          defaultValue={userProfile.timezone || ""}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezoneOptions.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timezone && (
          <p className="text-sm text-destructive">{errors.timezone.message}</p>
        )}
      </div>

      {/* Marketing Consent */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="marketing_consent"
            checked={marketingConsent}
            onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
            disabled={isPending}
          />
          <Label 
            htmlFor="marketing_consent" 
            className="text-sm font-normal cursor-pointer"
          >
            I agree to receive marketing emails and communications
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Updating..." : "Update Profile"}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleReset}
          disabled={isPending}
        >
          Reset
        </Button>
      </div>

      {/* Read-only Information */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="space-y-2 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> The following fields cannot be changed directly:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email address (contact support if needed)</li>
            <li>User code and role (managed by administrators)</li>
            <li>Account type (managed by administrators)</li>
            <li>Email verification status (verify through email link)</li>
          </ul>
        </div>
      </div>
    </form>
  );
} 