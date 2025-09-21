import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Brain, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <Brain className="w-4 h-4 text-accent-glow" />
            <span className="text-white/90 text-sm font-medium">Leading AI Training Academy</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-white mb-6 max-w-4xl mx-auto leading-tight">
            Transform Your Business with 
            <span className="gradient-text bg-gradient-to-r from-accent-glow to-white bg-clip-text text-transparent"> AI Excellence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Expert-led training programs in AI, machine learning, and automation. 
            Led by Sujit Gangadharan with 30+ years of IT leadership experience.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center space-x-8 mb-12 text-white/80">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-accent-glow" />
              <span className="font-semibold">500+ Professionals Trained</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent-glow" />
              <span className="font-semibold">98% Success Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-accent-glow" />
              <span className="font-semibold">Enterprise-Grade Training</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => navigate('/services')}
            >
              Start Your AI Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline-white" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.open('https://calendly.com/ai-focus-academy/demo', '_blank')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Call
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;