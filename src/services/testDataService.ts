import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export class TestDataService {
  static async resetAllData() {
    try {
      // Clear all registrations
      await supabase.from("training_registrations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      // Reset session counts
      await supabase.from("sessions").update({ current_registrations: 0 });
      
      // Clear contact submissions
      await supabase.from("contact_submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      return { success: true, message: "All test data reset successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async clearAllRegistrations() {
    try {
      // Clear all registrations
      await supabase.from("training_registrations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      // Reset session counts
      await supabase.from("sessions").update({ current_registrations: 0 });
      
      return { success: true, message: "All registrations cleared successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async seedTestData() {
    try {
      // First, ensure we have the base service
      const { data: existingService } = await supabase
        .from("services")
        .select("id")
        .eq("title", "AI Fundamentals & ChatGPT Mastery")
        .single();

      let serviceId = existingService?.id;

      // Create the service if it doesn't exist
      if (!serviceId) {
        const { data: newService, error: serviceError } = await supabase
          .from("services")
          .insert({
            title: "AI Fundamentals & ChatGPT Mastery",
            description: "Get hands-on experience with AI tools in this comprehensive 3-hour instructor-led training session.",
            duration: "3 hours",
            level: "All Levels",
            format: "Instructor-led In-person",
            base_price: 150.00,
            early_bird_price: 75.00,
            early_bird_days: 7,
            features: [
              "AI landscape overview and current trends",
              "ChatGPT and Claude basics with live demonstrations",
              "Safety considerations and AI limitations",
              "Hands-on practice with effective prompting techniques",
              "Real-world business use cases and applications",
              "Advanced features and workflow integration",
              "Building sustainable AI habits for productivity"
            ],
            session_outline: [
              "Hour 1: AI landscape overview, ChatGPT/Claude basics, safety and limitations",
              "Hour 2: Hands-on practice with prompting techniques, real-world use cases",
              "Hour 3: Advanced features, workflow integration, building AI habits"
            ],
            icon: "Brain",
            available: true
          })
          .select("id")
          .single();

        if (serviceError) throw serviceError;
        serviceId = newService.id;
      }

      // Create test sessions
      const testSessions = [
        {
          service_id: serviceId,
          session_id: "TEST001",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          time: "10:00 AM EST",
          max_capacity: 20,
          current_registrations: 0,
          status: "active"
        },
        {
          service_id: serviceId,
          session_id: "TEST002",
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          time: "2:00 PM EST",
          max_capacity: 15,
          current_registrations: 0,
          status: "active"
        },
        {
          service_id: serviceId,
          session_id: "TEST003",
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
          time: "11:00 AM EST",
          max_capacity: 25,
          current_registrations: 0,
          status: "active"
        }
      ];

      // Clear existing test sessions
      await supabase.from("sessions").delete().like("session_id", "TEST%");

      // Insert new test sessions
      const { error: sessionsError } = await supabase
        .from("sessions")
        .insert(testSessions);

      if (sessionsError) throw sessionsError;

      return { success: true, message: "Test data seeded successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async createTestUsers() {
    try {
      // Create test registrations
      const testRegistrations = [
        {
          first_name: "Test",
          last_name: "User 1",
          email: "test1@example.com",
          company: "Test Company",
          phone: "+1-555-0001",
          job_title: "Developer",
          experience: "Beginner",
          expectations: "Learn AI basics",
          training_title: "AI Fundamentals & ChatGPT Mastery",
          session_id: "TEST001",
          status: "confirmed",
          payment_status: "paid",
          payment_amount: 75.00,
          payment_currency: "USD"
        },
        {
          first_name: "Test",
          last_name: "User 2",
          email: "test2@example.com",
          company: "Test Corp",
          phone: "+1-555-0002",
          job_title: "Manager",
          experience: "Intermediate",
          expectations: "Advanced AI skills",
          training_title: "AI Fundamentals & ChatGPT Mastery",
          session_id: "TEST002",
          status: "confirmed",
          payment_status: "paid",
          payment_amount: 75.00,
          payment_currency: "USD"
        }
      ];

      // Clear existing test registrations
      await supabase.from("training_registrations").delete().like("email", "%test%");

      // Insert test registrations
      const { error: regError } = await supabase
        .from("training_registrations")
        .insert(testRegistrations);

      if (regError) throw regError;

      // Update session counts
      await supabase.rpc("update_session_availability");

      return { success: true, message: "Test users created successfully" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getTestDataStatus() {
    try {
      const { data: services } = await supabase.from("services").select("count").single();
      const { data: sessions } = await supabase.from("sessions").select("count").single();
      const { data: registrations } = await supabase.from("training_registrations").select("count").single();

      return {
        services: services?.count || 0,
        sessions: sessions?.count || 0,
        registrations: registrations?.count || 0
      };
    } catch (error: any) {
      return { services: 0, sessions: 0, registrations: 0 };
    }
  }
}
