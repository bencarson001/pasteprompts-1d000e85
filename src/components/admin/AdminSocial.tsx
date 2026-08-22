import { useState } from "react";
import { Facebook, Video } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionHeader } from "./shared";
import { AdminFacebookAutopilot } from "./AdminFacebookAutopilot";
import { AdminTikTok } from "./AdminTikTok";

export function AdminSocial() {
  const [activeSubTab, setActiveSubTab] = useState("facebook");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Auto Posting"
        desc="Automated AI posting routines for Facebook with group sharing, automatic schedules, and dry-run diagnostics."
      />

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-xs grid-cols-2 bg-secondary/20 p-1 rounded-2xl">
          <TabsTrigger value="facebook" className="flex items-center gap-2 rounded-xl text-xs sm:text-sm font-semibold">
            <Facebook className="h-4 w-4 text-primary" />
            Facebook Auto Posting
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="flex items-center gap-2 rounded-xl text-xs sm:text-sm font-semibold">
            <Video className="h-4 w-4" />
            TikTok
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facebook" className="mt-0 focus-visible:outline-none">
          <AdminFacebookAutopilot />
        </TabsContent>

        <TabsContent value="tiktok" className="mt-0 focus-visible:outline-none">
          <AdminTikTok />
        </TabsContent>
      </Tabs>
    </div>
  );
}
