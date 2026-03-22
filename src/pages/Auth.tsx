import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const DISTRICTS: Record<string, string[]> = {
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Gorakhpur", "Meerut", "Noida", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad", "Jhansi", "Mathura", "Firozabad", "Sultanpur", "Faizabad", "Barabanki", "Sitapur", "Hardoi"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Ara", "Begusarai", "Katihar", "Munger"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
};

const DESIGNATIONS = [
  "State Coordinator",
  "District Coordinator",
  "Block Coordinator",
  "Panchayat",
  "NGO",
];

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [pincode, setPincode] = useState("");
  const [designation, setDesignation] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const refFromUrl = searchParams.get("ref");
    if (refFromUrl && !referralCode) setReferralCode(refFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const code = referralCode.trim();
    if (!code || code.length < 9) { setReferrerName(null); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase.rpc("lookup_referral_code", { _code: code.toUpperCase() });
      setReferrerName(data && data.length > 0 ? data[0].referrer_name : null);
    }, 400);
    return () => clearTimeout(timeout);
  }, [referralCode]);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSignUp) {
        if (!name.trim() || !phone.trim()) {
          toast.error("Full Name and Mobile Number are required");
          setSubmitting(false);
          return;
        }

        const finalRefCode = (referralCode.trim() || searchParams.get("ref") || "").toUpperCase().trim();
        let referrerId: string | null = null;
        if (finalRefCode) {
          const { data: referrerRows } = await supabase.rpc("lookup_referral_code", { _code: finalRefCode });
          if (!referrerRows || referrerRows.length === 0) {
            toast.error("Invalid referral code");
            setSubmitting(false);
            return;
          }
          referrerId = referrerRows[0].referrer_id;
        }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              state: state || undefined,
              district: district || undefined,
              block: block.trim() || undefined,
              address: address.trim() || undefined,
              address_line2: addressLine2.trim() || undefined,
              pincode: pincode.trim() || undefined,
              designation: designation || undefined,
              referral_code: finalRefCode || undefined,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          if (error.message?.toLowerCase().includes("user already registered")) {
            toast.error("This email is already registered. Please login.", {
              action: { label: "Go to Login", onClick: () => setIsSignUp(false) },
            });
            setSubmitting(false);
            return;
          }
          throw error;
        }

        if (signUpData.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please login.", {
            action: { label: "Go to Login", onClick: () => setIsSignUp(false) },
          });
          setSubmitting(false);
          return;
        }

        if (referrerId && signUpData.user) {
          await supabase.from("profiles").update({ referred_by: referrerId }).eq("id", signUpData.user.id);
        }

        toast.success("Account created! Redirecting to payment...");
        // Auto-confirm is on, so user is logged in. Navigate to payment.
        navigate("/registration-payment", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const finalRefCode = referralCode.trim() || searchParams.get("ref") || "";
    const redirectUrl = finalRefCode
      ? `${window.location.origin}/auth/callback?ref=${finalRefCode}`
      : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) toast.error(error.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableDistricts = DISTRICTS[state] || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 pb-8">
        <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4">
          <h1 className="text-display text-2xl text-foreground mb-1 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mb-5 text-center text-sm">
            {isSignUp ? "Join JanSeva and make a difference" : "Sign in to your JanSeva account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="पूरा नाम" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile Number <span className="text-destructive">*</span></Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" required />
                  </div>
                </div>
              </>
            )}

            <div className={isSignUp ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
              <div>
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
            </div>

            {isSignUp && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>State</Label>
                    <Select value={state} onValueChange={(v) => { setState(v); setDistrict(""); }}>
                      <SelectTrigger><SelectValue placeholder="राज्य चुनें" /></SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>District</Label>
                    {availableDistricts.length > 0 ? (
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger><SelectValue placeholder="जिला चुनें" /></SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="जिला" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="block">Block</Label>
                    <Input id="block" value={block} onChange={(e) => setBlock(e.target.value)} placeholder="ब्लॉक" />
                  </div>
                  <div>
                    <Label>Designation</Label>
                    <Select value={designation} onValueChange={setDesignation}>
                      <SelectTrigger><SelectValue placeholder="पद चुनें" /></SelectTrigger>
                      <SelectContent>
                        {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address Line 1</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="पता लाइन 1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input id="address2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="पता लाइन 2" />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="पिनकोड" maxLength={6} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="referralCode">Referral Code (optional)</Label>
                  <Input id="referralCode" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} placeholder="e.g. NGO123456" />
                  {referrerName && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <UserPlus className="h-3 w-3" /> Invited by <span className="font-medium">{referrerName}</span>
                    </p>
                  )}
                </div>
              </>
            )}

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          {!isSignUp && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
              </div>
              <Button variant="outline" className="w-full active:scale-[0.97] transition-all" onClick={handleGoogleSignIn}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" className="text-primary font-medium hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
