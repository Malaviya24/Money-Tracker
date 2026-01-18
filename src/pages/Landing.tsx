import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Menu, ArrowUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimatedSection, ParallaxSection } from "@/components/ScrollAnimations";
import { useScrollProgress } from "@/hooks/useScrollAnimation";
import { Logo } from "@/components/Logo";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Account for fixed nav
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-0.5 bg-foreground z-[60] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-16 md:h-20 items-center justify-between px-6 lg:px-8">
          <Logo to="/" size="lg" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#philosophy" 
              onClick={(e) => scrollToSection(e, "philosophy")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Philosophy
            </a>
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, "features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Features
            </a>
            <a 
              href="#insights" 
              onClick={(e) => scrollToSection(e, "insights")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
            >
              Insights
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="text-sm font-normal">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="text-sm font-medium px-5">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <div className="flex flex-col gap-6 mt-12">
                  <a 
                    href="#philosophy" 
                    className="text-lg" 
                    onClick={(e) => scrollToSection(e, "philosophy")}
                  >
                    Philosophy
                  </a>
                  <a 
                    href="#features" 
                    className="text-lg" 
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    Features
                  </a>
                  <a 
                    href="#insights" 
                    className="text-lg" 
                    onClick={(e) => scrollToSection(e, "insights")}
                  >
                    Insights
                  </a>
                  <div className="h-px bg-border my-4" />
                  <Button variant="outline" asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 lg:pt-48 pb-20 md:pb-32 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <AnimatedSection animation="fade-up" delay={0} animateOnLoad>
              <p className="text-sm text-muted-foreground tracking-wide uppercase mb-6">
                Financial clarity
              </p>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-up" delay={0.15} animateOnLoad>
              <h1>
                Track expenses with{" "}
                <span className="font-serif italic font-normal">clarity,</span>
                <br />
                not chaos.
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.3} animateOnLoad>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                A thoughtfully designed expense tracker for those who value 
                simplicity and intentional financial management.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.45} animateOnLoad>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Button size="lg" asChild className="h-12 px-8 text-base font-medium">
                  <Link to="/signup">
                    Start tracking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild className="h-12 px-6 text-base font-normal text-muted-foreground">
                  <Link to="/login">Already have an account?</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Abstract visual element with parallax */}
          <ParallaxSection speed={0.15} className="absolute top-32 right-8 lg:right-16 hidden lg:block pointer-events-none">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted/50 to-transparent blur-3xl animate-pulse" />
              <div className="absolute top-10 left-10 w-40 h-40 border border-border/50 rounded-full" />
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-accent/10 rounded-full" />
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 md:py-32 px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <AnimatedSection animation="fade-right">
              <div>
                <p className="text-sm text-muted-foreground tracking-wide uppercase mb-6">
                  Our Philosophy
                </p>
                <h2>
                  Designed for{" "}
                  <span className="font-serif italic font-normal">mindful</span>
                  {" "}spending
                </h2>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-left" delay={0.2}>
              <div className="lg:pt-12">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  We believe financial tools should reduce anxiety, not create it. 
                  Tracura is built on the principle that clarity leads to better decisions.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  No overwhelming dashboards. No gamified features. Just a calm, 
                  focused space to understand where your money goes—and why that matters.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 lg:px-8 bg-card border-t border-b border-border">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="fade-up" className="max-w-2xl mb-16 md:mb-24">
            <p className="text-sm text-muted-foreground tracking-wide uppercase mb-6">
              Core Features
            </p>
            <h2>
              Everything essential,{" "}
              <span className="font-serif italic font-normal">nothing</span> more
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                num: "01",
                title: "Expense Spaces",
                description: "Organize spending into dedicated spaces for travel, home, subscriptions, or any context that matters to you."
              },
              {
                num: "02",
                title: "Clear Analytics",
                description: "Understand patterns through minimal, readable charts. No data overload—just the insights you need."
              },
              {
                num: "03",
                title: "Quick Capture",
                description: "Log expenses in seconds. The interface stays out of your way, letting you record and move on."
              }
            ].map((feature, index) => (
              <AnimatedSection 
                key={feature.title} 
                animation="fade-up" 
                delay={index * 0.15}
              >
                <div className="group relative pl-6 border-l-2 border-border hover:border-foreground transition-colors duration-300">
                  <span className="absolute -left-3 top-0 bg-card px-1 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.num}
                  </span>
                  <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection animation="zoom-in" className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
            <p className="text-sm text-muted-foreground tracking-wide uppercase mb-6">
              How it works
            </p>
            <h2>
              Three steps to{" "}
              <span className="font-serif italic font-normal">financial</span> clarity
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: "01",
                title: "Create Spaces",
                description: "Set up dedicated spaces for different areas of your life—travel, daily expenses, projects, or goals."
              },
              {
                step: "02",
                title: "Track Expenses",
                description: "Log transactions as they happen. Each expense finds its place, building a complete picture over time."
              },
              {
                step: "03",
                title: "Gain Clarity",
                description: "Review spending patterns through clean analytics. Make informed decisions with confidence."
              }
            ].map((item, index) => (
              <AnimatedSection 
                key={item.step} 
                animation="fade-up" 
                delay={index * 0.2}
              >
                <div className="group relative">
                  {/* Decorative number with gradient and glow effect */}
                  <div className="relative mb-6">
                    <span className="text-7xl md:text-8xl font-extralight tracking-tighter bg-gradient-to-br from-foreground/20 via-foreground/10 to-transparent bg-clip-text text-transparent select-none">
                      {item.step}
                    </span>
                    {/* Accent line under number */}
                    <div className="absolute -bottom-2 left-0 h-px w-12 bg-gradient-to-r from-foreground/40 to-transparent group-hover:w-20 transition-all duration-500" />
                    {/* Subtle glow dot */}
                    <div className="absolute top-4 -left-2 h-2 w-2 rounded-full bg-accent/30 blur-sm group-hover:bg-accent/50 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="insights" className="py-24 md:py-32 px-6 lg:px-8 bg-card border-t border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <AnimatedSection animation="fade-right">
              <div>
                <p className="text-sm text-muted-foreground tracking-wide uppercase mb-6">
                  Analytics & Insights
                </p>
                <h2 className="mb-8">
                  Data that{" "}
                  <span className="font-serif italic font-normal">informs,</span>
                  <br />
                  not overwhelms
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Our charts are designed for comprehension at a glance. 
                  See monthly trends, category breakdowns, and budget progress 
                  without visual noise.
                </p>
                <ul className="space-y-4">
                  {["Monthly spending trends", "Category distribution", "Budget tracking"].map((item, index) => (
                    <AnimatedSection key={item} animation="fade-left" delay={0.3 + index * 0.1}>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {item}
                      </li>
                    </AnimatedSection>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="flip-up" delay={0.2}>
              <AnalyticsCard />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 lg:px-8 bg-foreground text-background overflow-hidden">
        <AnimatedSection animation="zoom-in" className="max-w-4xl mx-auto text-center">
          <h2 className="text-background mb-6">
            Ready for{" "}
            <span className="font-serif italic font-normal">financial</span>
            {" "}clarity?
          </h2>
          <p className="text-lg text-background/70 max-w-2xl mx-auto mb-10">
            Join those who have chosen a calmer approach to expense tracking. 
            No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="h-12 px-8 text-base font-medium bg-background text-foreground hover:bg-background/90"
          >
            <Link to="/signup">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo to="/" size="md" />

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tracura
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          showBackToTop 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}

// Separate component for analytics card with animated bars
function AnalyticsCard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    { label: "Housing", value: 45, amount: "₹1,28,100" },
    { label: "Food & Dining", value: 25, amount: "₹71,200" },
    { label: "Transport", value: 15, amount: "₹42,700" },
    { label: "Other", value: 15, amount: "₹42,700" }
  ];

  return (
    <div className="bg-background rounded-xl border border-border p-8">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm text-muted-foreground">Monthly Overview</span>
        <span className="text-2xl font-medium">₹2,84,700</span>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{item.label}</span>
              <span>{item.amount}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground/80 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: isVisible ? `${item.value}%` : '0%',
                  transitionDelay: `${index * 150}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
