import { createFileRoute } from "@tanstack/react-router";
import PromptDetail from "@/pages/PromptDetail";

export const Route = createFileRoute("/prompt/$category/$slug")({
  component: PromptDetail,
});
