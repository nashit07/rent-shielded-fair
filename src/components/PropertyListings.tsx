import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePropertiesReal } from "@/hooks/usePropertiesReal";
// Use public assets for Vercel deployment compatibility
const apartment1 = "/apartment-1.jpg";
const apartment2 = "/apartment-2.jpg";
const apartment3 = "/apartment-3.jpg";

const PropertyListings = () => {
  const { properties, loading: isLoading, error } = usePropertiesReal();
  
  // Default images for properties
  const defaultImages = [apartment1, apartment2, apartment3];
  
  // Convert contract properties to display format
  const displayProperties = properties.map((property, index) => ({
    id: property.id.toString(),
    title: property.name,
    location: property.location,
    price: `$${property.monthlyRent.toLocaleString()}/mo`,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.propertySize,
    image: defaultImages[index % defaultImages.length],
    deadline: new Date(property.applicationDeadline * 1000).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    isShielded: true,
    propertyId: property.id,
    isAvailable: property.isAvailable,
    propertyType: property.propertyType || 'apartment',
    amenities: property.amenities || '[]'
  }));

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Shielded Property Listings
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse encrypted rental opportunities. Submit your bid privately and compete fairly.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations, property types..." 
              className="pl-10 bg-privacy-surface border-privacy-primary/20 focus:border-privacy-primary"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Property Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading properties...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">Error loading properties: {error}</p>
            <p className="text-muted-foreground mt-2">Please check your connection and try again.</p>
          </div>
        ) : displayProperties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No properties available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-privacy-primary/30 hover:border-privacy-primary hover:bg-privacy-primary/10 transition-smooth"
          >
            Load More Properties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;