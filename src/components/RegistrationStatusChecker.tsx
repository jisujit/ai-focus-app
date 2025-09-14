import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Calendar, Clock, Mail, Phone, Building, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  session_id: string;
  training_title: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  phone?: string;
  job_title?: string;
  experience_level?: string;
  expectations?: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  phone?: string;
  training_interests?: string[];
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const RegistrationStatusChecker = () => {
  const [email, setEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-registration-status', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        setRegistrations(data.registrations || []);
        setContactSubmissions(data.contactSubmissions || []);
        setHasSearched(true);
        
        toast({
          title: "Status Retrieved",
          description: `Found ${data.registrations?.length || 0} registrations and ${data.contactSubmissions?.length || 0} contact submissions`,
        });
      } else {
        throw new Error(data.error || "Failed to check status");
      }
    } catch (error: any) {
      console.error('Status check error:', error);
      toast({
        title: "Failed to Check Status",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, type: 'registration' | 'contact' = 'registration') => {
    const statusConfig = {
      registration: {
        pending: { label: "Pending", variant: "secondary" as const },
        confirmed: { label: "Confirmed", variant: "default" as const },
        paid: { label: "Paid", variant: "default" as const },
        cancelled: { label: "Cancelled", variant: "destructive" as const }
      },
      contact: {
        new: { label: "New", variant: "secondary" as const },
        responded: { label: "Responded", variant: "default" as const },
        closed: { label: "Closed", variant: "outline" as const }
      }
    };

    const typeConfig = statusConfig[type];
    const config = (typeConfig as any)[status] || { label: status, variant: "outline" as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Search className="w-5 h-5 mr-2" />
          Check Registration Status
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <Search className="w-6 h-6 text-accent mr-3" />
            Check Your Registration Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enter Your Email</CardTitle>
              <CardDescription>
                We'll look up all your training registrations and contact submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="statusEmail">Email Address</Label>
                  <Input
                    id="statusEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCheck} 
                    disabled={isChecking}
                    className="min-w-[120px]"
                  >
                    {isChecking ? "Checking..." : "Check Status"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {hasSearched && (
            <div className="space-y-6">
              {/* Training Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Training Registrations ({registrations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No training registrations found for this email address.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((registration) => (
                        <Card key={registration.id} className="border-l-4 border-l-accent">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">
                                  {registration.training_title}
                                </h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {registration.first_name} {registration.last_name}
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {registration.email}
                                  </div>
                                  {registration.company && (
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-2" />
                                      {registration.company}
                                    </div>
                                  )}
                                  {registration.phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 mr-2" />
                                      {registration.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  {getStatusBadge(registration.status)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Payment:</span>
                                  {getStatusBadge(registration.payment_status)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Session:</span>
                                  <Badge variant="outline">{registration.session_id}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Registered: {formatDate(registration.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Submissions ({contactSubmissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contactSubmissions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No contact submissions found for this email address.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {contactSubmissions.map((submission) => (
                        <Card key={submission.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {submission.first_name} {submission.last_name}
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {submission.email}
                                  </div>
                                  {submission.company && (
                                    <div className="flex items-center">
                                      <Building className="w-4 h-4 mr-2" />
                                      {submission.company}
                                    </div>
                                  )}
                                </div>
                                {submission.training_interests && submission.training_interests.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-sm text-muted-foreground">Interests: </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {submission.training_interests.map((interest, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {interest}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  {getStatusBadge(submission.status, 'contact')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Submitted: {formatDate(submission.created_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {submission.message && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <span className="text-sm text-muted-foreground">Message:</span>
                                <p className="text-sm mt-1 bg-muted p-2 rounded">
                                  {submission.message}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationStatusChecker;