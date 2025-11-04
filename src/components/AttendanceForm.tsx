import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

interface AttendanceFormProps {
  // onSubmit returns a Promise that resolves to true on success, false on handled failure
  onSubmit: (first: string, last: string, other: string, phone: string) => Promise<boolean>;
}

export const AttendanceForm = ({ onSubmit }: AttendanceFormProps) => {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [other, setOther] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!first.trim() || !last.trim() || !phone.trim()) {
      toast({
        title: "Please complete required fields",
        description: "First name, last name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onSubmit(first.trim(), last.trim(), other.trim(), phone.trim());

      if (success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFirst("");
          setLast("");
          setOther("");
          setPhone("");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-center mb-2">Youth Connect</h1>
      <p className="text-center text-muted-foreground mb-8">
        Welcome! Please add your name to today's attendance
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label htmlFor="first">First Name</Label>
              <Input
                id="first"
                type="text"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                placeholder="First name"
                disabled={isSubmitted || isSubmitting}
                className="transition-all duration-250"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="other">Other Name(s)</Label>
              <Input
                id="other"
                type="text"
                value={other}
                onChange={(e) => setOther(e.target.value)}
                placeholder="Middle Name(s)"
                disabled={isSubmitted || isSubmitting}
                className="transition-all duration-250"
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="last">Last Name</Label>
              <Input
                id="last"
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last name"
                disabled={isSubmitted || isSubmitting}
                className="transition-all duration-250"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            disabled={isSubmitted || isSubmitting}
            className="transition-all duration-250"
          />
        </div>

        <Button
          type="submit"
          className="w-full transition-all duration-250 ease-in-out"
          disabled={isSubmitted || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">Submitting...</span>
          ) : isSubmitted ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Your attendance has been recorded
            </span>
          ) : (
            "Submit Attendance"
          )}
        </Button>
      </form>
    </div>
  );
};
