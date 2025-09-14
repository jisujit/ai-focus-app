import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TrainingRegistrationForm from "@/components/TrainingRegistrationForm";
import { 
  Brain, 
  Cog, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const services = [
    {
      icon: Brain,
      title: "AI Fundamentals & ChatGPT Mastery",
      description: "Get hands-on experience with AI tools in this comprehensive 3-hour instructor-led training session.",
      duration: "3 hours",
      level: "All Levels",
      format: "Instructor-Led Training",
      price: "Contact for pricing",
      features: [
        "AI landscape overview and current trends",
        "ChatGPT and Claude basics with live demonstrations",
        "Safety considerations and AI limitations",
        "Hands-on practice with effective prompting techniques",
        "Real-world business use cases and applications",
        "Advanced features and workflow integration",
        "Building sustainable AI habits for productivity"
      ],
      available: true,
      sessionOutline: [
        "Hour 1: AI landscape overview, ChatGPT/Claude basics, safety and limitations",
        "Hour 2: Hands-on practice with prompting techniques, real-world use cases", 
        "Hour 3: Advanced features, workflow integration, building AI habits"
      ]
    },
    {
      icon: Cog,
      title: "Machine Learning for Business Leaders",
      description: "Half-day intensive covering ML fundamentals and practical business applications.",
      duration: "4 hours",
      level: "Executive/Management",
      format: "Instructor-Led Training",
      price: "Contact for pricing",
      features: [
        "ML fundamentals without technical complexity",
        "Business case development for ML projects",
        "ROI assessment and success metrics",
        "Vendor evaluation and selection criteria",
        "Implementation roadmap planning",
        "Risk assessment and mitigation strategies"
      ],
      available: false
    },
    {
      icon: TrendingUp,
      title: "Automation Strategy Workshop",
      description: "Interactive session identifying automation opportunities in your organization.",
      duration: "3 hours",
      level: "Management",
      format: "Instructor-Led Training",
      price: "Contact for pricing",
      features: [
        "Process mapping and automation assessment",
        "Technology stack evaluation",
        "Cost-benefit analysis framework",
        "Implementation prioritization matrix",
        "Change management considerations",
        "Hands-on automation tool demonstrations"
      ],
      available: false
    },
    {
      icon: Users,
      title: "AI Adoption for Teams",
      description: "Team-focused training on integrating AI tools into daily workflows.",
      duration: "2.5 hours",
      level: "All Levels",
      format: "Instructor-Led Training", 
      price: "Contact for pricing",
      features: [
        "Team collaboration with AI tools",
        "Workflow integration strategies",
        "Quality control and review processes",
        "Best practices for AI-assisted work",
        "Security and compliance considerations",
        "Measuring productivity improvements"
      ],
      available: false
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">
            Professional AI Training Services
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Practical, hands-on instructor-led training sessions designed for immediate application and real-world impact
          </p>
          <div className="flex items-center justify-center space-x-6 text-white/80 mb-8">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>2-4 Hour Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Instructor-Led Training</span>
            </div>
          </div>
          <Button 
            variant="outline-white" 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => navigate('/contact')}
          >
            Schedule Consultation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={`relative overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover-lift ${service.available ? 'border-accent shadow-glow' : 'border-muted-foreground/20'}`}>
                <div className="absolute top-4 right-4">
                  {service.available ? (
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available Now
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground mb-1">{service.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </div>
                        <Badge variant="secondary">{service.level}</Badge>
                        <Badge variant="outline" className="text-xs">{service.format}</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Session Outline for Available Training */}
                    {service.available && service.sessionOutline && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">Session Outline:</h4>
                        <ul className="space-y-2">
                          {service.sessionOutline.map((outline, outlineIndex) => (
                            <li key={outlineIndex} className="flex items-start text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 text-accent mr-2 flex-shrink-0 mt-0.5" />
                              {outline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        {service.available ? "Key Learning Outcomes:" : "What You'll Learn:"}
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = 'mailto:sujit@ai-focus.org?subject=Pricing Inquiry'}
                        >
                          Contact for Pricing
                        </Button>
                        <Button 
                          variant={service.available ? "professional" : "outline"} 
                          disabled={!service.available}
                          onClick={() => {
                            if (service.available && service.title === "AI Fundamentals & ChatGPT Mastery") {
                              setShowRegistrationForm(true);
                            } else if (service.available) {
                              window.location.href = 'mailto:sujit@ai-focus.org?subject=Training Registration - ' + service.title;
                            } else {
                              window.location.href = 'mailto:sujit@ai-focus.org?subject=Notify When Available - ' + service.title;
                            }
                          }}
                        >
                          {service.available ? "Register Now" : "Notify When Available"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-foreground mb-4">
            Ready to Start Your AI Training Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Register for our AI Fundamentals & ChatGPT Mastery session or get notified when other programs launch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="professional" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => setShowRegistrationForm(true)}
            >
              Register for AI Fundamentals Training
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = 'mailto:sujit@ai-focus.org?subject=Training Updates Subscription'}
            >
              Get Training Updates
            </Button>
          </div>
        </div>
      </section>

      {/* Registration Form Modal */}
      <TrainingRegistrationForm 
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        trainingTitle="AI Fundamentals & ChatGPT Mastery"
      />
    </Layout>
  );
};

export default Services;