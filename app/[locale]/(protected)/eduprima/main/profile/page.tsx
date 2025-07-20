import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

async function getUserProfile(email: string): Promise<UserProfile | null> {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: user, error } = await supabase
      .from('t_310_01_01_users_universal')
      .select('*')
      .eq('email', email)
      .eq('user_status', 'active')
      .single();

    if (error || !user) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return user as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const userProfile = await getUserProfile(session.user.email);

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load user profile. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const fallbackInitial = userProfile.email.charAt(0).toUpperCase();
  const displayName = userProfile.email.split('@')[0]; // Use email prefix as display name

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user.image || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <CardDescription className="text-lg">{userProfile.email}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {userProfile.role}
                  </span>
                  <span className="px-2 py-1 bg-secondary/10 text-secondary-foreground text-xs rounded-full">
                    {userProfile.account_type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userProfile.email_verified 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {userProfile.email_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details & Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your current account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">User Code</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{userProfile.user_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-sm">{userProfile.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Primary Role</label>
                <p className="text-sm">{userProfile.primary_role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="text-sm">{userProfile.primary_country || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Timezone</label>
                <p className="text-sm">{userProfile.timezone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Created</label>
                <p className="text-sm">{new Date(userProfile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm">{new Date(userProfile.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Login Count</label>
                <p className="text-sm">{userProfile.login_count} times</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm userProfile={userProfile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 