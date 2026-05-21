import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { PartyPopper } from "lucide-react";

const SuccessModal = ({ open, onClose, title, message }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="text-center max-w-sm">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
          <PartyPopper className="h-8 w-8 text-success" />
        </div>
        <h2 className="font-display font-bold text-xl">{title}</h2>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Button onClick={onClose} className="gradient-primary text-primary-foreground w-full mt-2">
          Continue
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default SuccessModal;
