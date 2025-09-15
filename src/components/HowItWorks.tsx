import { Card } from "@/components/ui/card";
import { Shield, Lock, Wallet, Clock, Eye, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Link your Web3 wallet to access shielded rental listings and submit encrypted bids.",
      color: "text-primary"
    },
    {
      id: 2,
      icon: Eye,
      title: "Browse Shielded Listings",
      description: "Explore available properties with encrypted bidding. All listings show deadline information.",
      color: "text-privacy-secondary"
    },
    {
      id: 3,
      icon: Lock,
      title: "Submit Encrypted Bid",
      description: "Place your offer privately. Your bid amount remains hidden from other applicants until the deadline.",
      color: "text-privacy-accent"
    },
    {
      id: 4,
      icon: Clock,
      title: "Wait for Deadline",
      description: "All bids remain encrypted and invisible to competitors during the bidding period.",
      color: "text-primary"
    },
    {
      id: 5,
      icon: Shield,
      title: "Bids Revealed",
      description: "After the deadline, landlords can decrypt and review all submissions to make their decision.",
      color: "text-privacy-secondary"
    },
    {
      id: 6,
      icon: CheckCircle,
      title: "Fair Selection",
      description: "The landlord chooses based on complete applications without bias from visible bidding wars.",
      color: "text-privacy-accent"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience fair rental applications through our encrypted bidding system. 
            No more bidding wars - just privacy, transparency, and equal opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.id}
                className="relative p-6 bg-gradient-shield border-privacy-primary/20 hover:border-privacy-primary/40 transition-all duration-300 hover:shadow-card group"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {step.id}
                </div>
                
                <div className={`w-12 h-12 rounded-lg bg-gradient-shield border border-privacy-primary/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-glow ${step.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-smooth">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-gradient-primary opacity-30" />
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-shield border border-privacy-primary/20 rounded-lg p-8 max-w-2xl mx-auto">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Privacy Guaranteed</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your personal information and bid amounts are encrypted using advanced blockchain technology. 
              Only you and the landlord can access this information after the deadline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;