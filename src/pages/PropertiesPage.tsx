import Header from "@/components/Header";
import PropertyListings from "@/components/PropertyListings";

const PropertiesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <PropertyListings />
      </main>
    </div>
  );
};

export default PropertiesPage;