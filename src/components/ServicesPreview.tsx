import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Brain, 
  Cog, 
  TrendingUp, 
  Users, 
  ArrowRight,
  CheckCircle
} from "lucide-react";

const ServicesPreview = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      icon: Brain,
      title: "AI Strategy & Implementation",
      description: "Build practical AI roadmaps aligned with your business objectives and implement cutting-edge solutions.",
      features: ["Strategic AI Planning", "ROI Assessment", "Implementation Roadmap"]
    },
    {
      icon: Cog,
      title: "Machine Learning Training",
      description: "Hands-on ML and GenAI training programs designed for real-world business applications.",
      features: ["Practical ML Models", "Generative AI", "Data Science Fundamentals"]
    },
    {
      icon: TrendingUp,
      title: "Automation & DevOps",
      description: "Master infrastructure automation, CI/CD pipelines, and cloud transformation strategies.",
      features: ["Terraform & Ansible", "CI/CD Pipelines", "Cloud Migration"]
    },
    {
      icon: Users,
      title: "Corporate Training",
      description: "Customized training programs for teams and organizations ready to embrace AI transformation.",
      features: ["Team Workshops", "Leadership Training", "Change Management"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-foreground mb-4">
            Comprehensive AI Training Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From strategic planning to hands-on implementation, our training programs 
            are designed to transform your organization's AI capabilities.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-lift bg-white border-0 shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </CardDescription>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="professional" 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => navigate('/services')}
          >
            View All Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;