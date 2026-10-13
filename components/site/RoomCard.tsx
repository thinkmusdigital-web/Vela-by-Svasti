import Link from "next/link";
import { MediaImage } from "@/components/site/MediaImage";

interface RoomCardRoom {
  slug: string;
  name: string;
  shortDescription: string;
  sizeSqft: number | null;
  bedType: string;
  maxOccupancy: number;
  images: { url: string; alt: string }[];
}

export function RoomCard({ room }: { room: RoomCardRoom }) {
  const image = room.images[0] ?? { url: "/images/hotel-room-teal.jpg", alt: "" };

  return (
    <article className="group flex flex-col border border-line bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          href={`/rooms/${room.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block h-full w-full"
        >
          <MediaImage
            src={image.url}
            alt={image.alt || room.name}
            sizes="(min-width: 1400px) 425px, (min-width: 1024px) calc((100vw - 132px) / 3), (min-width: 640px) calc((100vw - 100px) / 2), 100vw"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="display text-2xl text-ink">
          <Link href={`/rooms/${room.slug}`} className="hover:text-brass-deep">
            {room.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-stone">
          {room.shortDescription || "Details for this room will be published soon."}
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
          <div>
            <dt className="sr-only">Room size</dt>
            <dd className="text-[0.85rem] font-semibold text-ink">{room.sizeSqft ? `${room.sizeSqft} sq ft` : "—"}</dd>
          </div>
          <div>
            <dt className="sr-only">Bed configuration</dt>
            <dd className="text-[0.85rem] font-semibold text-ink">{room.bedType || "—"}</dd>
          </div>
          <div>
            <dt className="sr-only">Occupancy</dt>
            <dd className="text-[0.85rem] font-semibold text-ink">
              {room.maxOccupancy > 0 ? `Sleeps ${room.maxOccupancy}` : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex gap-3">
          <Link href={`/rooms/${room.slug}`} className="btn-outline flex-1 px-4 py-2.5">
            View Room
          </Link>
          <Link href={`/enquire?room=${room.slug}`} className="btn-primary flex-1 px-4 py-2.5">
            Request a Stay
          </Link>
        </div>
      </div>
    </article>
  );
}
