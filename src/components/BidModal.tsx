import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Wallet, DollarSign, FileText, User } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyPrice: string;
}

const BidModal = ({ isOpen, onClose, propertyTitle, propertyPrice }: BidModalProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [moveInDate, setMoveInDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle bid submission logic here
    console.log("Submitting encrypted bid:", { bidAmount, message, moveInDate });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-shield border-privacy-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Submit Encrypted Bid
          </DialogTitle>
          <DialogDescription>
            Your bid for <span className="font-semibold text-primary">{propertyTitle}</span> will be encrypted 
            and hidden from other applicants until the landlord's deadline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Info */}
          <Card className="p-4 bg-privacy-surface border-privacy-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{propertyTitle}</h4>
                <p className="text-sm text-muted-foreground">Listed at {propertyPrice}</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Encrypted</span>
              </div>
            </div>
          </Card>

          {/* Bid Amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Your Monthly Rent Bid
            </Label>
            <Input
              id="bidAmount"
              type="number"
              placeholder="Enter your bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              This amount will be encrypted and only visible to the landlord after the deadline.
            </p>
          </div>

          {/* Move-in Date */}
          <div className="space-y-2">
            <Label htmlFor="moveInDate" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Preferred Move-in Date
            </Label>
            <Input
              id="moveInDate"
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary"
              required
            />
          </div>

          {/* Additional Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Additional Information (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the landlord about yourself, employment, references, etc."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Encryption Notice */}
          <Card className="p-4 bg-privacy-primary/5 border-privacy-primary/20">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary mb-1">Encryption & Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  Your bid and personal information are encrypted using blockchain technology. 
                  Only you and the landlord can decrypt this information after the bidding deadline.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-glow"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Submit Encrypted Bid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;