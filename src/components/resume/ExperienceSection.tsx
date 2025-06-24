
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  setExperiences: (experiences: Experience[]) => void;
}

const ExperienceSection = ({ experiences, setExperiences }: ExperienceSectionProps) => {
  const addExperience = () => {
    setExperiences([...experiences, { title: '', company: '', duration: '', description: '' }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = experiences.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Work Experience</CardTitle>
          <Button onClick={addExperience} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Experience {index + 1}</h4>
              <Button
                onClick={() => removeExperience(index)}
                size="sm"
                variant="ghost"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Job Title"
                value={exp.title}
                onChange={(e) => updateExperience(index, 'title', e.target.value)}
              />
              <Input
                placeholder="Company"
                value={exp.company}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
              />
            </div>
            <Input
              placeholder="Duration (e.g., Jan 2020 - Present)"
              value={exp.duration}
              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
            />
            <Textarea
              placeholder="Job description and achievements..."
              value={exp.description}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              className="min-h-20"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExperienceSection;
