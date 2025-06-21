import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface BagReminderModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
  locationName: string;
}

export default function BagReminderModal({ 
  isOpen, 
  onConfirm, 
  onDismiss, 
  locationName 
}: BagReminderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="ios-card mx-6 rounded-ios-lg p-6 max-w-sm w-full shadow-xl">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-ios-green rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-ios-text mb-2">Don't forget your bags!</h3>
          <p className="text-ios-secondary">
            You're at {locationName || "a saved location"}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            onClick={onConfirm}
            className="w-full ios-button bg-ios-green hover:bg-ios-green/90 text-white rounded-ios py-3 font-medium"
          >
            I brought my bags! 🎉
          </Button>
          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full ios-button rounded-ios py-3 font-medium"
          >
            Remind me later
          </Button>
        </div>
      </div>
    </div>
  );
}
