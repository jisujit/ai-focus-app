import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import ServicesPreview from "@/components/ServicesPreview";
import WhyChooseUs from "@/components/WhyChooseUs";
import RegistrationStatusChecker from "@/components/RegistrationStatusChecker";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesPreview />
      
      {/* Registration Status Section */}
      <section id="registration-status" className="py-16 bg-gradient-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-strong p-8 border border-accent/10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-xl">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                View Your Registrations
              </h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Track your training registrations, view session details, and download receipts
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Use the email address you registered with to view all your registrations and their current status.
              </p>
            </div>
            <RegistrationStatusChecker />
          </div>
        </div>
      </section>
      
      <WhyChooseUs />
    </Layout>
  );
};

export default Index;
