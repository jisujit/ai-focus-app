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
    let query = supabase
      .from("sessions")
      .select(`
        *,
        services!inner(title)
      `)
      .eq("status", "active")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true });

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data?.map(s => ({
      ...s,
      service_title: s.services?.title
    })) || [];
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
