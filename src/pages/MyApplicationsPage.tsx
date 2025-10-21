import Header from "@/components/Header";
import MyApplications from "@/components/MyApplications";

const MyApplicationsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <MyApplications />
        </div>
      </main>
    </div>
  );
};

export default MyApplicationsPage;
