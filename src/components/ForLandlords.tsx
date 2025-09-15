import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building, Users, Shield, TrendingUp, Clock, Zap } from "lucide-react";

const ForLandlords = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Quality Applications",
      description: "Receive genuine applications without bidding war inflation. Tenants focus on presenting their best case, not just highest offer."
    },
    {
      icon: Users,
      title: "Fair Selection Process",
      description: "Review all applications simultaneously after the deadline. Make decisions based on complete tenant profiles, not just bid amounts."
    },
    {
      icon: TrendingUp,
      title: "Better Tenant Retention",
      description: "Tenants selected fairly are more likely to stay long-term, reducing turnover costs and vacancy periods."
    },
    {
      icon: Clock,
      title: "Deadline Control",
      description: "Set your own bidding deadlines. Control the application timeline to match your scheduling needs."
    },
    {
      icon: Zap,
      title: "Streamlined Management",
      description: "All applications, documents, and encrypted bids in one dashboard. No more scattered emails or paperwork."
    },
    {
      icon: Building,
      title: "Property Protection",
      description: "Verified wallet addresses and encrypted identity verification help ensure responsible tenants."
    }
  ];

  const steps = [
    "List your property with photos and details",
    "Set application deadline and requirements", 
    "Watch encrypted applications come in",
    "Review all bids after deadline expires",
    "Select the best tenant for your property"
  ];

  return (
    <section id="landlords" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            For Landlords
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your rental process with encrypted applications. 
            Get quality tenants, fair pricing, and streamlined management.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-gradient-shield border-privacy-primary/20 hover:border-privacy-primary/40 transition-all duration-300 hover:shadow-card group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-shield border border-privacy-primary/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-glow">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-smooth">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Process Steps */}
        <div className="bg-gradient-shield border border-privacy-primary/20 rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Simple 5-Step Process</h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-foreground font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-shield border border-privacy-primary/20 rounded-lg p-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4">Ready to List Your Property?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join landlords who have reduced vacancy time by 40% and improved tenant quality 
            through our encrypted bidding system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-glow"
            >
              List Your Property
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForLandlords;