import Header from "@/components/Header";
import ApplicationDecryption from "@/components/ApplicationDecryption";

const ApplicationDecryptionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <ApplicationDecryption />
        </div>
      </main>
    </div>
  );
};

export default ApplicationDecryptionPage;
