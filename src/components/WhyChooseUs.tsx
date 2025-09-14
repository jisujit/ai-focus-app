import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, Users, TrendingUp } from "lucide-react";

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Award,
      title: "30+ Years Experience",
      description: "Led by Sujit Gangadharan with extensive IT leadership and AI implementation experience"
    },
    {
      icon: Users,
      title: "Practical Approach",
      description: "Real-world case studies and hands-on training that directly applies to your business"
    },
    {
      icon: Clock,
      title: "Proven Results",
      description: "98% success rate with over 500 professionals trained in AI and automation"
    },
    {
      icon: TrendingUp,
      title: "Enterprise Focus",
      description: "Specialized in large-scale AI adoption and digital transformation strategies"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-foreground mb-4">
            Why Choose AI Focus Academy?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We combine deep technical expertise with practical business experience 
            to deliver training that drives real results.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;