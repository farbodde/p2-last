import React from "react";

type Props = {
  location?: string;
  aboutMe?: string;
};

const ProfileBio = ({ location, aboutMe }: Props) => {
  return (
    <section className="flex flex-col gap-2 min-h-24">
      <p className="text-sm">{location || "Unknown location"}</p>
      <div className="text-white/80 text-sm">
        <p>{aboutMe || "No bio added yet."}</p>
      </div>
    </section>
  );
};

export default ProfileBio;
