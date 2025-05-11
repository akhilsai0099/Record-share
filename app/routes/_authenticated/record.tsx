import { saveVideoFn } from "@/actions/videoActions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ScreenRecorder from "../../components/recorder";

export const Route = createFileRoute("/_authenticated/record")({
  component: RouteComponent,
});

const saveVideo = createServerFn({
  method: "POST",
})
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const blob = data.get("blob") as Blob;
    const sessionId = data.get("sessionId") as string;
    if (!blob || !sessionId) {
      throw new Error("Missing blob or sessionId");
    }

    await saveVideoFn(blob, sessionId);
  });

function RouteComponent() {
  const handleSaveVideo = async (formData: FormData) => {
    // Show loading toast
    const loadingToast = toast.loading("Saving your recording...");

    try {
      await saveVideo({ data: formData });
      // Update with success toast
      toast.success("Recording saved successfully!", {
        id: loadingToast,
        description: "Your video is ready to view",
      });
    } catch (error) {
      // Show error toast
      toast.error("Failed to save recording", {
        id: loadingToast,
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Record Your Screen</h1>
      <ScreenRecorder saveVideo={handleSaveVideo} />
    </div>
  );
}
