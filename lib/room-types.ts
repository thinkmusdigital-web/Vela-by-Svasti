export interface PublicRoomType {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  sizeSqft: number;
  bedType: string;
  maxOccupancy: number;
  image: string;
}

// Source-controlled public catalogue while database-backed room management is deferred.
export const PUBLIC_ROOM_TYPES: PublicRoomType[] = [
  { id: "deluxe-room", name: "Deluxe Room", slug: "deluxe-room", shortDescription: "A comfortable, well-appointed room for business and leisure stays.", sizeSqft: 320, bedType: "King or twin beds", maxOccupancy: 3, image: "/images/hotel-room-teal.jpg" },
  { id: "premium-room", name: "Premium Room", slug: "premium-room", shortDescription: "A more spacious room with room to settle in for longer stays.", sizeSqft: 400, bedType: "King bed", maxOccupancy: 3, image: "/images/hotel-room-crimson.jpg" },
  { id: "executive-suite", name: "Executive Suite", slug: "executive-suite", shortDescription: "A suite with a separate living area for work, hosting and unhurried stays.", sizeSqft: 560, bedType: "King bed", maxOccupancy: 4, image: "/images/executive-suite.png" },
];
