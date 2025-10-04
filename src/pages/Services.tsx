import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TrainingRegistrationForm from "@/components/TrainingRegistrationForm";
import ServicesSearch from "@/components/ServicesSearch";
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
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const Services = () => {
  const navigate = useNavigate();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchServices();
    fetchSessions();
  }, []);

  // Sort services when both services and sessions are loaded
  useEffect(() => {
    if (services.length > 0 && sessions.length >= 0) {
      const sortedServices = sortServices([...services], sessions);
      setServices(sortedServices);
      setFilteredServices(sortedServices);
    }
  }, [sessions]); // Re-sort when sessions change

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

  // Sort services with smart business logic
  const sortServices = (servicesList: Service[], sessionsList: Session[]) => {
    return servicesList.sort((a, b) => {
      // First sort by status: active > coming_soon > others
      const statusOrder = { 'active': 0, 'coming_soon': 1, 'draft': 2, 'archived': 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      
      if (statusDiff !== 0) return statusDiff;
      
      // For same status, sort by next upcoming session date
      const aNextSession = getNextSessionDate(a.id, sessionsList);
      const bNextSession = getNextSessionDate(b.id, sessionsList);
      
      if (aNextSession && bNextSession) {
        return new Date(aNextSession).getTime() - new Date(bNextSession).getTime();
      }
      
      if (aNextSession && !bNextSession) return -1;
      if (!aNextSession && bNextSession) return 1;
      
      // If no sessions, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
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

  const getNextSessionDate = (serviceId: string, sessionsList: Session[]) => {
    const serviceSessions = sessionsList.filter(session => session.service_id === serviceId);
    const now = new Date();
    
    // Find the next upcoming session
    const upcomingSessions = serviceSessions
      .filter(session => new Date(session.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingSessions.length > 0 ? upcomingSessions[0].date : null;
  };

  const handleRegisterClick = (service: Service) => {
    // Only allow registration if service is active and allows registration
    if (service.status !== 'active' || !service.allow_registration) {
      console.log("Registration not allowed for this service");
      return;
    }
    
    const serviceSessions = getServiceSessions(service.id);
    if (serviceSessions.length > 0) {
      setSelectedService(service);
      setShowRegistrationForm(true);
    } else {
      window.location.href = `mailto:info@ai-focus.org?subject=Training Registration - ${service.title}`;
    }
  };

  const toggleCardExpansion = (serviceId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero text-white" role="banner">
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

      {/* Search Section */}
      <ServicesSearch 
        services={services}
        onFilteredServices={setFilteredServices}
      />

      {/* Services Grid */}
      <section id="main-content" className="py-12 bg-background" role="main" aria-label="Training services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no training services available for registration.
              </p>
              <Button 
                onClick={() => window.location.href = '/admin'}
                variant="outline"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Available training services">
              {filteredServices
                .filter(service => service.status !== 'draft' && service.status !== 'archived') // Hide draft and archived services
                .map((service) => {
                const IconComponent = getIconComponent(service.icon);
                const serviceSessions = getServiceSessions(service.id);
                const hasAvailableSessions = serviceSessions.length > 0;
                
                const isExpanded = expandedCards.has(service.id);
                
                return (
                  <Card 
                    key={service.id} 
                    className={`relative overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 hover-lift ${service.status === 'active' && service.allow_registration && hasAvailableSessions ? 'border-accent shadow-glow' : 'border-muted-foreground/20'}`}
                    role="listitem"
                    aria-labelledby={`service-title-${service.id}`}
                  >
                    {/* Ultra-Compact Header */}
                    <div className="p-4 pb-3">
                      {/* Title Row with Icon */}
                      <div className="flex items-start space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center shadow-soft flex-shrink-0 mt-0.5">
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 
                              id={`service-title-${service.id}`}
                              className="text-base font-semibold text-foreground leading-tight"
                            >
                              {service.title}
                            </h3>
                            <div className="flex-shrink-0 ml-2">
                              {service.status === 'active' && service.allow_registration && hasAvailableSessions ? (
                                <Badge className="bg-success text-success-foreground text-xs px-2 py-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Available
                                </Badge>
                              ) : service.status === 'coming_soon' ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-2 py-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Soon
                                </Badge>
                              ) : service.status === 'active' && !hasAvailableSessions ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  No Sessions
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs px-2 py-1">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>
                          {/* Description */}
                          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                            {isExpanded ? service.description : `${service.description.substring(0, 150)}${service.description.length > 150 ? '...' : ''}`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Compact Info Row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration}
                        </div>
                        <span className="text-muted-foreground/50">•</span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{service.level}</Badge>
                        <span className="text-muted-foreground/50">•</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">{service.format}</Badge>
                        {service.show_pricing && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {service.early_bird_price ? (
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-foreground text-xs">
                                    {PricingService.formatPrice(service.early_bird_price)}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {PricingService.formatPrice(service.base_price)}
                                  </span>
                                  <span className="text-green-600 text-xs font-medium">Early Bird</span>
                                </div>
                              ) : (
                                <span className="font-medium text-foreground text-xs">
                                  {PricingService.formatPrice(service.base_price)}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/50">
                        {/* Full Description */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {service.description}
                          </p>
                        </div>

                        {/* Available Sessions - Full View */}
                        {hasAvailableSessions && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">
                              Available Sessions ({serviceSessions.length})
                            </h4>
                            <div className="space-y-2">
                              {serviceSessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between text-sm bg-muted/20 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    <div>
                                      <div className="font-medium">{new Date(session.date).toLocaleDateString()}</div>
                                      <div className="text-xs text-muted-foreground">{session.time}</div>
                                      {session.location && (
                                        <div className="text-xs text-muted-foreground">{session.location}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${PricingService.getAvailabilityColor(session.current_registrations, session.max_capacity)}`}>
                                      {PricingService.getAvailabilityText(session.current_registrations, session.max_capacity)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {session.current_registrations}/{session.max_capacity} registered
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Session Outline */}
                        {service.session_outline && service.session_outline.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Session Outline</h4>
                            <div className="space-y-2">
                              {service.session_outline.map((outline, index) => (
                                <div key={index} className="flex items-start text-sm text-muted-foreground">
                                  <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs font-medium text-accent mr-3 flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </div>
                                  <span>{outline}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Learning Outcomes - Full List */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Key Learning Outcomes</h4>
                          <div className="space-y-2">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-accent mr-3 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="px-4 pb-4">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant={service.status === 'active' && service.allow_registration && hasAvailableSessions ? "professional" : "outline"}
                          disabled={service.status !== 'active' || !service.allow_registration || !hasAvailableSessions}
                          onClick={() => handleRegisterClick(service)}
                          className="w-full"
                          size="sm"
                          aria-label={`Register for ${service.title} training`}
                        >
                          {service.status === 'active' && service.allow_registration && hasAvailableSessions ? "Register Now" : 
                           service.status === 'coming_soon' ? "Coming Soon" :
                           !hasAvailableSessions ? "No Sessions Available" : "Registration Closed"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        
                        {/* Expand/Collapse Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(service.id)}
                          className="w-full text-xs text-muted-foreground hover:text-foreground"
                          aria-label={isExpanded ? `Collapse ${service.title} details` : `Expand ${service.title} details`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-card">
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
              onClick={() => {
                // Find the AI Fundamentals service and set it as selected
                const aiFundamentalsService = services.find(service => 
                  service.title.toLowerCase().includes('ai fundamentals') || 
                  service.title.toLowerCase().includes('chatgpt mastery')
                );
                if (aiFundamentalsService) {
                  setSelectedService(aiFundamentalsService);
                  setShowRegistrationForm(true);
                } else {
                  // Fallback to email if service not found
                  window.location.href = 'mailto:info@ai-focus.org?subject=AI Fundamentals Training Registration';
                }
              }}
            >
              Register for AI Fundamentals Training
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = 'mailto:info@ai-focus.org?subject=Training Updates Subscription'}
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