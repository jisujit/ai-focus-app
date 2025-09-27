import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  Calendar,
  MessageSquare,
  Building
} from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "info@ai-focus.org",
      description: "Get in touch for inquiries"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (904) 413-1317",
      description: "Call for immediate assistance"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Jacksonville, FL & Virtual",
      description: "On-site and virtual training available"
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Fri 9AM-6PM EST",
      description: "We'll respond within 24 hours"
    }
  ];

  const trainingTypes = [
    "Corporate Training",
    "Individual Coaching", 
    "Team Workshops",
    "Consulting Services",
    "Custom Curriculum",
    "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleTrainingInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(item => item !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-contact-form', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          trainingInterests: selectedInterests,
          message: formData.message
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Message Sent!",
          description: data.message,
        });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          phone: "",
          message: ""
        });
        setSelectedInterests([]);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Failed to Send Message",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">Get Started with AI Training</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Ready to transform your organization with AI? Let's discuss your training needs 
            and create a customized program for your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline-white" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://calendly.com/ai-focus-academy/consultation', '_blank')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Free Consultation
            </Button>
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = 'mailto:info@ai-focus.org?subject=Training Inquiry'}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-strong border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center">
                  <Send className="w-6 h-6 text-accent mr-3" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@company.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    placeholder="Your Company Name" 
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (904) 413-1317" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Training Interest</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {trainingTypes.map((type, index) => (
                      <Badge 
                        key={index} 
                        variant={selectedInterests.includes(type) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => toggleTrainingInterest(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us about your training needs, team size, and goals..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="professional" 
                  size="lg" 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="grid grid-cols-1 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover-lift shadow-soft hover:shadow-medium transition-all duration-300 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft flex-shrink-0">
                          <info.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                          <p className="text-accent font-medium mb-1">{info.content}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Info Card */}
              <Card className="shadow-strong border-0 bg-gradient-card">
                <CardContent className="p-8 text-center">
                  <Building className="w-16 h-16 text-accent mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Enterprise Training Solutions
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    We specialize in large-scale corporate training programs with customized 
                    curricula designed for your organization's specific needs.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = 'mailto:info@ai-focus.org?subject=Enterprise Training Programs'}
                  >
                    Learn About Enterprise Programs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info */}
      <section className="py-20 bg-gradient-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join over 500 professionals who have transformed their careers with our AI training programs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="professional" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://calendly.com/ai-focus-academy/consultation', '_blank')}
            >
              Schedule Free 30-min Consultation
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = 'mailto:info@ai-focus.org?subject=Training Brochure Request'}
            >
              Download Training Brochure
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;