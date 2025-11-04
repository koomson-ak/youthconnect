import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Download } from "lucide-react";

export const QRCodeSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Always point to the home page for check-in (not the display page)
  const checkInUrl = window.location.origin + "/";

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "youth-connect-qr.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <QrCode className="h-5 w-5" />
            Show QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Quick Check-In</DialogTitle>
            <DialogDescription className="text-center">
              Scan this QR code to quickly access the check-in form
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <QRCodeSVG
                id="qr-code-svg"
                value={checkInUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <Button
              onClick={downloadQR}
              variant="outline"
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Display this QR code at your event entrance for easy check-in
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
