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
      <section className="py-16 bg-gradient-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-foreground mb-4">
            Check Your Registration Status
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Track your training registrations and contact submissions
          </p>
          <RegistrationStatusChecker />
        </div>
      </section>
      
      <WhyChooseUs />
    </Layout>
  );
};

export default Index;
