"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/site/SectionHeading";

// Fictional layout samples. Replace with approved guest feedback before
// presenting this content as real customer reviews.
const SAMPLE_REVIEWS = [
  { quote: "The room was comfortable and the staff made check-in easy. We had a relaxed weekend in Raipur.", author: "Aditi S.", city: "Raipur" },
  { quote: "A convenient location for our work trip. The team was courteous and helped us with a late dinner.", author: "Rohan M.", city: "Nagpur" },
  { quote: "We enjoyed the calm atmosphere and a very comfortable bed. Breakfast had a good range of options.", author: "Priya K.", city: "Bhilai" },
  { quote: "The hotel was easy to reach and the staff were warm throughout our stay. Would consider it again for our next visit.", author: "Vikram P.", city: "Bilaspur" },
  { quote: "Spacious room, helpful service and a pleasant evening by the rooftop pool. A good family stay.", author: "Neha T.", city: "Kolkata" },
  { quote: "The team helped us arrange a comfortable stay for visiting relatives. Everyone felt well looked after.", author: "Ananya R.", city: "Raipur" },
  { quote: "We stayed for a business meeting nearby. The room was quiet and the location worked well for us.", author: "Kunal J.", city: "Bhopal" },
  { quote: "Polite staff and a clean, comfortable room. The check-out process was quick even on a busy morning.", author: "Meera D.", city: "Ranchi" },
  { quote: "A pleasant stop during our drive through Raipur. The family appreciated the comfortable rooms.", author: "Sandeep G.", city: "Sambalpur" },
  { quote: "The restaurant team was attentive and helped us choose dishes for the whole family. We had a nice evening.", author: "Shalini B.", city: "Raipur" },
  { quote: "Good service from arrival to departure. The staff were responsive whenever we needed assistance.", author: "Rahul N.", city: "Pune" },
  { quote: "The room felt fresh and thoughtfully arranged. We had a restful night before an early appointment.", author: "Ishita C.", city: "Jabalpur" },
  { quote: "We hosted a small family gathering here and appreciated the team's help with the arrangements.", author: "Manoj L.", city: "Korba" },
  { quote: "Comfortable stay with easy access to the parts of the city we needed to visit. Staff were friendly.", author: "Pooja W.", city: "Bilaspur" },
  { quote: "A relaxed experience overall. The team was welcoming, and the room had everything we needed.", author: "Aman V.", city: "Raipur" },
];

export function Testimonials() {
  const [showAll, setShowAll] = useState(false);
  const reviews = showAll ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.slice(0, 5);

  return (
    <section className="border-t border-line bg-cream" aria-labelledby="home-testimonials">
      <div className="shell py-20 lg:py-28">
        <SectionHeading eyebrow="Guest Notes" title="What guests say" align="center" id="home-testimonials" />
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-stone">
          Sample reviews for layout preview only. These are not verified guest testimonials.
        </p>
        <ul className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.author} className="relative flex min-h-[300px] flex-col rounded-xl border border-brass/70 bg-[#fff9ef] p-7 shadow-[0_8px_22px_rgba(79,48,19,0.12)] sm:p-8">
              <span aria-hidden="true" className="display absolute left-7 top-3 text-6xl leading-none text-brass sm:left-8 sm:top-4">“</span>
              <p className="display mt-8 min-h-28 pl-10 text-[1.2rem] italic leading-relaxed text-[#4b2818] sm:text-[1.32rem]">{review.quote}</p>
              <div className="mt-auto">
                <p aria-label="5 out of 5 stars" className="mb-3 text-xl tracking-[0.08em] text-brass">★★★★★</p>
                <div className="flex items-center justify-between gap-3 border-t border-brass/40 pt-4">
                  <p className="text-base font-semibold text-[#4b2818]">{review.author}</p>
                  <p className="border-l border-brass/40 pl-4 text-xs font-medium uppercase tracking-[0.18em] text-[#9a7650]">{review.city}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-expanded={showAll}
            className="btn-outline"
          >
            {showAll ? "Show fewer reviews" : "See all reviews"}
          </button>
        </div>
      </div>
    </section>
  );
}
