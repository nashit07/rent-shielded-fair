import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBuilding} 
          alt="Modern luxury apartment building" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Rent Fairly, Privately
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Revolutionary rental platform where your bids remain encrypted until the deadline. 
          No more bidding wars, just fair and private rental applications.
        </p>
        
        <div className="flex justify-center items-center mb-16">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10 transition-smooth"
            onClick={() => window.location.href = '/properties'}
          >
            <Lock className="mr-2 h-5 w-5" />
            Browse Shielded Listings
          </Button>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-shield rounded-full flex items-center justify-center border border-privacy-primary/20 group-hover:shadow-glow transition-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Encrypted Bids</h3>
            <p className="text-muted-foreground">Your rental offers stay hidden until the landlord's deadline</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-shield rounded-full flex items-center justify-center border border-privacy-primary/20 group-hover:shadow-glow transition-glow">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fair Process</h3>
            <p className="text-muted-foreground">No more outbidding - everyone submits blind offers</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-shield rounded-full flex items-center justify-center border border-privacy-primary/20 group-hover:shadow-glow transition-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Web3 Secure</h3>
            <p className="text-muted-foreground">Blockchain-powered transparency and trust</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;