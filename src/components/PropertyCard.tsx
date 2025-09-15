import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Clock, Shield } from "lucide-react";
import { useState } from "react";
import BidModal from "./BidModal";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  deadline: string;
  isShielded?: boolean;
  propertyId: number;
}

const PropertyCard = ({ 
  title, 
  location, 
  price, 
  bedrooms, 
  bathrooms, 
  area, 
  image, 
  deadline,
  isShielded = true,
  propertyId
}: PropertyCardProps) => {
  const [showBidModal, setShowBidModal] = useState(false);
  return (
    <Card className="group overflow-hidden bg-gradient-shield border-privacy-primary/20 hover:border-privacy-primary/40 transition-all duration-300 hover:shadow-card backdrop-blur-sm">
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isShielded && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-privacy-primary/90 text-primary-foreground border-0">
              <Shield className="w-3 h-3 mr-1" />
              Shielded
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-smooth">{title}</h3>
          <span className="text-2xl font-bold text-primary">{price}</span>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            {bedrooms} bed
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            {bathrooms} bath
          </div>
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-1" />
            {area} sqft
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            Deadline: {deadline}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10 transition-smooth"
          onClick={() => setShowBidModal(true)}
        >
          Submit Encrypted Bid
        </Button>
        
        <BidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          propertyTitle={title}
          propertyPrice={price}
          propertyId={propertyId}
        />
      </div>
    </Card>
  );
};

export default PropertyCard;