import React, { useState, useEffect } from "react";
import { loadStripe, Stripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { stripePromise } from "@/integrations/stripe/client";
import { PaymentFormData, PaymentResult } from "@/integrations/stripe/types";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (result: PaymentResult) => void;
  formData: PaymentFormData;
  trainingTitle: string;
  sessionId: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  formData,
  trainingTitle,
  sessionId
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      console.log('Initializing Stripe...');
      const stripeInstance = await stripePromise;
      console.log('Stripe instance:', stripeInstance);
      
      if (stripeInstance) {
        setStripe(stripeInstance);
        const elementsInstance = stripeInstance.elements({
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#ef4444',
              fontFamily: 'Inter, system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        });
        console.log('Elements instance:', elementsInstance);
        setElements(elementsInstance);
      } else {
        console.error('Failed to load Stripe');
      }
    };

    if (isOpen) {
      initializeStripe();
    }
  }, [isOpen]);

  // Cleanup when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (cardElement) {
        cardElement.unmount();
        setCardElement(null);
      }
    };
  }, [cardElement]);

  // Create payment intent when component opens
  useEffect(() => {
    if (isOpen && stripe && elements && !cardElement) {
      createPaymentIntent();
    }
  }, [isOpen, stripe, elements, cardElement]);

  const createPaymentIntent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: formData.amount * 100, // Convert to cents
          currency: formData.currency,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          trainingTitle,
          sessionId,
        }
      });

      if (error) throw error;

      if (data.success) {
        setClientSecret(data.clientSecret);
        
        // Only create card element if one doesn't exist
        if (!cardElement) {
          console.log('Creating new card element...');
          const card = elements.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          });

          card.mount('#card-element');
          setCardElement(card);

          // Handle real-time validation errors from the card Element
          card.on('change', ({ error }) => {
            setPaymentError(error ? error.message : null);
          });
        } else {
          console.log('Card element already exists, skipping creation');
        }
      } else {
        throw new Error(data.error || "Failed to create payment intent");
      }
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !cardElement || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        },
      });

      if (stripeError) {
        setPaymentError(stripeError.message || "Payment failed");
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment and complete registration
        console.log("PaymentForm: Calling confirm-payment Edge function...");
        console.log("PaymentForm: Payment intent ID:", paymentIntent.id);
        console.log("PaymentForm: Registration data:", {
          sessionId,
          trainingTitle,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          experienceLevel: formData.experienceLevel,
          expectations: formData.expectations,
        });
        
        const { data, error } = await supabase.functions.invoke('confirm-payment', {
          body: {
            paymentIntentId: paymentIntent.id,
            registrationData: {
              sessionId,
              trainingTitle,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              company: formData.company,
              phone: formData.phone,
              jobTitle: formData.jobTitle,
              experienceLevel: formData.experienceLevel,
              expectations: formData.expectations,
            }
          }
        });

        console.log("PaymentForm: Edge function response:", { data, error });
        if (error) {
          console.error("PaymentForm: Edge function error:", error);
          console.error("PaymentForm: Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        if (data.success) {
          toast({
            title: "Payment Successful!",
            description: "Your registration has been completed and confirmed.",
          });

          onPaymentSuccess({
            success: true,
            paymentIntentId: paymentIntent.id,
          });
        } else {
          throw new Error(data.error || "Failed to complete registration");
        }
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency.toUpperCase(),
    }).format(amount);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isProcessing) {
      // Clean up card element
      if (cardElement) {
        cardElement.unmount();
        setCardElement(null);
      }
      // Reset state
      setClientSecret(null);
      setPaymentError(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{trainingTitle}</CardTitle>
              <CardDescription>Session {sessionId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Training Fee</span>
                <span className="font-semibold">{formatAmount(formData.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatAmount(formData.amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Card Information</Label>
              <div 
                id="card-element" 
                className="p-3 border border-input rounded-md bg-background"
              />
              {paymentError && (
                <div className="flex items-center text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {paymentError}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center text-xs text-muted-foreground">
              <Lock className="w-3 h-3 mr-1" />
              Your payment information is secure and encrypted
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !clientSecret}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Pay {formatAmount(formData.amount)}
                </>
              )}
            </Button>
          </form>

          {/* Payment Methods */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>We accept</span>
              <Badge variant="outline" className="text-xs">Visa</Badge>
              <Badge variant="outline" className="text-xs">Mastercard</Badge>
              <Badge variant="outline" className="text-xs">American Express</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
