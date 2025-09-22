import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TrainingRegistrationForm from "@/components/TrainingRegistrationForm";
import { PricingService, Service, Session } from "@/services/pricingService";
import { 
  Brain, 
  Cog, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  Calendar
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
    fetchSessions();
  }, []);

  const fetchServices = async () => {
    try {
      console.log("Fetching services...");
      const data = await PricingService.getServices();
      console.log("Services fetched:", data);
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await PricingService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Brain,
      Cog,
      TrendingUp,
      Users,
      Clock,
      CheckCircle,
      ArrowRight,
      Star,
      DollarSign
    };
    return icons[iconName] || Brain;
  };

  const getServiceSessions = (serviceId: string) => {
    return sessions.filter(session => session.service_id === serviceId);
  };

  const handleRegisterClick = (service: Service) => {
    const serviceSessions = getServiceSessions(service.id);
    if (serviceSessions.length > 0) {
      setSelectedService(service);
      setShowRegistrationForm(true);
    } else {
      window.location.href = `mailto:sujit@ai-focus.org?subject=Training Registration - ${service.title}`;
    }
  };

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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Services Available</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no training services available.
              </p>
              <Button 
                onClick={() => window.location.href = '/admin'}
                variant="outline"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service) => {
                const IconComponent = getIconComponent(service.icon);
                const serviceSessions = getServiceSessions(service.id);
                const hasAvailableSessions = serviceSessions.length > 0;
                
                return (
                  <Card key={service.id} className={`relative overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover-lift ${service.available && hasAvailableSessions ? 'border-accent shadow-glow' : 'border-muted-foreground/20'}`}>
                <div className="absolute top-4 right-4">
                      {service.available && hasAvailableSessions ? (
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available Now
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          {service.available ? "No Sessions" : "Coming Soon"}
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                          <IconComponent className="w-6 h-6 text-white" />
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
                        {/* Pricing Information */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-foreground">Pricing</span>
                            {service.early_bird_price && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Early Bird Available
                              </Badge>
                            )}
                          </div>
                          
                          {service.early_bird_price ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl font-bold text-green-600">
                                  {PricingService.formatPrice(service.early_bird_price)}
                                </div>
                                <div className="text-lg text-muted-foreground line-through">
                                  {PricingService.formatPrice(service.base_price)}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Early bird pricing ends {service.early_bird_days} days before session
                              </p>
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-foreground">
                              {PricingService.formatPrice(service.base_price)}
                            </div>
                          )}
                        </div>

                        {/* Available Sessions */}
                        {hasAvailableSessions && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-foreground mb-3">Available Sessions:</h4>
                            <div className="space-y-2">
                              {serviceSessions.slice(0, 3).map((session) => (
                                <div key={session.id} className="flex items-center justify-between text-sm bg-muted/20 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    <span>{new Date(session.date).toLocaleDateString()}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span>{session.time}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className={PricingService.getAvailabilityColor(session.current_registrations, session.max_capacity)}>
                                      {PricingService.getAvailabilityText(session.current_registrations, session.max_capacity)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {serviceSessions.length > 3 && (
                                <p className="text-sm text-muted-foreground text-center">
                                  +{serviceSessions.length - 3} more sessions available
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                    {/* Session Outline for Available Training */}
                        {service.available && service.session_outline && service.session_outline.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">Session Outline:</h4>
                        <ul className="space-y-2">
                              {service.session_outline.map((outline, outlineIndex) => (
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
                              onClick={() => window.location.href = 'mailto:sujit@ai-focus.org?subject=Pricing Inquiry - ' + service.title}
                        >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Pricing Details
                        </Button>
                        <Button 
                              variant={service.available && hasAvailableSessions ? "professional" : "outline"} 
                              disabled={!service.available || !hasAvailableSessions}
                              onClick={() => handleRegisterClick(service)}
                            >
                              {service.available && hasAvailableSessions ? "Register Now" : 
                               service.available ? "No Sessions Available" : "Notify When Available"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                );
              })}
          </div>
          )}
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
      {selectedService && (
      <TrainingRegistrationForm 
        isOpen={showRegistrationForm}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedService(null);
          }}
          trainingTitle={selectedService.title}
          serviceId={selectedService.id}
        />
      )}
    </Layout>
  );
};

export default Services;