import { Card } from "@/components/ui/Card";
import { MessageCircle } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">WhatsApp Group</h1>
      <p className="mt-1 text-sm text-ink/50">Stay in the loop with your planning team</p>

      <Card className="mt-6 flex flex-col items-center py-10 text-center">
        <MessageCircle className="h-8 w-8 text-brand-600" />
        <p className="mt-3 text-sm text-ink/60">
          Your planner will add you to the event WhatsApp group once your contract is signed.
        </p>
      </Card>
    </div>
  );
}
