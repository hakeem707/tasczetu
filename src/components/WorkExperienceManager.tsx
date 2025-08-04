import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Plus, Edit2, Trash2, Upload, ChevronDown, Star, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkExperience {
  id: string;
  job_title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  client_feedback: string | null;
  client_rating: number | null;
  media_urls: string[];
}

interface WorkExperienceManagerProps {
  providerId: string;
  readonly?: boolean;
}

export function WorkExperienceManager({ providerId, readonly = false }: WorkExperienceManagerProps) {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    job_title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    client_feedback: '',
    client_rating: null as number | null
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
  }, [providerId]);

  const fetchExperiences = async () => {
    try {
      console.log('Fetching work experience for provider:', providerId, 'readonly:', readonly);
      const { data, error } = await supabase
        .from('work_experience')
        .select('*')
        .eq('provider_id', providerId)
        .order('start_date', { ascending: false });

      console.log('Work experience data:', data, 'error:', error);
      if (error) throw error;
      setExperiences(data || []);
      console.log('Set experiences:', data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      if (!readonly) {
        toast({
          title: "Error",
          description: "Failed to load work experience",
          variant: "destructive"
        });
      }
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // Get current user ID for folder structure
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('provider-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('provider-files')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!formData.job_title.trim() || !formData.description.trim() || !formData.start_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add work experience",
          variant: "destructive"
        });
        return;
      }

      // Verify the provider belongs to the current user
      const { data: providerCheck, error: providerError } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', providerId)
        .single();

      if (providerError || !providerCheck || providerCheck.user_id !== user.id) {
        toast({
          title: "Permission Error", 
          description: "You don't have permission to edit this provider's experience",
          variant: "destructive"
        });
        return;
      }

      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        mediaUrls = await uploadFiles(selectedFiles);
      }

      const experienceData = {
        provider_id: providerId,
        job_title: formData.job_title.trim(),
        description: formData.description.trim(),
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date || null,
        is_current: formData.is_current,
        client_feedback: formData.client_feedback.trim() || null,
        client_rating: formData.client_rating,
        media_urls: mediaUrls
      };

      if (editingId) {
        // Update existing experience
        const { data, error } = await supabase
          .from('work_experience')
          .update(experienceData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setExperiences(prev => prev.map(exp => exp.id === editingId ? data : exp));
        toast({ title: "Success", description: "Experience updated successfully" });
      } else {
        // Create new experience
        const { data, error } = await supabase
          .from('work_experience')
          .insert([experienceData])
          .select()
          .single();

        if (error) throw error;
        setExperiences(prev => [data, ...prev]);
        toast({ title: "Success", description: "Experience added successfully" });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: "Error",
        description: "Failed to save experience",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from('work_experience')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExperiences(prev => prev.filter(exp => exp.id !== id));
      toast({ title: "Success", description: "Experience deleted successfully" });
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: '',
      description: '',
      start_date: '',
      end_date: '',
      is_current: false,
      client_feedback: '',
      client_rating: null
    });
    setSelectedFiles([]);
    setEditingId(null);
  };

  const openEditDialog = (experience: WorkExperience) => {
    setFormData({
      job_title: experience.job_title,
      description: experience.description,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      is_current: experience.is_current,
      client_feedback: experience.client_feedback || '',
      client_rating: experience.client_rating
    });
    setEditingId(experience.id);
    setIsDialogOpen(true);
  };

  const formatDateRange = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = format(new Date(startDate), 'MMM yyyy');
    if (isCurrent) return `${start} - Present`;
    if (endDate) return `${start} - ${format(new Date(endDate), 'MMM yyyy')}`;
    return start;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (readonly) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        {experiences.length === 0 ? (
          <p className="text-muted-foreground">No work experience listed yet.</p>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <Collapsible key={exp.id}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{exp.job_title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      <p className="text-sm">{exp.description}</p>
                      
                      {exp.client_feedback && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Client Feedback:</h5>
                          <p className="text-sm text-muted-foreground italic">"{exp.client_feedback}"</p>
                          {exp.client_rating && (
                            <div className="flex items-center gap-1">
                              {renderStars(exp.client_rating)}
                              <span className="text-sm text-muted-foreground ml-2">
                                {exp.client_rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {exp.media_urls && exp.media_urls.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Work Samples:</h5>
                          <Carousel className="w-full max-w-md">
                            <CarouselContent>
                              {exp.media_urls.map((url, index) => (
                                <CarouselItem key={index} className="md:basis-1/2">
                                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`Work sample ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                          </Carousel>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Work Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="e.g., Bathroom Renovation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={formData.is_current}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_current: e.target.checked }))}
                  />
                  <Label htmlFor="is_current">This is my current project</Label>
                </div>

                {!formData.is_current && (
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the work you did, challenges overcome, and results achieved..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="client_feedback">Client Feedback</Label>
                  <Textarea
                    id="client_feedback"
                    value={formData.client_feedback}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_feedback: e.target.value }))}
                    placeholder="What did the client say about your work?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="client_rating">Client Rating</Label>
                  <select
                    id="client_rating"
                    value={formData.client_rating || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      client_rating: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">No rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="media">Work Photos/Videos</Label>
                  <Input
                    id="media"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload photos or videos of your completed work
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={uploading}
                  >
                    {uploading ? 'Saving...' : editingId ? 'Update' : 'Add'} Experience
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {experiences.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No work experience added yet. Share your projects to build trust with potential clients!
          </p>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <Card key={exp.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.job_title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{exp.description}</p>
                      
                      {exp.client_rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {renderStars(exp.client_rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({exp.client_rating}/5)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(exp)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}