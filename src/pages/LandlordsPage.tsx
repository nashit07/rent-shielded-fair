import Header from "@/components/Header";
import ForLandlords from "@/components/ForLandlords";

const LandlordsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <ForLandlords />
      </main>
    </div>
  );
};

export default LandlordsPage;