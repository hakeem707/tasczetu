import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Award, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SkillsManager } from '@/components/SkillsManager';
import { WorkExperienceManager } from '@/components/WorkExperienceManager';

interface Provider {
  id: string;
  name: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  profile_photo_url: string | null;
}

interface ProviderProfileEditorProps {
  provider: Provider;
  onProviderUpdate: (updatedProvider: Provider) => void;
}

export function ProviderProfileEditor({ provider, onProviderUpdate }: ProviderProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: provider.name,
    phone: provider.phone || '',
    bio: provider.bio || '',
    location: provider.location || ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${provider.id}/profile/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profilePhotoUrl = provider.profile_photo_url;

      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto);
      }

      const { data, error } = await supabase
        .from('providers')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          bio: formData.bio || null,
          location: formData.location || null,
          profile_photo_url: profilePhotoUrl
        })
        .eq('id', provider.id)
        .select()
        .single();

      if (error) throw error;

      onProviderUpdate(data);
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Provider Profile</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell customers about your experience and skills..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profilePhoto">Profile Photo</Label>
                    <Input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="skills">
            <SkillsManager providerId={provider.id} />
          </TabsContent>
          
          <TabsContent value="experience">
            <WorkExperienceManager providerId={provider.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}