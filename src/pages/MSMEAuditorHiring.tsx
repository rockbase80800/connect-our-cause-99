import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  ClipboardCheck,
  MapPin,
  FileText,
  Users,
  Briefcase,
  Smartphone,
  Bike,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  HelpCircle,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  BadgeIndianRupee,
  Building2,
  Search,
  FileCheck,
  IdCard,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ── tiny scroll-reveal wrapper ── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal(0.12);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-5 blur-[3px]"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Section wrapper for consistent padding ── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 px-6 md:px-12 lg:px-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

/* ── Section heading ── */
function SectionHeading({
  hi,
  en,
  icon: Icon,
}: {
  hi: string;
  en: string;
  icon?: React.ElementType;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 mb-8">
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-[hsl(215_70%_50%)]/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-[hsl(215_70%_50%)]" />
          </div>
        )}
        <div>
          <h2 className="text-display text-xl md:text-3xl text-foreground leading-tight">
            {hi}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">{en}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Process step ── */
function ProcessStep({
  step,
  hi,
  en,
  icon: Icon,
  delay,
}: {
  step: number;
  hi: string;
  en: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex items-start gap-4 group">
        <div className="relative shrink-0">
          <div className="h-12 w-12 rounded-2xl bg-[hsl(215_70%_50%)] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[hsl(215_70%_50%)]/20 group-hover:scale-105 transition-transform">
            {step}
          </div>
        </div>
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-[hsl(215_70%_50%)]" />
            <p className="font-semibold text-foreground">{hi}</p>
          </div>
          <p className="text-muted-foreground text-sm">{en}</p>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════ */
/*                  MAIN PAGE                     */
/* ═══════════════════════════════════════════════ */

export default function MSMEAuditorHiring() {
  const responsibilities = [
    { hi: "फील्ड सत्यापन (Field Verification)", en: "Conduct on-site field verification of MSME units", icon: Search },
    { hi: "साइट विजिट (Site Visits)", en: "Visit business locations for physical inspection", icon: MapPin },
    { hi: "दस्तावेज़ सत्यापन (Document Verification)", en: "Verify business documents, licenses, and certificates", icon: FileCheck },
    { hi: "व्यापार ऑडिट सहायता (Business Audit Support)", en: "Support the audit process with data collection and reporting", icon: ClipboardCheck },
    { hi: "रिपोर्ट तैयारी (Report Preparation)", en: "Prepare detailed verification and audit reports", icon: FileText },
    { hi: "रिपोर्ट सबमिशन (Report Submission)", en: "Submit completed reports within assigned timelines", icon: Briefcase },
    { hi: "स्थानीय समन्वय (Local Coordination)", en: "Coordinate with local business owners and stakeholders as required", icon: Users },
  ];

  const eligibility = [
    { hi: "12वीं पास / स्नातक", en: "12th pass or graduate", icon: BookOpen },
    { hi: "फ्रेशर्स और अनुभवी दोनों आवेदन कर सकते हैं", en: "Freshers and experienced candidates both welcome", icon: Users },
    { hi: "बाइक प्राथमिक / आवश्यक (फील्ड मोबिलिटी हेतु)", en: "Bike preferred / required for field mobility", icon: Bike },
    { hi: "ड्राइविंग लाइसेंस प्राथमिक", en: "Driving license preferred", icon: IdCard },
    { hi: "स्मार्टफोन आवश्यक", en: "Smartphone required", icon: Smartphone },
    { hi: "अच्छी संवाद क्षमता", en: "Good communication skills", icon: MessageCircle },
    { hi: "फील्ड वर्क के लिए तैयार", en: "Ready for field work", icon: MapPin },
    { hi: "स्थानीय क्षेत्र का ज्ञान लाभदायक", en: "Local area knowledge is an advantage", icon: Star },
  ];

  const processSteps = [
    { hi: "आवेदन / रिज़्यूमे जमा करें", en: "Application / Resume Submission", icon: FileText },
    { hi: "प्रारंभिक स्क्रीनिंग", en: "Initial Screening", icon: Search },
    { hi: "साक्षात्कार (Interview)", en: "Interview Round", icon: Users },
    { hi: "साक्षात्कार प्रश्नोत्तरी वेबसाइट पर उपलब्ध", en: "Interview Q&A available on website for preparation", icon: BookOpen },
    { hi: "दस्तावेज़ सत्यापन", en: "Document Verification", icon: FileCheck },
    { hi: "MSME ID कार्ड जारी", en: "MSME ID Card Issuance", icon: IdCard },
    { hi: "ID कार्ड प्राप्ति के बाद कार्य आरंभ", en: "Work begins after ID Card received", icon: Rocket },
  ];

  const benefits = [
    { hi: "व्यवस्थित और पारदर्शी प्रक्रिया", en: "Structured and transparent process" },
    { hi: "व्यावसायिक फील्ड अनुभव", en: "Professional field experience" },
    { hi: "लचीला कार्य मॉडल (Flexible Work)", en: "Flexible work model — freelance / part-time" },
    { hi: "अपने जिले / स्थानीय क्षेत्र में काम का अवसर", en: "Work opportunity in your district / local area" },
    { hi: "करियर एक्सपोज़र और ग्रोथ", en: "Career exposure and growth potential" },
    { hi: "व्यावहारिक रिपोर्टिंग और सत्यापन कौशल", en: "Practical reporting and verification skills" },
    { hi: "₹30,000 प्रति माह तक कमाने की संभावना", en: "Potential to earn up to ₹30,000 per month" },
  ];

  const faqs: { q_hi: string; q_en: string; a_hi: string; a_en: string }[] = [
    {
      q_hi: "यह भूमिका क्या है?",
      q_en: "What is this role?",
      a_hi: "यह MSME इकाइयों के लिए फील्ड सत्यापन, ऑडिट सहायता और रिपोर्ट सबमिशन की भूमिका है।",
      a_en: "This is a role for field verification, audit support, and report submission for MSME units.",
    },
    {
      q_hi: "क्या यह फुल-टाइम है या पार्ट-टाइम?",
      q_en: "Is this full-time or part-time?",
      a_hi: "यह फ्रीलांस / पार्ट-टाइम अवसर है। आप अपने समय अनुसार काम कर सकते हैं।",
      a_en: "This is a freelance / part-time opportunity. You can work according to your schedule.",
    },
    {
      q_hi: "कौन आवेदन कर सकता है?",
      q_en: "Who can apply?",
      a_hi: "12वीं पास या स्नातक उम्मीदवार, फ्रेशर्स और अनुभवी दोनों आवेदन कर सकते हैं।",
      a_en: "12th pass or graduate candidates — both freshers and experienced professionals can apply.",
    },
    {
      q_hi: "क्या फील्ड वर्क आवश्यक है?",
      q_en: "Is field work required?",
      a_hi: "हाँ, इस भूमिका में साइट विजिट और फील्ड सत्यापन आवश्यक है।",
      a_en: "Yes, this role involves site visits and field verification.",
    },
    {
      q_hi: "क्या बाइक होना ज़रूरी है?",
      q_en: "Is a bike necessary?",
      a_hi: "फील्ड मोबिलिटी के लिए बाइक प्राथमिक / आवश्यक है।",
      a_en: "A bike is preferred / required for field mobility.",
    },
    {
      q_hi: "काम कब शुरू हो सकता है?",
      q_en: "When can I start work?",
      a_hi: "MSME ID कार्ड प्राप्त होने के बाद ही कार्य प्रारंभ होगा। पूरी प्रक्रिया में 4-5 दिन लग सकते हैं।",
      a_en: "Work can begin only after receiving the MSME ID Card. The complete process may take 4–5 days.",
    },
    {
      q_hi: "ID कार्ड कहाँ प्राप्त होगा?",
      q_en: "Where will I receive the ID Card?",
      a_hi: "MSME ID कार्ड आपके पंजीकृत Gmail ID पर भेजा जाएगा।",
      a_en: "The MSME ID Card will be sent to your registered Gmail ID.",
    },
    {
      q_hi: "अगर 5 दिन में ID कार्ड नहीं मिला तो?",
      q_en: "What if I do not receive the ID Card within 5 days?",
      a_hi: "कृपया पहले अपने सीनियर को सूचित करें, फिर कार्यालय से संपर्क करें।",
      a_en: "Please inform your senior first, then contact the office for assistance.",
    },
    {
      q_hi: "क्या इंटरव्यू तैयारी सामग्री उपलब्ध है?",
      q_en: "Is interview preparation material available?",
      a_hi: "हाँ, वेबसाइट पर साक्षात्कार प्रश्नोत्तरी उपलब्ध है। कृपया इंटरव्यू से पहले इसे अवश्य देखें।",
      a_en: "Yes, an interview Q&A section is available on the website. Please review it before attending.",
    },
    {
      q_hi: "क्या फ्रेशर्स आवेदन कर सकते हैं?",
      q_en: "Can freshers apply?",
      a_hi: "हाँ, फ्रेशर्स और अनुभवी उम्मीदवार दोनों का स्वागत है।",
      a_en: "Yes, both freshers and experienced candidates are welcome to apply.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════ 1. HERO ═══════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[hsl(215_30%_12%)]">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215_50%_18%)] via-[hsl(215_30%_12%)] to-[hsl(215_20%_8%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 md:py-40 w-full">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(40_60%_60%)]/30 bg-[hsl(40_60%_60%)]/10 text-[hsl(40_70%_70%)] text-xs font-semibold uppercase tracking-widest mb-6 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Official Recruitment / आधिकारिक भर्ती
            </div>

            <h1
              className="text-display text-3xl md:text-5xl lg:text-6xl mb-2 animate-reveal-up"
              style={{ color: "hsl(0 0% 98%)", animationDelay: "350ms", lineHeight: 1.1 }}
            >
              MSME ऑडिटर / सर्विलांस असेसर भर्ती
            </h1>
            <p
              className="text-lg md:text-2xl font-medium animate-reveal-up mb-6"
              style={{ color: "hsl(215 30% 75%)", animationDelay: "450ms" }}
            >
              MSME Auditor / Surveillance Assessor Hiring
            </p>

            <p
              className="text-base md:text-lg leading-relaxed mb-6 animate-reveal-up max-w-2xl"
              style={{ color: "hsl(215 20% 70%)", animationDelay: "550ms" }}
            >
              पूरे भारत में फ्रीलांस / पार्ट-टाइम फील्ड ऑडिट और सत्यापन कार्य का अवसर।
              <br />
              Freelance / part-time field audit and verification opportunity across India.
            </p>

            {/* Earning highlight */}
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[hsl(40_70%_52%)]/15 border border-[hsl(40_70%_52%)]/30 mb-8 animate-reveal-up"
              style={{ animationDelay: "650ms" }}
            >
              <BadgeIndianRupee className="h-7 w-7 text-[hsl(40_70%_55%)]" />
              <div>
                <p className="font-bold text-lg text-[hsl(40_70%_70%)]">
                  ₹30,000 महीना कमाएं
                </p>
                <p className="text-sm text-[hsl(40_50%_60%)]">
                  Earn ₹30,000 per month
                </p>
              </div>
            </div>

            <div
              className="flex flex-wrap gap-4 animate-reveal-up"
              style={{ animationDelay: "750ms" }}
            >
              <a href="#apply">
                <Button
                  size="lg"
                  className="bg-[hsl(215_70%_50%)] text-white font-semibold hover:bg-[hsl(215_70%_45%)] active:scale-[0.97] transition-all shadow-lg shadow-[hsl(215_70%_50%)]/25 text-base px-8 py-6"
                >
                  Apply Now / आवेदन करें
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
              <a href="#interview-prep">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 font-semibold text-base px-8 py-6 active:scale-[0.97] transition-all"
                  style={{
                    borderColor: "hsl(215 30% 50% / 0.4)",
                    color: "hsl(0 0% 92%)",
                    backgroundColor: "transparent",
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Interview Q&A देखें
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. ABOUT THE OPPORTUNITY ═══════ */}
      <Section className="bg-background">
        <SectionHeading
          hi="अवसर के बारे में"
          en="About the Opportunity"
          icon={Briefcase}
        />
        <Reveal delay={100}>
          <Card className="shadow-md border-border/60">
            <CardContent className="p-6 md:p-8 space-y-4">
              <p className="text-foreground leading-relaxed">
                यह भूमिका MSME इकाइयों के फील्ड सत्यापन, साइट विजिट, दस्तावेज़ जाँच, ऑडिट सहायता और रिपोर्ट सबमिशन के लिए है। यह अवसर पूरे भारत में उपलब्ध है और फ्रेशर्स तथा अनुभवी उम्मीदवारों दोनों के लिए उपयुक्त है।
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This role involves field verification, site visits, document checking, audit support, and report submission for MSME units. The opportunity is available across India and is suitable for both freshers and experienced candidates looking for freelance / part-time field work.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                उम्मीदवार अपने जिले या निकटवर्ती क्षेत्र में असाइनमेंट उपलब्धता के अनुसार कार्य कर सकते हैं।
                <br />
                Candidates can work in their district or nearby area depending on assignment availability.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      {/* ═══════ 3. ROLES & RESPONSIBILITIES ═══════ */}
      <Section className="bg-secondary/30">
        <SectionHeading
          hi="भूमिकाएँ और ज़िम्मेदारियाँ"
          en="Roles and Responsibilities"
          icon={ClipboardCheck}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          {responsibilities.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <Card className="shadow-sm hover:shadow-md transition-shadow border-border/60">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl bg-[hsl(215_70%_50%)]/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4.5 w-4.5 text-[hsl(215_70%_50%)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.hi}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.en}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════ 4. ELIGIBILITY ═══════ */}
      <Section className="bg-background">
        <SectionHeading
          hi="पात्रता मानदंड"
          en="Eligibility Criteria"
          icon={ShieldCheck}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          {eligibility.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
                <div className="h-8 w-8 rounded-lg bg-[hsl(142_50%_45%)]/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-[hsl(142_50%_45%)]" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.hi}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{item.en}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════ 5. SELECTION PROCESS ═══════ */}
      <Section className="bg-secondary/30">
        <SectionHeading
          hi="चयन और कार्य प्रारंभ प्रक्रिया"
          en="Selection and Work Start Process"
          icon={Rocket}
        />
        <div className="space-y-6 relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-px bg-border hidden sm:block" />
          {processSteps.map((step, i) => (
            <ProcessStep
              key={i}
              step={i + 1}
              hi={step.hi}
              en={step.en}
              icon={step.icon}
              delay={i * 80}
            />
          ))}
        </div>

        <Reveal delay={600}>
          <Card className="mt-8 border-[hsl(215_70%_50%)]/20 bg-[hsl(215_70%_50%)]/5">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[hsl(215_70%_50%)] font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                महत्वपूर्ण / Important
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                • साक्षात्कार (Interview) होगा। तैयारी के लिए प्रश्नोत्तरी वेबसाइट पर उपलब्ध है।
                <br />
                • An interview will be conducted. Q&A for preparation is available on the website.
              </p>
              <p className="text-foreground text-sm leading-relaxed">
                • कार्य केवल MSME ID कार्ड प्राप्त होने के बाद ही शुरू किया जा सकता है।
                <br />
                • Work can begin only after the MSME ID Card is received.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      {/* ═══════ 6. IMPORTANT INSTRUCTIONS ═══════ */}
      <Section className="bg-background">
        <SectionHeading
          hi="महत्वपूर्ण निर्देश"
          en="Important Instructions"
          icon={AlertTriangle}
        />
        <Reveal delay={100}>
          <Card className="shadow-md border-[hsl(40_60%_55%)]/20 bg-[hsl(40_60%_55%)]/5">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div className="space-y-3 text-foreground text-sm leading-relaxed">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[hsl(40_60%_50%)] mt-0.5 shrink-0" />
                  <p>
                    पूरी प्रक्रिया में 4 से 5 दिन का समय लग सकता है।
                    <br />
                    <span className="text-muted-foreground">The complete process may take 4 to 5 days.</span>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="h-4 w-4 text-[hsl(40_60%_50%)] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      कृपया प्रक्रिया पूर्ण होने तक प्रतीक्षा करें। सभी आवश्यक अपडेट कार्यालय द्वारा कॉल और WhatsApp के माध्यम से साझा किए जाएंगे।
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Please wait until the process is completed. All necessary updates will be shared by the office through call and WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[hsl(40_60%_50%)] mt-0.5 shrink-0" />
                  <p>
                    MSME ID कार्ड सीधे आवेदक की पंजीकृत Gmail ID पर भेजा जाएगा।
                    <br />
                    <span className="text-muted-foreground">The MSME ID Card will be sent directly to the applicant's registered Gmail ID.</span>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[hsl(40_60%_50%)] mt-0.5 shrink-0" />
                  <p>
                    यदि 5 दिनों के भीतर ID कार्ड प्राप्त नहीं होता है, तो कृपया पहले अपने सीनियर को सूचित करें और फिर कार्यालय से संपर्क करें।
                    <br />
                    <span className="text-muted-foreground">If the ID Card is not received within 5 days, please inform your senior first, then contact the office.</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      {/* ═══════ 7. WHY JOIN ═══════ */}
      <Section className="bg-secondary/30">
        <SectionHeading
          hi="यह अवसर क्यों चुनें?"
          en="Why Join This Opportunity?"
          icon={Star}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card">
                <CheckCircle2 className="h-5 w-5 text-[hsl(142_50%_45%)] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{b.hi}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{b.en}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════ 8. INTERVIEW PREP ═══════ */}
      <Section id="interview-prep" className="bg-background">
        <SectionHeading
          hi="साक्षात्कार तैयारी"
          en="Interview Preparation"
          icon={BookOpen}
        />
        <Reveal delay={100}>
          <Card className="shadow-md border-[hsl(215_70%_50%)]/20">
            <CardContent className="p-6 md:p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-[hsl(215_70%_50%)]/10 flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-[hsl(215_70%_50%)]" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">
                साक्षात्कार प्रश्नोत्तरी उपलब्ध है
              </h3>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                वेबसाइट पर इंटरव्यू की तैयारी के लिए प्रश्न और उत्तर उपलब्ध हैं। कृपया साक्षात्कार में शामिल होने से पहले इन्हें अवश्य पढ़ें।
              </p>
              <p className="text-muted-foreground text-xs max-w-lg mx-auto">
                Interview preparation questions and answers are available on the website. Please review them before attending the interview.
              </p>
              <a href="#apply">
                <Button
                  className="bg-[hsl(215_70%_50%)] text-white font-semibold hover:bg-[hsl(215_70%_45%)] active:scale-[0.97] transition-all mt-2"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Interview Questions & Answers
                </Button>
              </a>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      {/* ═══════ 9. FAQ ═══════ */}
      <Section className="bg-secondary/30">
        <SectionHeading hi="अक्सर पूछे जाने वाले प्रश्न" en="Frequently Asked Questions" icon={HelpCircle} />
        <Reveal delay={100}>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4 bg-card">
                <AccordionTrigger className="hover:no-underline text-left">
                  <div>
                    <p className="font-medium text-foreground text-sm">{faq.q_hi}</p>
                    <p className="text-muted-foreground text-xs">{faq.q_en}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground text-sm">{faq.a_hi}</p>
                  <p className="text-muted-foreground text-xs mt-1">{faq.a_en}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Section>

      {/* ═══════ 10. DISCLAIMER ═══════ */}
      <Section className="bg-background">
        <SectionHeading hi="अस्वीकरण" en="Disclaimer" icon={ShieldCheck} />
        <Reveal delay={100}>
          <Card className="border-border/60">
            <CardContent className="p-6 md:p-8 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                • चयन प्रक्रिया स्क्रीनिंग, साक्षात्कार और दस्तावेज़ सत्यापन पर आधारित है।
                <br />
                <span className="text-muted-foreground/70">Selection is subject to screening, interview, and document verification.</span>
              </p>
              <p>
                • कार्य असाइनमेंट की उपलब्धता जिले और परिचालन आवश्यकताओं के अनुसार भिन्न हो सकती है।
                <br />
                <span className="text-muted-foreground/70">Work assignment availability may vary by district and operational requirements.</span>
              </p>
              <p>
                • ID कार्ड जारी करना और ऑनबोर्डिंग प्रक्रिया आंतरिक सत्यापन वर्कफ़्लो के अनुसार होती है।
                <br />
                <span className="text-muted-foreground/70">ID Card issuance and onboarding process follow internal verification workflow.</span>
              </p>
              <p>
                • वेबसाइट पर दी गई जानकारी आवेदक मार्गदर्शन और प्रक्रिया स्पष्टता हेतु है।
                <br />
                <span className="text-muted-foreground/70">Website information is for applicant guidance and process clarity.</span>
              </p>
              <p>
                • अंतिम संचार आधिकारिक कार्यालय टीम द्वारा साझा किया जाएगा।
                <br />
                <span className="text-muted-foreground/70">Final communication will be shared by the official office team.</span>
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </Section>

      {/* ═══════ 11. APPLY NOW (FINAL CTA) ═══════ */}
      <Section id="apply" className="bg-[hsl(215_30%_12%)] text-white">
        <Reveal>
          <div className="text-center space-y-6">
            <h2
              className="text-display text-2xl md:text-4xl"
              style={{ color: "hsl(0 0% 96%)", lineHeight: 1.15 }}
            >
              आज ही आवेदन करें
              <br />
              <span className="text-[hsl(215_50%_70%)]">Apply Today</span>
            </h2>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[hsl(40_70%_52%)]/15 border border-[hsl(40_70%_52%)]/30">
              <BadgeIndianRupee className="h-6 w-6 text-[hsl(40_70%_55%)]" />
              <div>
                <p className="font-bold text-lg text-[hsl(40_70%_70%)]">
                  ₹30,000 महीना कमाएं / Earn ₹30,000 per month
                </p>
              </div>
            </div>

            <div>
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-[hsl(215_70%_50%)] text-white font-semibold hover:bg-[hsl(215_70%_45%)] active:scale-[0.97] transition-all shadow-lg shadow-[hsl(215_70%_50%)]/25 text-base px-10 py-6"
                >
                  Apply Now / आवेदन करें
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-[hsl(215_20%_55%)] text-xs max-w-md mx-auto">
              रिज़्यूमे सबमिशन और आगे की प्रक्रिया का विवरण आधिकारिक टीम द्वारा साझा किया जाएगा।
              <br />
              Resume submission and further process details will be shared by the official team.
            </p>

            {/* Trust contact info */}
            <div className="pt-6 border-t border-white/10 mt-8 space-y-2">
              <p className="text-[hsl(215_20%_60%)] text-xs uppercase tracking-wider font-medium">
                Office Support / कार्यालय सहायता
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-[hsl(215_20%_70%)]">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  +91 7073741421
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp: +91 9351018521
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  info@meripahafasthelp.org
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <Footer />
    </div>
  );
}
