"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCustomSession } from "@/hooks/use-custom-session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Standard Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function TestUploadComponent() {
  const { user, loading } = useCustomSession();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) {
      toast.error("File or user session not found!");
      return;
    }

    setUploading(true);

    try {
      console.log('🔄 Starting file upload process...');
      console.log('📁 File:', file.name, 'Size:', file.size);
      console.log('👤 User ID:', user.id);

      // 1. Get Supabase JWT token from our custom API
      console.log('🎫 Getting JWT token from /api/supabase-session...');
      const response = await fetch("/api/supabase-session");
      const data = await response.json();

      if (data.error || !data.supabaseToken) {
        throw new Error(data.error || "Failed to get Supabase token");
      }

      console.log('✅ JWT token received');
      const { supabaseToken } = data;

      // 2. Create authenticated Supabase client with custom JWT
      const supabaseAuthenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
          },
        },
      });

      // 3. Upload file with user ID as folder name
      const filePath = `${user.id}/${Date.now()}-${file.name}`; // Add timestamp to avoid conflicts
      console.log('📤 Uploading to path:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabaseAuthenticatedClient.storage
        .from("eduprimadiary")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload successful:', uploadData);
      toast.success(`File uploaded successfully: ${file.name}`);
      
      // Add to uploaded files list
      setUploadedFiles(prev => [...prev, filePath]);

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // Clear file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleViewFiles = async () => {
    if (!user?.id) return;

    try {
      console.log('📋 Listing files for user:', user.id);
      
      // Get JWT token
      const response = await fetch("/api/supabase-session");
      const data = await response.json();
      
      if (data.error || !data.supabaseToken) {
        throw new Error(data.error || "Failed to get Supabase token");
      }

      // Create authenticated client
      const supabaseAuthenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${data.supabaseToken}`,
          },
        },
      });

      // List files in user's folder
      const { data: files, error } = await supabaseAuthenticatedClient.storage
        .from("eduprimadiary")
        .list(user.id);

      if (error) {
        throw error;
      }

      console.log('📁 Files found:', files);
      toast.success(`Found ${files?.length || 0} files in your folder`);
      
    } catch (error: any) {
      console.error('❌ List files error:', error);
      toast.error(`Failed to list files: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading user session...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 rounded-lg">
        <p className="text-yellow-800">Please login to test file upload</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🧪 Test File Upload</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Logged in as: <strong>{user.email}</strong>
          </p>
          <p className="text-xs text-gray-500">
            User ID: {user.id}
          </p>
        </div>

        <div>
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleViewFiles}
            variant="outline"
            size="sm"
          >
            📋 View My Files
          </Button>
        </div>

        {uploading && (
          <div className="text-center">
            <p className="text-blue-600">⏳ Uploading...</p>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">✅ Uploaded Files:</p>
            <ul className="text-xs text-gray-600 mt-1">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="truncate">• {file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p><strong>How it works:</strong></p>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Get JWT token from /api/supabase-session</li>
          <li>Create authenticated Supabase client</li>
          <li>Upload to: {user.id}/filename</li>
          <li>RLS policies check user ownership</li>
        </ol>
      </div>
    </div>
  );
}