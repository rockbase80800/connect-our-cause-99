import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "hi";

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "Projects": { en: "Projects", hi: "परियोजनाएं" },
  "About": { en: "About", hi: "हमारे बारे में" },
  "Gallery": { en: "Gallery", hi: "गैलरी" },
  "Videos": { en: "Videos", hi: "वीडियो" },
  "Legal Docs": { en: "Legal Docs", hi: "कानूनी दस्तावेज" },
  "Contact": { en: "Contact", hi: "संपर्क करें" },
  "Join Now": { en: "Join Now", hi: "अभी जुड़ें" },
  // Auth
  "Create Account": { en: "Create Account", hi: "खाता बनाएं" },
  "Welcome Back": { en: "Welcome Back", hi: "वापसी पर स्वागत है" },
  "Sign In": { en: "Sign In", hi: "साइन इन" },
  "Sign Up": { en: "Sign Up", hi: "साइन अप" },
  "Full Name": { en: "Full Name", hi: "पूरा नाम" },
  "Email": { en: "Email", hi: "ईमेल" },
  "Password": { en: "Password", hi: "पासवर्ड" },
  "Mobile Number": { en: "Mobile Number", hi: "मोबाइल नंबर" },
  "Address": { en: "Address", hi: "पता" },
  "Referral Code (optional)": { en: "Referral Code (optional)", hi: "रेफरल कोड (वैकल्पिक)" },
  // Dashboard
  "Dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "My Applications": { en: "My Applications", hi: "मेरे आवेदन" },
  "My Team": { en: "My Team", hi: "मेरी टीम" },
  "Profile": { en: "Profile", hi: "प्रोफ़ाइल" },
  "Notifications": { en: "Notifications", hi: "सूचनाएं" },
  "More": { en: "More", hi: "और" },
  "Active Projects": { en: "Active Projects", hi: "सक्रिय परियोजनाएं" },
  "My Referrals": { en: "My Referrals", hi: "मेरे रेफरल" },
  "Direct Referrals": { en: "Direct Referrals", hi: "सीधे रेफरल" },
  "Total Team": { en: "Total Team", hi: "कुल टीम" },
  // Common
  "Download": { en: "Download", hi: "डाउनलोड" },
  "Share": { en: "Share", hi: "शेयर" },
  "Apply Now": { en: "Apply Now", hi: "अभी आवेदन करें" },
  "Login to Apply": { en: "Login to Apply", hi: "आवेदन के लिए लॉगिन करें" },
  "Submit": { en: "Submit", hi: "सबमिट करें" },
  "Cancel": { en: "Cancel", hi: "रद्द करें" },
  "Delete": { en: "Delete", hi: "हटाएं" },
  "View": { en: "View", hi: "देखें" },
  "Search": { en: "Search", hi: "खोजें" },
  "Loading...": { en: "Loading...", hi: "लोड हो रहा है..." },
  // Admin
  "Manage Users": { en: "Manage Users", hi: "उपयोगकर्ता प्रबंधन" },
  "Manage Projects": { en: "Manage Projects", hi: "परियोजना प्रबंधन" },
  "Applications": { en: "Applications", hi: "आवेदन" },
  "Analytics": { en: "Analytics", hi: "विश्लेषण" },
  "Settings": { en: "Settings", hi: "सेटिंग्स" },
  "Wallet Balance": { en: "Wallet Balance", hi: "वॉलेट बैलेंस" },
  "Total Earnings": { en: "Total Earnings", hi: "कुल कमाई" },
  // Pages
  "Photo Gallery": { en: "Photo Gallery", hi: "फोटो गैलरी" },
  "Legal Documents": { en: "Legal Documents", hi: "कानूनी दस्तावेज" },
  "Our Websites": { en: "Our Websites", hi: "हमारी वेबसाइटें" },
  "Visit Website": { en: "Visit Website", hi: "वेबसाइट देखें" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("app_lang") as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
