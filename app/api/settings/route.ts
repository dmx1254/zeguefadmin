// app/api/admin/settings/route.ts
import VideoModel from "@/lib/models/video";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
  try {
    const formData = await req.formData();
    const video = formData.get("video") as File;

    // console.log(video);

    if (!video) {
      return NextResponse.json(
        { error: "Pas de vidéo fournie" },
        { status: 400 }
      );
    }

    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "La vidéo est trop grande. Maximum 10MB" },
        { status: 400 }
      );
    }

    // Convertir la vidéo en base64
    const bytes = await video.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Video = buffer.toString("base64");

    // Mettre à jour ou créer les paramètres
    await VideoModel.deleteMany();
    const data = {
      data: base64Video,
      contentType: video.type,
    };

    await VideoModel.create(data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la vidéo" },
      { status: 500 }
    );
  }
}

// Route GET pour récupérer la vidéo
export async function GET() {
  try {
    const video = await VideoModel.find().lean();
    if (!video) {
      return NextResponse.json({ error: "Vidéo non trouvée" }, { status: 404 });
    }

    return NextResponse.json(video[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la vidéo" },
      { status: 500 }
    );
  }
}
