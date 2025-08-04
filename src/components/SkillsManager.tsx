import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  level: string;
  years_experience: number;
}

interface SkillsManagerProps {
  providerId: string;
  readonly?: boolean;
}

export function SkillsManager({ providerId, readonly = false }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'intermediate' as const,
    years_experience: 1
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSkills();
  }, [providerId]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive"
      });
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) return;

    setLoading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add skills",
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
          description: "You don't have permission to edit this provider's skills",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('skills')
        .insert([{
          provider_id: providerId,
          name: newSkill.name.trim(),
          level: newSkill.level,
          years_experience: newSkill.years_experience
        }])
        .select()
        .single();

      if (error) throw error;

      setSkills(prev => [data, ...prev]);
      setNewSkill({ name: '', level: 'intermediate', years_experience: 1 });
      toast({
        title: "Success",
        description: "Skill added successfully"
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast({
        title: "Success",
        description: "Skill removed successfully"
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive"
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (readonly) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        {skills.length === 0 ? (
          <p className="text-muted-foreground">No skills listed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className={`${getLevelColor(skill.level)} text-sm py-1 px-3`}
              >
                {skill.name} • {skill.years_experience}y • {skill.level}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new skill form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label htmlFor="skill-name">Skill Name</Label>
            <Input
              id="skill-name"
              placeholder="e.g., Plumbing"
              value={newSkill.name}
              onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="skill-level">Level</Label>
            <Select value={newSkill.level} onValueChange={(value: any) => setNewSkill(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="skill-years">Years Experience</Label>
            <Input
              id="skill-years"
              type="number"
              min="1"
              max="50"
              value={newSkill.years_experience}
              onChange={(e) => setNewSkill(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addSkill} 
              disabled={!newSkill.name.trim() || loading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>

        {/* Skills list */}
        {skills.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No skills added yet. Add your first skill above!</p>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium">Your Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="outline"
                  className={`${getLevelColor(skill.level)} text-sm py-1 px-3 group relative`}
                >
                  {skill.name} • {skill.years_experience}y • {skill.level}
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}