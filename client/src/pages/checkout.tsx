import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Users, MapPin, TrendingUp } from "lucide-react";

// Initialize Stripe only if public key is available
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to EcoBag Pro! All features unlocked.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-ios-blue to-purple-600 hover:from-ios-blue/90 hover:to-purple-600/90 text-white font-semibold py-4 rounded-ios-lg ios-button"
        disabled={!stripe || isLoading}
      >
        {isLoading ? "Processing..." : "Complete Purchase - $2.99"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [isConfigured, setIsConfigured] = useState(!!import.meta.env.VITE_STRIPE_PUBLIC_KEY);

  useEffect(() => {
    if (!isConfigured) return;
    
    apiRequest("POST", "/api/create-payment-intent")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setIsConfigured(false);
      });
  }, [isConfigured]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-ios-bg">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1 text-ios-text text-sm font-semibold">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <i className="fas fa-signal text-xs"></i>
            <i className="fas fa-wifi text-xs"></i>
            <i className="fas fa-battery-full text-xs"></i>
          </div>
        </div>

        <div className="max-w-sm mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-ios-blue to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-ios-text mb-2">Payment Setup Required</h1>
            <p className="text-ios-secondary">Payment processing is not yet configured</p>
          </div>

          <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-ios-text mb-4">
                Payment functionality will be available once Stripe credentials are configured.
              </p>
              <p className="text-sm text-ios-secondary">
                For now, you can explore all the bag tracking features without payment.
              </p>
            </CardContent>
          </Card>

          <Button 
            onClick={() => window.history.back()}
            className="w-full ios-button"
          >
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ios-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-bg">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 text-ios-text text-sm font-semibold">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-full text-xs"></i>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-ios-blue to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ios-text mb-2">Upgrade to EcoBag Pro</h1>
          <p className="text-ios-secondary">Unlock all features for life</p>
        </div>

        {/* Features List */}
        <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Unlimited cars & bag types</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Family sharing & competition</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Location-based reminders</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Social sharing features</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-ios-green" />
                <span className="text-ios-text">Push notifications</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="ios-card rounded-ios-lg shadow-sm mb-6 border-2 border-ios-blue border-opacity-30">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-ios-blue mb-2">$2.99</div>
            <div className="text-ios-secondary">One-time payment</div>
            <div className="text-sm text-ios-success mt-2">🌱 Lifetime access • No subscriptions</div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="ios-card rounded-ios-lg shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            {stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="text-center py-4">
                <p className="text-ios-secondary">Payment processing not available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
          className="w-full ios-button"
        >
          Maybe Later
        </Button>

        {/* Security Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-ios-secondary">
            🔒 Secure payment powered by Stripe. Your card details are never stored.
          </p>
        </div>
      </div>
    </div>
  );
}
