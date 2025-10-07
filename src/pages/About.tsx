import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Cloud, 
  Cog, 
  TrendingUp, 
  Users, 
  Award,
  Building,
  GraduationCap,
  ArrowRight,
  Linkedin,
  Mail
} from "lucide-react";
// Import the image with a different approach to avoid cache issues
import sujitPhoto from "@/assets/sujit-professional.jpg";

const About = () => {
  const expertise = [
    {
      icon: Cog,
      title: "Infrastructure Automation & DevOps",
      description: "Proven leadership in architecting enterprise automation using Terraform, Ansible, and CI/CD pipelines—driving consistency, scalability, and operational efficiency across environments."
    },
    {
      icon: Cloud,
      title: "Cloud & Digital Transformation",
      description: "Expertise in modernizing technology landscapes with Azure and hybrid cloud solutions, aligning infrastructure evolution with business outcomes."
    },
    {
      icon: Brain,
      title: "AI Strategy & Enterprise Adoption",
      description: "Advocating and enabling practical AI adoption through responsible experimentation, process integration, and workforce readiness."
    },
    {
      icon: Users,
      title: "Corporate Training & Workforce Upskilling",
      description: "Designing and delivering hands-on programs that simplify complex technologies—empowering professionals to apply AI and automation effectively in their roles."
    },
    {
      icon: TrendingUp,
      title: "Leadership & Change Management",
      description: "Guiding teams through technology and cultural transformation by fostering collaboration, adaptability, and continuous learning."
    },
    {
      icon: GraduationCap,
      title: "Generative AI & Emerging Technologies",
      description: "Exploring real-world applications of Generative AI tools and frameworks to enhance automation, creativity, and productivity in enterprise and individual use cases."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="mb-6">About AI Focus Academy</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              Empowering businesses and professionals with practical, hands-on AI knowledge—enabling 
              them to innovate, automate, and thrive in an AI-driven future.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Professional Photo */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="w-full h-[28rem] bg-gradient-card rounded-2xl shadow-strong overflow-hidden">
                  <img 
                    src={sujitPhoto} 
                    alt="Sujit Gangadharan - AI & Automation Strategist"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      console.log('Image failed to load, trying fallback');
                      e.currentTarget.src = '/src/assets/sujit-professional.jpg';
                    }}
                  />
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-strong p-4 border border-accent/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">30+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="mb-6">
                <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
                  Founder & Lead Trainer
                </Badge>
                <h2 className="text-foreground mb-2">About Sujit Gangadharan</h2>
                <p className="text-xl text-accent font-semibold mb-6">
                  AI & Automation Strategist | Senior Technology Leader
                </p>
              </div>

              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  With nearly 30 years of experience leading digital transformation, automation, and infrastructure 
                  modernization, Sujit Gangadharan brings a rare blend of strategic vision and hands-on technical 
                  expertise. He has guided enterprise-scale automation and DevOps initiatives, helping organizations 
                  simplify operations, improve reliability, and build a culture of continuous innovation.
                </p>
                <p>
                  Over the past few years, Sujit has been an active advocate for responsible AI adoption—exploring 
                  how practical, real-world AI applications can enhance productivity, decision-making, and automation. 
                  His focus lies in bridging the gap between technology and people—making complex innovations accessible 
                  and actionable for professionals and businesses alike.
                </p>
                <div className="bg-gradient-card p-6 rounded-xl border border-accent/10">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center">
                    <Award className="w-5 h-5 text-accent mr-2" />
                    Mission Statement
                  </h4>
                  <p className="text-foreground italic">
                    "To help professionals and organizations understand and apply AI in practical ways—empowering 
                    them to innovate, automate, and succeed in an AI-driven world."
                  </p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  variant="professional" 
                  className="flex items-center"
                  onClick={() => window.open('https://www.linkedin.com/in/sujitg/', '_blank')}
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Connect on LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => window.location.href = 'mailto:sujit@ai-focus.org?subject=Training Inquiry'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Sujit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-gradient-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">Areas of Expertise</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deep expertise in automation, cloud transformation, and emerging AI technologies. Comprehensive knowledge spanning AI strategy, technical implementation, 
              and organizational transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertise.map((area, index) => (
              <Card key={index} className="hover-lift shadow-soft hover:shadow-medium transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-soft">
                    <area.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {area.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Highlight */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-strong border-0 bg-gradient-card">
            <CardContent className="p-8 md:p-12 text-center">
              <Building className="w-16 h-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Enterprise Leadership Experience
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Currently serving in a senior technology leadership role, Sujit leads enterprise initiatives in
                automation and DevOps engineering, with a growing focus on leveraging AI to enhance efficiency
                and innovation across digital transformation efforts.
              </p>
              <Button 
                variant="professional" 
                size="lg"
                onClick={() => window.location.href = 'mailto:info@ai-focus.org?subject=Enterprise Training Programs'}
              >
                Learn About Our Enterprise Programs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default About;