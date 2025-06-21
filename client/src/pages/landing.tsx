import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, DollarSign, Users, MapPin } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-green to-emerald-400 text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-1 text-sm font-semibold opacity-90">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <i className="fas fa-signal text-xs"></i>
          <i className="fas fa-wifi text-xs"></i>
          <i className="fas fa-battery-full text-xs"></i>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center">
            <span className="text-4xl">🛍️</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">EcoBag</h1>
          <p className="text-lg opacity-90 mb-2">Save Planet, Save Money</p>
          <p className="text-sm opacity-75">Track your reusable bag usage and environmental impact</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Card className="bg-white bg-opacity-20 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Track Savings</h3>
                  <p className="text-sm opacity-75">See how much money you save by using reusable bags</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white bg-opacity-20 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Environmental Impact</h3>
                  <p className="text-sm opacity-75">Calculate your positive environmental contribution</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white bg-opacity-20 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Reminders</h3>
                  <p className="text-sm opacity-75">Get notified when you're near your favorite stores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white bg-opacity-20 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Family Sharing</h3>
                  <p className="text-sm opacity-75">Share progress and compete with family members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleLogin}
          className="w-full bg-white text-ios-green hover:bg-gray-100 font-semibold py-4 text-lg rounded-ios-lg ios-button"
        >
          Get Started
        </Button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm opacity-75">
            Join thousands of eco-conscious users saving money and the planet
          </p>
        </div>
      </div>
    </div>
  );
}
