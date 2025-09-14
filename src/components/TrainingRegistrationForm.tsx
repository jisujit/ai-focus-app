import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Calendar, Clock, Users, DollarSign, CheckCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrainingRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  trainingTitle: string;
}

const TrainingRegistrationForm: React.FC<TrainingRegistrationFormProps> = ({
  isOpen,
  onClose,
  trainingTitle
}) => {
  const [selectedSession, setSelectedSession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    jobTitle: "",
    experience: "",
    expectations: ""
  });

  const sessions = [
    {
      id: "102501",
      date: "October 11, 2025",
      time: "11:00 AM EST",
      availability: "12 spots available"
    },
    {
      id: "102502", 
      date: "October 18, 2025",
      time: "11:00 AM EST",
      availability: "15 spots available"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSession) {
      toast({
        title: "Session Required",
        description: "Please select a session date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-training-registration', {
        body: {
          sessionId: selectedSession,
          trainingTitle,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          experienceLevel: formData.experience,
          expectations: formData.expectations
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Registration Submitted!",
          description: data.message,
        });
        onClose();
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          phone: "",
          jobTitle: "",
          experience: "",
          expectations: ""
        });
        setSelectedSession("");
      } else {
        throw new Error(data.error || "Failed to submit registration");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Calendar className="w-6 h-6 text-accent mr-3" />
            Register for Training
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Details Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-gradient-card border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-foreground">{trainingTitle}</CardTitle>
                <CardDescription>Comprehensive 3-hour training session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>3 hours duration</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-accent" />
                  <span>Instructor-led training</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <div>
                      <div className="text-sm text-muted-foreground line-through">$150 per person</div>
                      <div className="font-semibold text-success">$75 per person</div>
                      <div className="text-xs text-muted-foreground">Introductory Price</div>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Badge className="bg-success/10 text-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    50% Off Launch Price
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm text-foreground mb-2">What's Included:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 3-hour live training session</li>
                  <li>• Downloadable course materials</li>
                  <li>• Certificate of completion</li>
                  <li>• 30-day email support</li>
                  <li>• Access to private community</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Training Session *</Label>
                <RadioGroup value={selectedSession} onValueChange={setSelectedSession}>
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={session.id} id={session.id} />
                      <Label 
                        htmlFor={session.id} 
                        className="flex-1 cursor-pointer border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Session {session.id}</div>
                            <div className="text-sm text-muted-foreground">{session.date} @ {session.time}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs">{session.availability}</Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="experience">Current AI Experience Level</Label>
                  <RadioGroup value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner - New to AI tools</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate - Some experience with AI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced - Regular AI tool user</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectations">Training Goals & Expectations</Label>
                  <Textarea 
                    id="expectations" 
                    placeholder="What do you hope to achieve from this training? Any specific use cases you'd like to explore?"
                    rows={3}
                    value={formData.expectations}
                    onChange={(e) => handleInputChange('expectations', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  variant="professional" 
                  size="lg" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Submitting..." : "Register for Training ($75)"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingRegistrationForm;