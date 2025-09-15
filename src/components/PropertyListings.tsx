import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";

const PropertyListings = () => {
  const properties = [
    {
      id: "1",
      title: "Downtown Luxury Studio",
      location: "Manhattan, NY",
      price: "$3,200/mo",
      bedrooms: 1,
      bathrooms: 1,
      area: 650,
      image: apartment1,
      deadline: "Dec 20, 2024",
      isShielded: true
    },
    {
      id: "2", 
      title: "Skyline Penthouse",
      location: "Midtown, NY",
      price: "$8,500/mo",
      bedrooms: 3,
      bathrooms: 2,
      area: 1400,
      image: apartment2,
      deadline: "Dec 18, 2024",
      isShielded: true
    },
    {
      id: "3",
      title: "Industrial Loft",
      location: "Brooklyn, NY", 
      price: "$2,800/mo",
      bedrooms: 2,
      bathrooms: 1,
      area: 950,
      image: apartment3,
      deadline: "Dec 22, 2024",
      isShielded: true
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

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