import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { logPaymentError } from "@/lib/logger";

interface StripeEmbeddedCheckoutProps {
  promptId?: string;
  priceId?: string;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({
  promptId,
  priceId,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          ...(promptId && { promptId }),
          ...(priceId && { priceId }),
          customerEmail,
          userId,
          returnUrl: returnUrl ?? `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.clientSecret) {
        const errMsg = error?.message || "Failed to create checkout session";
        await logPaymentError(`Checkout Session Creation Failed: ${errMsg}`, error, {
          promptId,
          priceId,
          customerEmail,
          userId,
        });
        throw new Error(errMsg);
      }
      return data.clientSecret;
    } catch (err) {
      await logPaymentError("Stripe Checkout Session Error", err, {
        promptId,
        priceId,
        customerEmail,
        userId,
      });
      throw err;
    }
  };

  return (
    <div id="checkout" className="overflow-hidden rounded-2xl bg-white p-2">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export default StripeEmbeddedCheckout;
