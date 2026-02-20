"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  description?: string;
}

export default function AboutContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Error fetching team members:", error);
          return;
        }

        setTeamMembers(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMembers();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-7 pb-10">
      <div className="mb-12">
        {/* Section 1 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 uppercase tracking-wide">
            The Heart of Our Story
          </h3>
          <p className="text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-800 block mb-2">
              At Hair Universe, we believe that hair is more than just a look,
              it&apos;s an expression of who you are.
            </span>
            Founded on a passion for excellence, our brand was built to provide
            world-class salon services that celebrate the uniqueness of every
            individual. Led by Olamide, our team is dedicated to blending
            artistic flair with the latest styling technologies to ensure you
            leave our doors feeling like the best version of yourself.
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 uppercase tracking-wide">
            Innovation Meets Individuality
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            We don&apos;t believe in one-size-fits-all beauty. Our mission is to
            identify your personal style and highlight your best features
            through expert craftsmanship. Whether you are looking for:
          </p>

          <ul className="space-y-4 text-left">
            <li className="list-none flex items-start">
              <span className="font-bold text-black mr-2">•</span>
              <p className="text-gray-600">
                <span className="font-bold text-black">
                  Premium Custom Wigs:{" "}
                </span>
                Handcrafted for a natural, stunning finish.
              </p>
            </li>

            <li className="list-none flex items-start">
              <span className="font-bold text-black mr-2">•</span>
              <p className="text-gray-600">
                <span className="font-bold text-black">
                  Vibrant Nail Artistry:{" "}
                </span>
                Trend-setting designs that make a statement.
              </p>
            </li>

            <li className="list-none flex items-start">
              <span className="font-bold text-black mr-2">•</span>
              <p className="text-gray-600">
                <span className="font-bold text-black">
                  Precision Hairstyling:{" "}
                </span>
                Expert cuts and colors tailored to your facial structure.
              </p>
            </li>
          </ul>
          <p className="text-gray-800 text-center md:text-left mt-8 font-semibold">
            Whatever your beauty needs, the Hair Universe staff is committed to
            delivering an unparalleled experience.
          </p>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-8 uppercase tracking-wide text-center">
          Meet Our Expert Team
        </h3>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center text-gray-500">
            No team members found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="w-full max-w-[280px] bg-white border border-pink-500 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image Container - Fixed aspect ratio (58:70 like your SVG) */}
                <div className="relative w-full h-[350px] bg-gray-100">
                  <Image
                    src={member.image_url}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Member Info */}
                <div className="p-4 text-center">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {member.name}
                  </h4>
                  <p className="text-pink-600 font-medium mb-2">
                    {member.role}
                  </p>
                  {member.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {member.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-15 text-center">
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
          </svg>
          Book Appointment
        </button>
      </div>
    </main>
  );
}
