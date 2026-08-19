import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { MessageInbox } from "@/components/dashboard/MessageInbox";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <Layout>
      <SEO 
        title="Messages" 
        description="Your private conversations on Paste Prompts." 
        canonical="/messages" 
        noindex 
      />
      <div className="container-wide py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground">Private communication with members and admins.</p>
          </div>
        </div>

        <MessageInbox />
      </div>
    </Layout>
  );
}
