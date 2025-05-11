import React, { useRef, useState, useEffect } from "react";
import {
  saveChunk,
  getAllChunksBySession,
  clearChunksBySession,
} from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ScreenRecorder({ saveVideo }) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [interruptedRecording, setInterruptedRecording] = useState(false);

  // Restore previous session if it exists
  useEffect(() => {
    const activeSession = localStorage.getItem("active-session-id");
    if (activeSession) {
      setSessionId(activeSession);
      // Instead of automatically starting recording, show the interrupt message
      setInterruptedRecording(true);

      // Try to load already saved chunks for preview
      (async () => {
        const chunks = await getAllChunksBySession(activeSession);
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: "video/webm" });
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
          }
        }
      })();
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = stream;

      const isNewSession = !sessionId;
      const activeSessionId = isNewSession ? uuidv4() : sessionId!;
      if (isNewSession) {
        localStorage.setItem("active-session-id", activeSessionId);
        setSessionId(activeSessionId);
      }

      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      const mimeType = "video/webm;codecs=vp9";
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          await saveChunk(e.data, activeSessionId);
        }
      };

      recorder.onstop = async () => {
        setIsSaving(true);

        try {
          const chunks = await getAllChunksBySession(activeSessionId);
          const blob = new Blob(chunks, { type: "video/webm" });

          if (blob.size === 0) {
            toast.error("Recording failed: empty blob.");
            setIsSaving(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          setVideoUrl(url);

          const formData = new FormData();
          formData.append("blob", blob);
          formData.append("sessionId", activeSessionId);

          await saveVideo(formData);

          await clearChunksBySession(activeSessionId);
          localStorage.removeItem("active-session-id");
          setSessionId(null);
        } catch (err) {
          toast.error("Failed during recording process:", err);
        } finally {
          setIsSaving(false);
          setRecording(false);
        }
      };

      recorder.start(2000); // every 2 seconds
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      toast.error(
        "Failed to start screen recording. Please check your permissions."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.requestData();
    mediaRecorderRef.current?.stop();
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const startNewRecording = async () => {
    // Clean up the previous recording session
    if (sessionId) {
      await clearChunksBySession(sessionId);
      localStorage.removeItem("active-session-id");
      setSessionId(null);
      setVideoUrl(null);
    }
    setInterruptedRecording(false);
    // Start a fresh recording
    startRecording();
  };

  const continueRecording = () => {
    setInterruptedRecording(false);
    startRecording();
  };

  return (
    <div className="space-y-6 bg-card rounded-lg p-6 border shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Screen Recorder</h2>
        <p className="text-muted-foreground mt-1">
          Record your screen and save it for later viewing
        </p>
      </div>

      <div className="space-y-4">
        {interruptedRecording ? (
          <div className="bg-accent/30 dark:bg-accent/30 border border-accent dark:border-accent rounded-lg p-4 mb-4">
            <h3 className="text-accent-foreground dark:text-accent-foreground font-medium mb-2">
              Recording Interrupted
            </h3>
            <p className="text-accent-foreground dark:text-accent-foreground text-sm mb-3">
              Your previous recording was interrupted. Would you like to
              continue where you left off or start a new recording?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={continueRecording}
                className="border-accent dark:border-accent text-accent-foreground dark:text-accent-foreground hover:bg-accent/10 dark:hover:bg-accent/50"
              >
                Continue Recording
              </Button>
              <Button
                variant="outline"
                onClick={startNewRecording}
                className="border-accent dark:border-accent text-accent-foreground dark:text-accent-foreground hover:bg-accent/10 dark:hover:bg-accent/50"
              >
                Start New Recording
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <Button onClick={startRecording} className="gap-2">
                Start Recording
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopRecording}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Stop Recording"
                )}
              </Button>
            )}
          </div>
        )}

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving your recording, please wait...</span>
          </div>
        )}

        {videoUrl && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Recorded Video:</h3>{" "}
            <div className="rounded-lg overflow-hidden bg-muted shadow-md border border-border/50">
              <video src={videoUrl} controls className="w-full aspect-video" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
