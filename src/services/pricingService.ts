import { supabase } from "@/integrations/supabase/client";

export interface Service {
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

export interface Session {
  id: string;
  service_id: string;
  session_id: string;
  date: string;
  time: string;
  max_capacity: number;
  current_registrations: number;
  status: string;
  service_title?: string;
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_zip?: string;
  location_phone?: string;
  location_notes?: string;
  is_virtual?: boolean;
  virtual_link?: string;
  location_confirmed_by?: string;
  parking_info?: string;
  driving_directions?: string;
}

export interface PricingInfo {
  base_price: number;
  final_price: number;
  discount_amount: number;
  discount_type: string;
  is_early_bird: boolean;
  days_until_session: number;
}

export class PricingService {
  static async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getSessions(serviceId?: string): Promise<Session[]> {
    try {
      console.log("PricingService: Fetching sessions for serviceId:", serviceId);
      console.log("PricingService: Current timestamp:", new Date().toISOString());
      
      // First test if location fields exist in the database
      console.log("PricingService: Testing if location fields exist...");
      const { data: testData, error: testError } = await supabase
        .from("sessions")
        .select("id, location_name, is_virtual")
        .limit(1);
      
      console.log("PricingService: Location fields test:", { testData, testError });
      
      // Check what sessions actually exist in the database
      console.log("PricingService: Checking all sessions in database...");
      const { data: allSessions, error: allSessionsError } = await supabase
        .from("sessions")
        .select("id, session_id, status, date")
        .order("date", { ascending: true });
      
      console.log("PricingService: All sessions in database:", { allSessions, allSessionsError });
      
      // First try a simple query to test basic connectivity
      console.log("PricingService: Testing basic sessions query...");
      let query = supabase
        .from("sessions")
        .select(`
          id, 
          service_id, 
          session_id, 
          date, 
          time, 
          max_capacity, 
          current_registrations, 
          status,
          location_name,
          location_address,
          location_city,
          location_state,
          location_zip,
          location_phone,
          location_notes,
          is_virtual,
          virtual_link,
          location_confirmed_by,
          parking_info,
          driving_directions
        `)
        .eq("status", "active")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (serviceId) {
        query = query.eq("service_id", serviceId);
      }

      const { data, error } = await query;
      
      console.log("PricingService: Sessions query result:", { data, error });

      if (error) {
        console.error("PricingService: Sessions query error:", error);
        console.error("PricingService: Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      // Test if location fields exist in the data
      if (data && data.length > 0) {
        console.log("PricingService: First session raw data:", data[0]);
        console.log("PricingService: Date debugging:");
        console.log("- Raw date from DB:", data[0].date);
        console.log("- Date object:", new Date(data[0].date));
        console.log("- Local date string:", new Date(data[0].date).toLocaleDateString());
        console.log("- ISO string:", new Date(data[0].date).toISOString());
        console.log("PricingService: Location fields in first session:");
        console.log("- location_name:", data[0].location_name);
        console.log("- location_address:", data[0].location_address);
        console.log("- is_virtual:", data[0].is_virtual);
        console.log("- location_confirmed_by:", data[0].location_confirmed_by);
      }
      
      const mappedData = data?.map(s => ({
        ...s,
        service_title: s.services?.title,
        // Add default values for location fields in case they don't exist in DB
        location_name: s.location_name || null,
        location_address: s.location_address || null,
        location_city: s.location_city || null,
        location_state: s.location_state || null,
        location_zip: s.location_zip || null,
        location_phone: s.location_phone || null,
        location_notes: s.location_notes || null,
        is_virtual: s.is_virtual || false,
        virtual_link: s.virtual_link || null,
        location_confirmed_by: s.location_confirmed_by || null,
        parking_info: s.parking_info || null,
        driving_directions: s.driving_directions || null
      })) || [];
      
      console.log("PricingService: Mapped sessions data:", mappedData);
      return mappedData;
    } catch (error) {
      console.error("PricingService: Error in getSessions:", error);
      throw error;
    }
  }

  static async calculatePricing(
    serviceId: string,
    sessionId: string,
    quantity: number = 1
  ): Promise<PricingInfo> {
    const { data, error } = await supabase
      .rpc("calculate_session_price", {
        p_service_id: serviceId,
        p_session_date: new Date().toISOString(), // This should be the actual session date
        p_quantity: quantity
      });

    if (error) throw error;
    
    const pricing = data?.[0];
    if (!pricing) {
      throw new Error("Pricing calculation failed");
    }

    const sessionDate = new Date(); // This should be the actual session date
    const daysUntilSession = Math.ceil((sessionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      base_price: pricing.base_price,
      final_price: pricing.final_price,
      discount_amount: pricing.discount_amount,
      discount_type: pricing.discount_type,
      is_early_bird: pricing.discount_type === "early_bird",
      days_until_session: daysUntilSession
    };
  }

  static async getSessionPricing(sessionId: string): Promise<PricingInfo> {
    // First get the session to find the service and date
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        services!inner(*)
      `)
      .eq("session_id", sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error("Session not found");

    const service = session.services;
    const sessionDate = new Date(session.date);
    const daysUntilSession = Math.ceil((sessionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Calculate pricing locally as fallback
    let finalPrice = service.base_price;
    let discountAmount = 0;
    let discountType = 'base';
    let isEarlyBird = false;

    // Check for early bird pricing
    if (service.early_bird_price && daysUntilSession >= service.early_bird_days) {
      finalPrice = service.early_bird_price;
      discountAmount = service.base_price - service.early_bird_price;
      discountType = 'early_bird';
      isEarlyBird = true;
    }

    return {
      base_price: service.base_price,
      final_price: finalPrice,
      discount_amount: discountAmount,
      discount_type: discountType,
      is_early_bird: isEarlyBird,
      days_until_session: daysUntilSession
    };
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  static getAvailabilityText(current: number, max: number): string {
    const remaining = max - current;
    if (remaining <= 0) return "Fully booked";
    if (remaining <= 3) return `${remaining} spots left`;
    return `${remaining} spots available`;
  }

  static getAvailabilityColor(current: number, max: number): string {
    const remaining = max - current;
    if (remaining <= 0) return "text-red-600";
    if (remaining <= 3) return "text-orange-600";
    return "text-green-600";
  }
}
