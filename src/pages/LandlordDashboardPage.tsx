import Header from "@/components/Header";
import LandlordDashboard from "@/components/LandlordDashboard";

const LandlordDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <LandlordDashboard />
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboardPage;
