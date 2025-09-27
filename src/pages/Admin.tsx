import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TestDataService } from "@/services/testDataService";
import { showTestTools } from "@/utils/environment";
import AdminAuth from "@/components/AdminAuth";

interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  format: string;
  base_price: number;
  early_bird_price?: number;
  early_bird_days: number;
  features: string[];
  session_outline?: string[];
  icon: string;
  available: boolean;
}

interface Session {
  id: string;
  service_id: string;
  session_id: string;
  date: string;
  time: string;
  max_capacity: number;
  current_registrations: number;
  status: string;
  service_title?: string;
}

const Admin = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [testDataStatus, setTestDataStatus] = useState({ services: 0, sessions: 0, registrations: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    duration: "",
    level: "",
    format: "",
    base_price: 0,
    early_bird_price: 0,
    early_bird_days: 7,
    features: "",
    session_outline: "",
    icon: "Brain",
    available: true
  });

  const [sessionForm, setSessionForm] = useState({
    service_id: "",
    session_id: "",
    date: "",
    time: "",
    max_capacity: 20,
    status: "active",
    location_name: "",
    location_address: "",
    location_city: "",
    location_state: "",
    location_zip: "",
    location_phone: "",
    location_notes: "",
    is_virtual: false,
    virtual_link: "",
    location_confirmed_by: "",
    parking_info: "",
    driving_directions: ""
  });

  useEffect(() => {
    // Check if already authenticated
    const isAuth = sessionStorage.getItem("admin_authenticated") === "true";
    setIsAuthenticated(isAuth);
    
    if (isAuth) {
      fetchServices();
      fetchSessions();
      if (showTestTools) {
        fetchTestDataStatus();
      }
    }
  }, [showTestTools]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    fetchServices();
    fetchSessions();
    if (showTestTools) {
      fetchTestDataStatus();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_email");
    setIsAuthenticated(false);
  };

  const fetchServices = async () => {
    try {
      console.log("Admin: Fetching services...");
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("Admin: Services query result:", { data, error });
      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Admin: Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    }
  };

  const fetchSessions = async () => {
    try {
      console.log("Admin: Fetching sessions...");
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          services!inner(title)
        `)
        .order("date", { ascending: true });

      console.log("Admin: Sessions query result:", { data, error });
      if (error) throw error;
      setSessions(data?.map(s => ({
        ...s,
        service_title: s.services?.title
      })) || []);
    } catch (error: any) {
      console.error("Admin: Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    }
  };

  const fetchTestDataStatus = async () => {
    try {
      const status = await TestDataService.getTestDataStatus();
      setTestDataStatus(status);
    } catch (error) {
      console.error("Error fetching test data status:", error);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset ALL data? This cannot be undone!")) return;
    
    try {
      const result = await TestDataService.resetAllData();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchServices();
        fetchSessions();
        fetchTestDataStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSeedData = async () => {
    try {
      console.log("Admin: Starting to seed test data...");
      
      // First, test database connection
      console.log("Admin: Testing database connection...");
      const { data: testData, error: testError } = await supabase
        .from("services")
        .select("count")
        .limit(1);
      
      console.log("Admin: Database connection test:", { testData, testError });
      
      if (testError) {
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      const result = await TestDataService.seedTestData();
      console.log("Admin: Seed data result:", result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        console.log("Admin: Refreshing data after successful seed...");
        fetchServices();
        fetchSessions();
        fetchTestDataStatus();
      } else {
        console.error("Admin: Seed data failed:", result.message);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Admin: Seed data error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearRegistrations = async () => {
    if (!confirm("Are you sure you want to clear all registrations?")) return;
    
    try {
      const result = await TestDataService.clearAllRegistrations();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchSessions();
        fetchTestDataStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTestUsers = async () => {
    try {
      const result = await TestDataService.createTestUsers();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        fetchSessions();
        fetchTestDataStatus();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...serviceForm,
        features: serviceForm.features.split('\n').filter(f => f.trim()),
        session_outline: serviceForm.session_outline.split('\n').filter(f => f.trim()),
        early_bird_price: serviceForm.early_bird_price || null
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("services")
          .insert([serviceData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }

      setShowServiceDialog(false);
      setEditingService(null);
      resetServiceForm();
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Admin: Submitting session form:", sessionForm);
      
      // Validate required date field
      if (!sessionForm.date) {
        throw new Error("Date is required");
      }
      
      console.log("Admin: Date debugging:");
      console.log("- Form date input:", sessionForm.date);
      console.log("- Date object:", new Date(sessionForm.date));
      console.log("- ISO string:", new Date(sessionForm.date).toISOString());
      console.log("- Local date string:", new Date(sessionForm.date).toLocaleDateString());
      
      // Fix timezone issue by creating date at noon UTC to avoid day shift
      const dateObj = new Date(sessionForm.date);
      dateObj.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid timezone issues
      
      const sessionData = {
        ...sessionForm,
        date: dateObj.toISOString()
      };
      console.log("Admin: Processed session data:", sessionData);

      if (editingSession) {
        console.log("Admin: Updating session with ID:", editingSession.id);
        
        // Remove computed fields that don't exist in the database
        const { service_title, ...updateData } = sessionData;
        
        // Handle empty date fields - convert empty strings to null
        if (updateData.location_confirmed_by === "") {
          updateData.location_confirmed_by = null;
        }
        
        console.log("Admin: Filtered update data:", updateData);
        
        const { error } = await supabase
          .from("sessions")
          .update(updateData)
          .eq("id", editingSession.id);

        console.log("Admin: Session update result:", { error });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Session updated successfully",
        });
      } else {
        console.log("Admin: Creating new session");
        
        // Remove computed fields that don't exist in the database
        const { service_title, ...insertData } = sessionData;
        
        // Handle empty date fields - convert empty strings to null
        if (insertData.location_confirmed_by === "") {
          insertData.location_confirmed_by = null;
        }
        
        console.log("Admin: Filtered insert data:", insertData);
        
        const { error } = await supabase
          .from("sessions")
          .insert([insertData]);

        console.log("Admin: Session create result:", { error });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Session created successfully",
        });
      }

      setShowSessionDialog(false);
      setEditingSession(null);
      resetSessionForm();
      fetchSessions();
    } catch (error: any) {
      console.error("Admin: Session submit error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      title: "",
      description: "",
      duration: "",
      level: "",
      format: "",
      base_price: 0,
      early_bird_price: 0,
      early_bird_days: 7,
      features: "",
      session_outline: "",
      icon: "Brain",
      available: true
    });
  };

  const resetSessionForm = () => {
    setSessionForm({
      service_id: "",
      session_id: "",
      date: "",
      time: "",
      max_capacity: 20,
      status: "active",
      location_name: "",
      location_address: "",
      location_city: "",
      location_state: "",
      location_zip: "",
      location_phone: "",
      location_notes: "",
      is_virtual: false,
      virtual_link: "",
      location_confirmed_by: "",
      parking_info: "",
      driving_directions: ""
    });
  };

  const editService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      ...service,
      features: service.features.join('\n'),
      session_outline: service.session_outline?.join('\n') || "",
      early_bird_price: service.early_bird_price || 0
    });
    setShowServiceDialog(true);
  };

  const editSession = (session: Session) => {
    console.log("Admin: Editing session:", session);
    
    try {
      // Test if we can access the session data properly
      console.log("Admin: Session date:", session.date);
      console.log("Admin: Session ID:", session.id);
      console.log("Admin: Session service_id:", session.service_id);
      
      setEditingSession(session);
      
      // Fix date display to avoid timezone issues
      const sessionDate = new Date(session.date);
      const displayDate = sessionDate.getFullYear() + '-' + 
        String(sessionDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(sessionDate.getDate()).padStart(2, '0');
      
      const formData = {
        service_id: session.service_id || "",
        session_id: session.session_id || "",
        date: displayDate,
        time: session.time || "",
        max_capacity: session.max_capacity || 20,
        status: session.status || "active",
        location_name: session.location_name || "",
        location_address: session.location_address || "",
        location_city: session.location_city || "",
        location_state: session.location_state || "",
        location_zip: session.location_zip || "",
        location_phone: session.location_phone || "",
        location_notes: session.location_notes || "",
        is_virtual: session.is_virtual || false,
        virtual_link: session.virtual_link || "",
        location_confirmed_by: session.location_confirmed_by ? new Date(session.location_confirmed_by).toISOString().split('T')[0] : "",
        parking_info: session.parking_info || "",
        driving_directions: session.driving_directions || ""
      };
      
      console.log("Admin: Form data prepared:", formData);
      setSessionForm(formData);
      setShowSessionDialog(true);
    } catch (error) {
      console.error("Admin: Error in editSession:", error);
      toast({
        title: "Error",
        description: "Failed to open session for editing",
        variant: "destructive",
      });
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      fetchServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Show authentication if not logged in
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage services, sessions, and pricing</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Test Tools Section - Only visible in development */}
          {showTestTools && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-yellow-800 flex items-center">
                  🧪 Test Tools
                  <Badge variant="outline" className="ml-2 text-yellow-700 border-yellow-300">
                    Development Only
                  </Badge>
                </h2>
                <div className="text-sm text-yellow-700">
                  Services: {testDataStatus.services} | Sessions: {testDataStatus.sessions} | Registrations: {testDataStatus.registrations}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button 
                  onClick={handleResetData} 
                  variant="destructive" 
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
                
                <Button 
                  onClick={handleSeedData} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Reseed Test Data
                </Button>
                
                <Button 
                  onClick={handleClearRegistrations} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Clear Registrations
                </Button>
                
                <Button 
                  onClick={handleCreateTestUsers} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create Test Users
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-yellow-600">
                <strong>Reset All Data:</strong> Clears all registrations, contact submissions, and resets session counts<br/>
                <strong>Reseed Test Data:</strong> Creates sample services and sessions for testing<br/>
                <strong>Clear Registrations:</strong> Removes all registrations and resets session counts<br/>
                <strong>Create Test Users:</strong> Adds sample registrations to test the system
              </div>
            </div>
          )}

          <Tabs defaultValue="services" className="space-y-6">
            <TabsList>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Services Management</h2>
                <Button onClick={() => {
                  setEditingService(null);
                  resetServiceForm();
                  setShowServiceDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                        <Badge variant={service.available ? "default" : "secondary"}>
                          {service.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Price:</span>
                          <span className="font-medium">${service.base_price}</span>
                        </div>
                        {service.early_bird_price && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Early Bird:</span>
                            <span className="font-medium text-green-600">${service.early_bird_price}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level:</span>
                          <span>{service.level}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editService(service)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Sessions Management</h2>
                <Button onClick={() => {
                  setEditingSession(null);
                  resetSessionForm();
                  setShowSessionDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{session.service_title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.current_registrations}/{session.max_capacity}
                            </div>
                            <Badge variant="outline">{session.session_id}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editSession(session)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={serviceForm.level}
                  onChange={(e) => setServiceForm({...serviceForm, level: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <Label htmlFor="format">Format</Label>
                <select
                  id="format"
                  value={serviceForm.format}
                  onChange={(e) => setServiceForm({...serviceForm, format: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Format</option>
                  <option value="Instructor-led In-person">Instructor-led In-person</option>
                  <option value="Instructor-led Online">Instructor-led Online</option>
                  <option value="Self-paced">Self-paced</option>
                </select>
              </div>
              <div>
                <Label htmlFor="icon">Icon (Lucide name)</Label>
                <Input
                  id="icon"
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="base_price">Base Price ($)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  value={serviceForm.base_price}
                  onChange={(e) => setServiceForm({...serviceForm, base_price: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="early_bird_price">Early Bird Price ($)</Label>
                <Input
                  id="early_bird_price"
                  type="number"
                  step="0.01"
                  value={serviceForm.early_bird_price}
                  onChange={(e) => setServiceForm({...serviceForm, early_bird_price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="early_bird_days">Early Bird Days</Label>
                <Input
                  id="early_bird_days"
                  type="number"
                  value={serviceForm.early_bird_days}
                  onChange={(e) => setServiceForm({...serviceForm, early_bird_days: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="session_outline">Session Outline (one per line)</Label>
              <Textarea
                id="session_outline"
                value={serviceForm.session_outline}
                onChange={(e) => setServiceForm({...serviceForm, session_outline: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="features">Key Learning Outcomes (one per line)</Label>
              <Textarea
                id="features"
                value={serviceForm.features}
                onChange={(e) => setServiceForm({...serviceForm, features: e.target.value})}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={serviceForm.available}
                onChange={(e) => setServiceForm({...serviceForm, available: e.target.checked})}
              />
              <Label htmlFor="available">Available for registration</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t bg-background sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => setShowServiceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingService ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? "Edit Session" : "Add New Session"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSessionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="service_id">Service</Label>
              <select
                id="service_id"
                value={sessionForm.service_id}
                onChange={(e) => setSessionForm({...sessionForm, service_id: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session_id">Session ID</Label>
                <Input
                  id="session_id"
                  value={sessionForm.session_id}
                  onChange={(e) => setSessionForm({...sessionForm, session_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_capacity">Max Capacity</Label>
                <Input
                  id="max_capacity"
                  type="number"
                  value={sessionForm.max_capacity}
                  onChange={(e) => setSessionForm({...sessionForm, max_capacity: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={sessionForm.time}
                  onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                  placeholder="11:00 AM EST"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={sessionForm.status}
                onChange={(e) => setSessionForm({...sessionForm, status: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Location Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Location Information</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="is_virtual">Session Type</Label>
                  <select
                    id="is_virtual"
                    value={sessionForm.is_virtual ? "true" : "false"}
                    onChange={(e) => setSessionForm({...sessionForm, is_virtual: e.target.value === "true"})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="false">In-Person</option>
                    <option value="true">Virtual</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="location_confirmed_by">Location Confirmed By</Label>
                  <Input
                    id="location_confirmed_by"
                    type="date"
                    value={sessionForm.location_confirmed_by}
                    onChange={(e) => setSessionForm({...sessionForm, location_confirmed_by: e.target.value})}
                    placeholder="Leave empty if confirmed"
                  />
                </div>
              </div>

              {sessionForm.is_virtual ? (
                <div>
                  <Label htmlFor="virtual_link">Virtual Meeting Link</Label>
                  <Input
                    id="virtual_link"
                    value={sessionForm.virtual_link}
                    onChange={(e) => setSessionForm({...sessionForm, virtual_link: e.target.value})}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="location_name">Venue Name</Label>
                      <Input
                        id="location_name"
                        value={sessionForm.location_name}
                        onChange={(e) => setSessionForm({...sessionForm, location_name: e.target.value})}
                        placeholder="Jacksonville Business Center"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_phone">Venue Phone</Label>
                      <Input
                        id="location_phone"
                        value={sessionForm.location_phone}
                        onChange={(e) => setSessionForm({...sessionForm, location_phone: e.target.value})}
                        placeholder="+1 (904) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="location_address">Address</Label>
                    <Input
                      id="location_address"
                      value={sessionForm.location_address}
                      onChange={(e) => setSessionForm({...sessionForm, location_address: e.target.value})}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="location_city">City</Label>
                      <Input
                        id="location_city"
                        value={sessionForm.location_city}
                        onChange={(e) => setSessionForm({...sessionForm, location_city: e.target.value})}
                        placeholder="Jacksonville"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_state">State</Label>
                      <Input
                        id="location_state"
                        value={sessionForm.location_state}
                        onChange={(e) => setSessionForm({...sessionForm, location_state: e.target.value})}
                        placeholder="FL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_zip">ZIP Code</Label>
                      <Input
                        id="location_zip"
                        value={sessionForm.location_zip}
                        onChange={(e) => setSessionForm({...sessionForm, location_zip: e.target.value})}
                        placeholder="32256"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="parking_info">Parking Information</Label>
                      <Textarea
                        id="parking_info"
                        value={sessionForm.parking_info}
                        onChange={(e) => setSessionForm({...sessionForm, parking_info: e.target.value})}
                        placeholder="Free parking available in front of building"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="driving_directions">Driving Directions</Label>
                      <Textarea
                        id="driving_directions"
                        value={sessionForm.driving_directions}
                        onChange={(e) => setSessionForm({...sessionForm, driving_directions: e.target.value})}
                        placeholder="Take I-95 to Exit 123..."
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="location_notes">Additional Location Notes</Label>
                <Textarea
                  id="location_notes"
                  value={sessionForm.location_notes}
                  onChange={(e) => setSessionForm({...sessionForm, location_notes: e.target.value})}
                  placeholder="Enter through main lobby, take elevator to 3rd floor..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t bg-background sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => setShowSessionDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingSession ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
