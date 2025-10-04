const Footer = () => {
  // Production mode indicator
  const isProduction = import.meta.env.PROD && 
    import.meta.env.VITE_SUPABASE_URL?.includes('fvazftacytreklsmmbcr') &&
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');

  return (
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 AI Focus Technologies. All rights reserved.</p>
          {isProduction && (
            <div className="text-xs text-muted-foreground/50 mt-2">
              🔒 Production Mode
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;