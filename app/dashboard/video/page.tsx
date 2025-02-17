"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, Video, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const VideoUploadDialog = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const queryClient = useQueryClient(); // Initialiser le queryClient

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("video", e.target.files[0]);

      const response = await fetch("/api/settings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur upload");

      // Invalider et recharger les données

      await queryClient.invalidateQueries({ queryKey: ["coverVideo"] });
      window.location.reload();
      toast.success("Vidéo Changée avec succès", {
        style: {
          color: "#22c55e",
        },
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Video className="h-4 w-4 cursor-pointer" />
          Changer la vidéo
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Changer la vidéo de couverture</DialogTitle>
          <DialogDescription>
            Téléchargez une nouvelle vidéo de couverture pour votre site. Format
            accepté : MP4. Taille maximale : 10MB
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">
                    Cliquez pour télécharger
                  </span>{" "}
                  ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500">MP4 (MAX. 10MB)</p>
              </div>

              <input
                id="video-upload"
                type="file"
                accept="video/mp4"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          {isUploading && (
            <div className="flex items-center justify-center gap-2 text-base font-bold text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Upload en cours...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HeroSection = () => {
  const getVideo = async () => {
    const res = await fetch("/api/settings", {
      method: "GET",
    });
    if (!res.ok) throw new Error("Erreur de chargement de la vidéo");
    return res.json();
  };

  const { data: videoData, isLoading } = useQuery({
    queryKey: ["coverVideo"],
    queryFn: getVideo,
    staleTime: 0, // Toujours recharger les données fraîches
  });

  const videoSrc = videoData?.data
    ? `data:${videoData.contentType};base64,${videoData.data}`
    : "";

  //   console.log(videoData);

  return (
    <section className="relative min-h-[85vh] bg-black">
      <div className="absolute inset-0">
        {videoSrc ? (
          <video autoPlay loop muted className="w-full h-full object-cover">
            <source src={videoSrc} type={videoData.contentType} />
          </video>
        ) : isLoading ? (
          <div className="w-full h-full flex items-center justify-center ">
            <Loader size={28} className="animate-spin text-white" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-white/50">Aucune vidéo de couverture</p>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Actions */}
      <div className="absolute z-50 top-4 right-4">
        <VideoUploadDialog />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center text-white space-y-4">
          <h1 className="text-4xl font-bold">Votre Site</h1>
          <p className="text-xl text-white/80">
            Gérez votre vidéo de couverture facilement
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
