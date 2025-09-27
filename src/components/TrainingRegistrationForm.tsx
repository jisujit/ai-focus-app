import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Calendar, Clock, Users, DollarSign, CheckCircle, Send, CreditCard, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";
import { PaymentFormData, PaymentResult } from "@/integrations/stripe/types";
import { PricingService, Session, PricingInfo } from "@/services/pricingService";

interface TrainingRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  trainingTitle: string;
  serviceId?: string;
}

const TrainingRegistrationForm: React.FC<TrainingRegistrationFormProps> = ({
  isOpen,
  onClose,
  trainingTitle,
  serviceId
}) => {
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSessionUuid, setSelectedSessionUuid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (serviceId) {
      fetchSessions();
    }
  }, [serviceId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log("TrainingRegistrationForm: Starting to fetch sessions...");
      console.log("TrainingRegistrationForm: ServiceId:", serviceId);
      
      const data = await PricingService.getSessions(serviceId);
      console.log("TrainingRegistrationForm: Fetched sessions:", data);
      console.log("TrainingRegistrationForm: Session IDs:", data.map(s => s.id));
      
      // Check if location fields are present
      if (data.length > 0) {
        console.log("TrainingRegistrationForm: All fetched sessions:");
        data.forEach((session, index) => {
          console.log(`Session ${index}:`, {
            id: session.id,
            session_id: session.session_id,
            date: session.date,
            location_name: session.location_name,
            is_virtual: session.is_virtual
          });
        });
        
        console.log("TrainingRegistrationForm: First session location fields:", {
          is_virtual: data[0].is_virtual,
          location_name: data[0].location_name,
          location_address: data[0].location_address,
          location_city: data[0].location_city,
          location_state: data[0].location_state,
          location_phone: data[0].location_phone,
          location_notes: data[0].location_notes,
          virtual_link: data[0].virtual_link,
          location_confirmed_by: data[0].location_confirmed_by,
          parking_info: data[0].parking_info,
          driving_directions: data[0].driving_directions
        });
      }
      
      setSessions(data);
      console.log("TrainingRegistrationForm: Sessions set successfully");
    } catch (error) {
      console.error("TrainingRegistrationForm: Error fetching sessions:", error);
      console.error("TrainingRegistrationForm: Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast({
        title: "Error",
        description: `Failed to load sessions: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPricing = async (sessionId: string) => {
    try {
      const pricing = await PricingService.getSessionPricing(sessionId);
      setPricingInfo(pricing);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing information",
        variant: "destructive",
      });
    }
  };

  const handleSessionChange = (sessionId: string) => {
    console.log("TrainingRegistrationForm: Session changed to:", sessionId);
    console.log("TrainingRegistrationForm: Available sessions:", sessions.map(s => ({ id: s.id, session_id: s.session_id, date: s.date })));
    console.log("TrainingRegistrationForm: Looking for session with session_id:", sessionId);
    const foundSession = sessions.find(s => s.session_id === sessionId);
    console.log("TrainingRegistrationForm: Found session:", foundSession);
    
    // Store the UUID id for database operations, but keep session_id for display
    const actualSessionId = foundSession ? foundSession.id : sessionId;
    console.log("TrainingRegistrationForm: Using UUID for database:", actualSessionId);
    
    // Store both the session_id for RadioGroup display and UUID for database operations
    setSelectedSession(sessionId); // Use session_id for RadioGroup matching
    setSelectedSessionUuid(actualSessionId); // Store UUID separately for database operations
    fetchPricing(sessionId); // Still use session_id for pricing lookup
  };

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

    // Show payment form instead of directly submitting
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    if (result.success) {
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
      setSelectedSessionUuid("");
      setShowPaymentForm(false);
      onClose();
    }
  };

  const getPaymentFormData = (): PaymentFormData => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      jobTitle: formData.jobTitle,
      experienceLevel: formData.experience,
      expectations: formData.expectations,
      amount: pricingInfo ? pricingInfo.final_price : 0,
      currency: 'usd'
    };
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
                      {pricingInfo ? (
                        <>
                          {pricingInfo.discount_amount > 0 && (
                            <div className="text-sm text-muted-foreground line-through">
                              {PricingService.formatPrice(pricingInfo.base_price)} per person
                            </div>
                          )}
                          <div className="font-semibold text-success">
                            {PricingService.formatPrice(pricingInfo.final_price)} per person
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pricingInfo.is_early_bird ? "Early Bird Price" : "Regular Price"}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">Select a session to see pricing</div>
                      )}
                    </div>
                  </div>
                </div>
                {pricingInfo && pricingInfo.discount_amount > 0 && (
                  <div className="pt-2">
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {pricingInfo.is_early_bird ? "Early Bird Discount" : "Special Pricing"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Information */}
    {selectedSession && (() => {
      // selectedSession now contains the session_id, so find by session_id
      const session = sessions.find(s => s.session_id === selectedSession);
      console.log("Selected session:", session);
      console.log("Location card should render for session:", selectedSession);
      console.log("Available sessions:", sessions.map(s => ({ id: s.id, session_id: s.session_id, date: s.date })));
      if (!session) {
        console.log("No session found for session_id:", selectedSession);
        console.log("This means the selectedSession ID doesn't match any session in the sessions array");
        return null;
      }
              
              console.log("Rendering location card for session:", session.id);
              console.log("Session date:", session.date);
              console.log("Session location fields:", {
                location_name: session.location_name,
                location_address: session.location_address,
                is_virtual: session.is_virtual
              });

              return (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Session Location
                    </h4>
                    
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mb-2">
                      Debug: is_virtual={String(session.is_virtual)}, has_location_name={String(!!session.location_name)}
                    </div>
                    
                    {session.is_virtual ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-700">Virtual Session</span>
                        </div>
                        {session.virtual_link && (
                          <div className="text-xs text-muted-foreground">
                            Meeting link will be provided via email
                          </div>
                        )}
                        {session.location_notes && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Note:</strong> {session.location_notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {session.location_name && (
                          <div className="text-sm font-medium text-foreground">
                            {session.location_name}
                          </div>
                        )}
                        
                        {(session.location_address || session.location_city) && (
                          <div className="text-xs text-muted-foreground">
                            {session.location_address && (
                              <div>{session.location_address}</div>
                            )}
                            {session.location_city && session.location_state && (
                              <div>{session.location_city}, {session.location_state} {session.location_zip}</div>
                            )}
                          </div>
                        )}
                        
                        {session.location_phone && (
                          <div className="text-xs text-muted-foreground">
                            📞 {session.location_phone}
                          </div>
                        )}
                        
                        {session.parking_info && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Parking:</strong> {session.parking_info}
                          </div>
                        )}
                        
                        {session.driving_directions && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Directions:</strong> {session.driving_directions}
                          </div>
                        )}
                        
                        {session.location_confirmed_by && (
                          <div className="text-xs text-orange-600 mt-2">
                            ⏰ Location confirmed by {new Date(session.location_confirmed_by).toLocaleDateString()}
                          </div>
                        )}
                        
                        {session.location_notes && (
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Note:</strong> {session.location_notes}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Fallback when no location info is available */}
                    {!session.is_virtual && !session.location_name && !session.location_address && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Location details to be confirmed</span>
                        </div>
                        {session.location_confirmed_by && (
                          <div className="mt-1 text-orange-600">
                            ⏰ Location confirmed by {new Date(session.location_confirmed_by).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Always show this for testing */}
                    <div className="text-xs text-blue-600 mt-2">
                      ✅ Location card is working! Session ID: {session.id || 'unknown'}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sessions available for this training.</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedSession} onValueChange={handleSessionChange}>
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={session.session_id} id={session.session_id} />
                        <Label 
                          className="flex-1 cursor-pointer border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Session {session.session_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {(() => {
                                  // Parse date string directly to avoid timezone issues
                                  const dateStr = session.date.split('T')[0]; // Get just the date part
                                  const [year, month, day] = dateStr.split('-');
                                  return `${month}/${day}/${year}`;
                                })()} @ {session.time}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {PricingService.getAvailabilityText(session.current_registrations, session.max_capacity)}
                              </Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="w-4 h-4 mr-1" />
                                {session.current_registrations}/{session.max_capacity}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Pricing Information */}
              {pricingInfo && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Pricing Information</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {PricingService.formatPrice(pricingInfo.final_price)}
                      </div>
                      {pricingInfo.discount_amount > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="line-through">{PricingService.formatPrice(pricingInfo.base_price)}</span>
                          <span className="ml-2 text-green-600 font-semibold">
                            Save {PricingService.formatPrice(pricingInfo.discount_amount)} ({pricingInfo.discount_type})
                          </span>
                        </div>
                      )}
                    </div>
                    {pricingInfo.is_early_bird && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Early Bird Pricing
                      </Badge>
                    )}
                  </div>
                  {pricingInfo.days_until_session > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {pricingInfo.days_until_session} days until session
                    </p>
                  )}
                </div>
              )}

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
                  <Label>Current AI Experience Level</Label>
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
                  disabled={isSubmitting || !selectedSession || !pricingInfo}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Processing..." : `Register & Pay ${pricingInfo ? PricingService.formatPrice(pricingInfo.final_price) : '--'}`}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        onPaymentSuccess={handlePaymentSuccess}
        formData={getPaymentFormData()}
        trainingTitle={trainingTitle}
        sessionId={selectedSessionUuid}
      />
    </Dialog>
  );
};

export default TrainingRegistrationForm;