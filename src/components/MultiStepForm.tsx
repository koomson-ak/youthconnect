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
    if (!gender) {
      toast({
        title: "Gender required",
        description: "Please select your gender.",
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
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-2">
      <motion.div
        className="bg-card rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl overflow-hidden border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <div className="bg-muted/30 p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 sm:mb-3">
            <h2 className="text-xl sm:text-2xl font-bold">Check In</h2>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-3 sm:mt-4 text-xs gap-1">
            <span className={step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Name
            </span>
            <span className={step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Details
            </span>
            <span className={step >= 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
              Confirm
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
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
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <Label htmlFor="first" className="text-sm sm:text-base">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first"
                    type="text"
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1 sm:mt-2 h-10 sm:h-12 text-base"
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="other" className="text-sm sm:text-base">
                    Other Names <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="other"
                    type="text"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="Middle name(s)"
                    className="mt-1 sm:mt-2 h-10 sm:h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="last" className="text-sm sm:text-base">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last"
                    type="text"
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1 sm:mt-2 h-10 sm:h-12 text-base"
                  />
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full h-10 sm:h-12 text-base"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0XX XXX XXXX"
                    className="mt-1 sm:mt-2 h-10 sm:h-12 text-base"
                    autoFocus
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    We'll use this to track your attendance
                  </p>
                  <div className="mt-3 sm:mt-4">
                    <Label htmlFor="gender" className="text-sm sm:text-base">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={gender ?? ""} onValueChange={(v) => setGender(v || undefined)}>
                      <SelectTrigger className="mt-1 sm:mt-2 h-10 sm:h-12 text-base">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {existingRecord && (
                    <div className="mt-3 sm:mt-4 bg-muted/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold">Existing Record Found</h4>
                        <div>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setFirst(existingRecord.first_name);
                            setLast(existingRecord.last_name);
                            setOther(existingRecord.other_names || "");
                            setGender(existingRecord.gender || undefined);
                          }} className="text-xs sm:text-sm h-8 sm:h-9">
                            Use this
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground gap-2">
                        <span>Name</span>
                        <span className="font-medium text-right">{existingRecord.first_name} {existingRecord.other_names && `${existingRecord.other_names} `}{existingRecord.last_name}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground items-center gap-2">
                        <span>Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{existingRecord.phone}</span>
                          {existingRecord.gender && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/20 text-muted-foreground">{existingRecord.gender}</span>
                          )}
                        </div>
                      </div>
                      {existingRecord.timestamp && (
                        <div className="flex justify-between text-muted-foreground gap-2">
                          <span>Last checked</span>
                          <span className="font-medium text-right">{new Date(existingRecord.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                    size="lg"
                  >
                    <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                className="space-y-4 sm:space-y-6"
              >
                {!isSubmitted ? (
                  <>
                    <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Confirm Your Details
                      </h3>
                      <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                        <div className="grid grid-cols-1 gap-2 sm:gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Full name</span>
                            <span className="font-medium text-right">{first} {other && `${other} `}{last}</span>
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

                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                        <Check className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center py-8 sm:py-12"
                  >
                    <motion.div
                      className="inline-block bg-success/10 rounded-full p-4 sm:p-6 mb-4 sm:mb-6"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 2,
                      }}
                    >
                      <Check className="h-12 w-12 sm:h-16 sm:w-16 text-success" />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">All Set!</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
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
