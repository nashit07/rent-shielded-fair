import { Button } from "@/components/ui/button";
import { Shield, Menu, Wallet } from "lucide-react";
import { useState } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-privacy-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ShieldRent
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/properties" className="text-foreground hover:text-primary transition-smooth font-medium">
              Browse Properties
            </a>
            <a href="/how-it-works" className="text-foreground hover:text-primary transition-smooth font-medium">
              How It Works
            </a>
            <a href="/landlords" className="text-foreground hover:text-primary transition-smooth font-medium">
              For Landlords
            </a>
          </nav>

          {/* Wallet Connect */}
          <div className="hidden md:flex items-center space-x-4">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-privacy-primary/20">
            <nav className="flex flex-col space-y-4">
              <a href="/properties" className="text-foreground hover:text-primary transition-smooth font-medium">
                Browse Properties
              </a>
              <a href="/how-it-works" className="text-foreground hover:text-primary transition-smooth font-medium">
                How It Works
              </a>
              <a href="/landlords" className="text-foreground hover:text-primary transition-smooth font-medium">
                For Landlords
              </a>
              <div className="w-fit">
                <ConnectButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;