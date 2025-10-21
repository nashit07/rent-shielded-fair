import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Wallet, DollarSign, FileText, User, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useContract } from "@/hooks/useContract";
import { toast } from "sonner";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyPrice: string;
  propertyId: number;
}

const BidModal = ({ isOpen, onClose, propertyTitle, propertyPrice, propertyId }: BidModalProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  // Set default date to 30 days from now
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };
  
  const [moveInDate, setMoveInDate] = useState(getDefaultDate());
  const [creditScore, setCreditScore] = useState("");
  const [income, setIncome] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { submitEncryptedBid, isSubmitting, isSuccess: txSuccess, error, isConnected } = useContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await submitEncryptedBid({
        propertyId,
        bidAmount: parseFloat(bidAmount),
        creditScore: parseInt(creditScore),
        income: parseFloat(income),
        message,
        moveInDate
      });

      toast.success("Encrypted bid submitted successfully!");
      setIsSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        // Reset form
        setBidAmount("");
        setMessage("");
        setMoveInDate("");
        setCreditScore("");
        setIncome("");
      }, 2000);

    } catch (err) {
      console.error("Error submitting bid:", err);
      toast.error("Failed to submit bid. Please try again.");
    }
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

          {/* Credit Score */}
          <div className="space-y-2">
            <Label htmlFor="creditScore" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Credit Score
            </Label>
            <Input
              id="creditScore"
              type="number"
              placeholder="Enter your credit score"
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value)}
              className="bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary"
              min="300"
              max="850"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your credit score will be encrypted and only visible to the landlord.
            </p>
          </div>

          {/* Income */}
          <div className="space-y-2">
            <Label htmlFor="income" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Annual Income
            </Label>
            <Input
              id="income"
              type="number"
              placeholder="Enter your annual income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your income information will be encrypted for privacy.
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

          {/* Error Display */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Transaction Failed</h4>
                  <p className="text-sm text-red-700">
                    {error.message || "An error occurred while submitting your bid. Please try again."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Success Display */}
          {isSuccess && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Bid Submitted Successfully!</h4>
                  <p className="text-sm text-green-700">
                    Your encrypted bid has been submitted to the blockchain. The landlord will be able to view it after the deadline.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-glow"
              disabled={isSubmitting || !isConnected}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSubmitting ? "Submitting..." : "Confirming..."}
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Submit Encrypted Bid
                </>
              )}
            </Button>
          </div>

          {/* Wallet Connection Notice */}
          {!isConnected && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Wallet Not Connected</h4>
                  <p className="text-sm text-yellow-700">
                    Please connect your wallet to submit an encrypted bid.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;