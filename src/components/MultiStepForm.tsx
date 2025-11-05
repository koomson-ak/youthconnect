import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getAttendanceByPhone } from "@/lib/supabase";
import type { Attendance } from "@/lib/supabase";

interface MultiStepFormProps {
  onSubmit: (first: string, last: string, other: string, phone: string, gender?: string) => Promise<boolean>;
}

export const MultiStepForm = ({ onSubmit }: MultiStepFormProps) => {
  const [step, setStep] = useState(1);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [other, setOther] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRecord, setExistingRecord] = useState<Attendance | null>(null);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const validateStep1 = () => {
    if (!first.trim() || !last.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!phone.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return false;
    }
    if (phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  // When the phone changes, attempt to fetch an existing attendance by phone.
  // Debounce to avoid rapid requests as the user types.
  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const trimmed = phone.trim();
    if (trimmed.length >= 7) {
      timer = window.setTimeout(async () => {
        try {
          const { data, error } = await getAttendanceByPhone(trimmed);
          if (!mounted) return;
          if (error) {
            // ignore errors for this lightweight lookup
            setExistingRecord(null);
            return;
          }

          setExistingRecord(data as Attendance | null);
        } catch (e) {
          if (mounted) setExistingRecord(null);
        }
      }, 400);
    } else {
      setExistingRecord(null);
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [phone]);

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
  const success = await onSubmit(first.trim(), last.trim(), other.trim(), phone.trim(), gender);

      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setStep(1);
          setFirst("");
          setLast("");
          setOther("");
          setPhone("");
          setGender(undefined);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <div className="bg-muted/30 p-6 pb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold">Check In</h2>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4 text-xs">
            <span className={step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Name
            </span>
            <span className={step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Contact
            </span>
            <span className={step >= 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Confirm
            </span>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait" custom={step}>
            {/* Step 1: Name Fields */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="first" className="text-base">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first"
                    type="text"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-2 h-12 text-lg"
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="other" className="text-base">
                    Other Names <span className="text-muted-foreground text-sm">(Optional)</span>
                  </Label>
                  <Input
                    id="other"
                    type="text"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="Middle name(s)"
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="last" className="text-base">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last"
                    type="text"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-2 h-12 text-lg"
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={2}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="phone" className="text-base">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0XX XXX XXXX"
                    className="mt-2 h-12 text-lg"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    We'll use this to track your attendance
                  </p>
                  <div className="mt-4">
                    <Label htmlFor="gender" className="text-base">
                      Gender <span className="text-muted-foreground text-sm">(Optional)</span>
                    </Label>
                    <Select value={gender ?? ""} onValueChange={(v) => setGender(v || undefined)}>
                      <SelectTrigger className="mt-2 h-12 text-lg">
                        <SelectValue placeholder="Select gender (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {existingRecord && (
                    <div className="mt-4 bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Existing Record Found</h4>
                        <div>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setFirst(existingRecord.first_name);
                            setLast(existingRecord.last_name);
                            setOther(existingRecord.other_names || "");
                            setGender(existingRecord.gender || undefined);
                          }}>
                            Use this
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Name</span>
                        <span className="font-medium">{existingRecord.first_name} {existingRecord.other_names && `${existingRecord.other_names} `}{existingRecord.last_name}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground items-center">
                        <span>Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{existingRecord.phone}</span>
                          {existingRecord.gender && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">{existingRecord.gender}</span>
                          )}
                        </div>
                      </div>
                      {existingRecord.timestamp && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Last checked</span>
                          <span className="font-medium">{new Date(existingRecord.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-12"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={3}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {!isSubmitted ? (
                  <>
                    <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Confirm Your Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Full name</span>
                            <span className="font-medium">{first} {other && `${other} `}{last}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Phone number</span>
                            <span className="font-medium">{phone}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Gender</span>
                            <span className="font-medium">{gender ?? 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="flex-1 h-12"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 h-12"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                        <Check className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      className="inline-block bg-success/10 rounded-full p-6 mb-6"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 2,
                      }}
                    >
                      <Check className="h-16 w-16 text-success" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">All Set!</h3>
                    <p className="text-muted-foreground">
                      Your attendance has been recorded successfully.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
