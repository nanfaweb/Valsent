import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PricingCard } from "@/components/ui/PricingCard";
import styles from "./page.module.css";
import { BookOpen, Clock, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Master Your University Entry Test with <span className={styles.highlight}>Valsent</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Comprehensive mock exams, real-time analytics, and expert-curated content
              to ensure you get into your dream university.
            </p>
            <div className={styles.heroActions}>
              <Link href="/pricing">
                <Button size="lg" variant="primary">Start Practicing Now</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Why Choose Valsent?</h2>
            <p>We provide the most realistic and effective preparation tools.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><Clock size={32} /></div>
              <h3>Timed Mock Exams</h3>
              <p>Simulate real exam conditions with our timer-based testing environment.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><Trophy size={32} /></div>
              <h3>Performance Tracking</h3>
              <p>Get detailed insights into your strengths and areas for improvement.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.iconWrapper}><BookOpen size={32} /></div>
              <h3>Subject Mastery</h3>
              <p>Focused practice questions for every subject included in the entry test.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricing}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Simple, Affordable Pricing</h2>
            <p>One plan, full access. No hidden fees.</p>
          </div>
          <div className={styles.pricingWrapper}>
            <PricingCard />
          </div>
        </div>
      </section>

      {/* Testimonials (Static for now, seeded later) */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Student Success Stories</h2>
          </div>
          <div className={styles.grid}>
            <div className={styles.testimonialCard}>
              <p className={styles.quote}>"Valsent was a game changer for me. The timed mocks helped me manage my time perfectly during the actual exam."</p>
              <div className={styles.author}>
                <div className={styles.avatar}>A</div>
                <div>
                  <h4>Ali Khan</h4>
                  <span>LUMS Student</span>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <p className={styles.quote}>"The analytics showed me exactly where I was losing marks. Highly recommended!"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>S</div>
                <div>
                  <h4>Sara Ahmed</h4>
                  <span>NUST Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.faq}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>How long do I have access?</h3>
              <p>Once you purchase the Full Access Pass, you have unlimited access until the chosen degree's entry exam.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Can I retake exams?</h3>
              <p>Yes, you can attempt mock exams as many times as you like to improve your score.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
