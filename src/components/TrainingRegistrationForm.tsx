import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Calendar, Clock, Users, DollarSign, CheckCircle, Send, CreditCard } from "lucide-react";
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
      const data = await PricingService.getSessions(serviceId);
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load available sessions",
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
    setSelectedSession(sessionId);
    fetchPricing(sessionId);
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
                                {new Date(session.date).toLocaleDateString()} @ {session.time}
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
        sessionId={selectedSession}
      />
    </Dialog>
  );
};

export default TrainingRegistrationForm;