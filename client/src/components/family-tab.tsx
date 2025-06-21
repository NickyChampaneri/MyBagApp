import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trophy, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function FamilyTab() {
  const { user } = useAuth();

  const { data: savings } = useQuery({
    queryKey: ["/api/savings"],
    enabled: !!user,
  });

  const { data: familyMembers } = useQuery({
    queryKey: ["/api/family/members"],
    enabled: !!user?.hasPaidAccess,
  });

  if (!user?.hasPaidAccess) {
    return (
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <Users className="w-16 h-16 mx-auto mb-4 text-ios-secondary opacity-50" />
          <h1 className="text-2xl font-bold text-ios-text mb-2">Family Sharing</h1>
          <p className="text-ios-secondary">Share your eco-journey with family members</p>
        </div>

        <Card className="ios-card rounded-ios-lg p-6 shadow-sm border-2 border-ios-blue border-opacity-30 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-ios-blue" />
          <h3 className="font-semibold text-ios-text mb-2">Unlock Family Sharing</h3>
          <p className="text-sm text-ios-secondary mb-4">
            Invite family members, compete on savings, and share your environmental impact together.
          </p>
          <Button
            onClick={() => window.location.href = "/checkout"}
            className="bg-ios-blue hover:bg-ios-blue/90 text-white"
          >
            Upgrade to Pro - $2.99
          </Button>
        </Card>
      </div>
    );
  }

  const totalFamilySavings = savings?.totalSavings || 0;
  const mockFamilyData = [
    { name: "You", savings: savings?.totalSavings || 0, avatar: "🌱" },
    { name: "Dad", savings: 52, avatar: "👨" },
    { name: "Mom", savings: 28, avatar: "👩" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-ios-text">Family Sharing</h1>
      </div>

      {/* Family Stats */}
      <div className="px-6 mb-6">
        <Card className="ios-card rounded-ios-lg p-6 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-ios-text mb-2">Family Savings</h3>
            <div className="text-3xl font-bold text-ios-green mb-1">
              ${(totalFamilySavings + 80).toFixed(0)}
            </div>
            <p className="text-sm text-ios-secondary">Combined savings this month</p>
          </div>

          {/* Family Members Progress */}
          <div className="space-y-4">
            {mockFamilyData.map((member, index) => {
              const maxSavings = Math.max(...mockFamilyData.map(m => m.savings));
              const progressPercentage = (member.savings / maxSavings) * 100;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-ios-bg flex items-center justify-center text-xl">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-ios-text">
                        {member.name} {member.name === "You" && "(You)"}
                      </span>
                      <span className="text-sm font-semibold text-ios-green">
                        ${member.savings.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-ios-bg rounded-full h-2">
                      <div 
                        className="bg-ios-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Invite Family */}
      <div className="px-6 mb-6">
        <Button className="w-full ios-card rounded-ios-lg p-5 shadow-sm border border-ios-blue border-opacity-30 ios-button bg-transparent hover:bg-ios-bg">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-ios-blue rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-ios-text">Invite Family Member</h4>
              <p className="text-sm text-ios-secondary">Share your bag tracking progress</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Family Leaderboard */}
      <div className="px-6">
        <h3 className="text-lg font-semibold text-ios-text mb-3">This Week's Champions</h3>
        <div className="space-y-3">
          <Card className="ios-card rounded-ios p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🥇</div>
                <div>
                  <h4 className="font-medium text-ios-text">Dad</h4>
                  <p className="text-sm text-ios-secondary">8 bags saved this week</p>
                </div>
              </div>
              <span className="text-lg font-bold text-yellow-600">+$4.00</span>
            </div>
          </Card>

          <Card className="ios-card rounded-ios p-4 shadow-sm border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🥈</div>
                <div>
                  <h4 className="font-medium text-ios-text">You</h4>
                  <p className="text-sm text-ios-secondary">6 bags saved this week</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-600">+$3.00</span>
            </div>
          </Card>

          <Card className="ios-card rounded-ios p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🥉</div>
                <div>
                  <h4 className="font-medium text-ios-text">Mom</h4>
                  <p className="text-sm text-ios-secondary">4 bags saved this week</p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-600">+$2.00</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-6 mt-6">
        <h3 className="text-lg font-semibold text-ios-text mb-3">Family Achievements</h3>
        <Card className="ios-card rounded-ios p-4 shadow-sm bg-gradient-to-r from-ios-green to-emerald-400">
          <div className="text-white text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <h4 className="font-semibold">Eco Family Champion!</h4>
            <p className="text-sm opacity-90">Your family saved 100+ bags this month</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
