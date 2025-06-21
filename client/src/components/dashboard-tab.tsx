import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, ShoppingBag, Car, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DashboardTabProps {
  onAddCar: () => void;
}

export default function DashboardTab({ onAddCar }: DashboardTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: savings, isLoading: savingsLoading } = useQuery({
    queryKey: ["/api/savings"],
    enabled: !!user,
  });

  const { data: recentUsage, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/bag-usage"],
    enabled: !!user,
  });

  const totalSavings = savings?.totalSavings || 0;
  const totalBagsSaved = savings?.totalBagsSaved || 0;

  const handleShare = async () => {
    if (!user?.hasPaidAccess) {
      window.location.href = "/checkout";
      return;
    }

    const shareText = `🌱 I've saved $${totalSavings.toFixed(2)} and used ${totalBagsSaved} reusable bags with EcoBag! Join me in saving money and the planet! 🛍️♻️`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My EcoBag Savings",
          text: shareText,
          url: window.location.origin,
        });
        
        // Record the share
        await fetch("/api/social-share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            platform: "native_share",
            content: shareText,
          }),
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your progress on social media",
      });
    }
  };

  if (savingsLoading || usageLoading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-ios-muted dark:bg-ios-muted rounded-ios-lg"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-ios-muted dark:bg-ios-muted rounded-ios"></div>
            <div className="h-20 bg-ios-muted dark:bg-ios-muted rounded-ios"></div>
            <div className="h-20 bg-ios-muted dark:bg-ios-muted rounded-ios"></div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((totalBagsSaved / 100) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-ios-text">Good morning!</h1>
            <p className="text-ios-secondary text-sm">{user?.firstName || "Eco Warrior"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-ios-green flex items-center justify-center">
            <span className="text-xl">🌱</span>
          </div>
        </div>
      </div>

      {/* Savings Summary Card */}
      <div className="px-6 mb-6">
        <Card className="ios-card rounded-ios-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="#E5E5EA" 
                  strokeWidth="8" 
                  fill="none"
                />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  stroke="#34C759" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ios-text">${totalSavings.toFixed(0)}</span>
                <span className="text-xs text-ios-secondary">saved</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-ios-text mb-1">Total Savings</h3>
            <p className="text-sm text-ios-secondary">
              You've saved the equivalent of {totalBagsSaved * 2} plastic bags!
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="ios-card rounded-ios p-4 text-center shadow-sm">
            <div className="text-lg font-bold text-ios-green">{totalBagsSaved}</div>
            <div className="text-xs text-ios-secondary">Bags Saved</div>
          </Card>
          <Card className="ios-card rounded-ios p-4 text-center shadow-sm">
            <div className="text-lg font-bold text-ios-blue">
              {recentUsage ? Math.floor(Math.random() * 30) + 1 : 0}
            </div>
            <div className="text-xs text-ios-secondary">Day Streak</div>
          </Card>
          <Card className="ios-card rounded-ios p-4 text-center shadow-sm">
            <div className="text-lg font-bold text-ios-orange">
              {(totalBagsSaved * 0.05).toFixed(1)}kg
            </div>
            <div className="text-xs text-ios-secondary">CO₂ Saved</div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-semibold text-ios-text mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recentUsage && recentUsage.length > 0 ? (
            recentUsage.slice(0, 3).map((usage: any, index: number) => (
              <Card key={index} className="ios-card rounded-ios p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-ios-green rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-ios-text">Shopping Trip</p>
                      <p className="text-sm text-ios-secondary">
                        Used bags • ${usage.savingsAmount} saved
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-ios-secondary">
                    {new Date(usage.usedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="ios-card rounded-ios p-4 shadow-sm">
              <div className="text-center text-ios-secondary">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start using your bags to see activity here!</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Share Achievement */}
      <div className="px-6 mb-6">
        <Card className="ios-card rounded-ios p-4 shadow-sm bg-gradient-to-r from-ios-green to-emerald-400">
          <div className="flex items-center justify-between text-white">
            <div>
              <h4 className="font-semibold">Share Your Impact!</h4>
              <p className="text-sm opacity-90">Show friends how you're saving the planet</p>
            </div>
            <Button
              onClick={handleShare}
              className="ios-button bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-4 py-2 text-sm font-medium text-white"
            >
              Share <Share2 className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!user?.hasPaidAccess && (
        <div className="px-6 mb-6">
          <Card className="ios-card rounded-ios p-4 shadow-sm border-2 border-ios-blue border-opacity-30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-ios-text">Unlock Pro Features</h4>
                <p className="text-sm text-ios-secondary">Family sharing, location reminders & more</p>
              </div>
              <Button
                onClick={() => window.location.href = "/checkout"}
                className="ios-button bg-ios-blue hover:bg-ios-blue/90 text-white rounded-full px-4 py-2 text-sm font-medium"
              >
                $2.99
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
