import { Button } from "@/components/ui/button";
import { Home, Menu, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-privacy-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RentShield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/properties" className="text-foreground hover:text-primary transition-smooth font-medium">
              Browse Properties
            </Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-smooth font-medium">
              How It Works
            </Link>
            <Link to="/landlords" className="text-foreground hover:text-primary transition-smooth font-medium">
              For Landlords
            </Link>
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
              <Link to="/properties" className="text-foreground hover:text-primary transition-smooth font-medium" onClick={() => setIsMenuOpen(false)}>
                Browse Properties
              </Link>
              <Link to="/how-it-works" className="text-foreground hover:text-primary transition-smooth font-medium" onClick={() => setIsMenuOpen(false)}>
                How It Works
              </Link>
              <Link to="/landlords" className="text-foreground hover:text-primary transition-smooth font-medium" onClick={() => setIsMenuOpen(false)}>
                For Landlords
              </Link>
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