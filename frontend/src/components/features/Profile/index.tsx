import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileInfoOwner from "./ProfileInfoOwner";
import ProfileInfo from "./ProfileInfo";

type Props = {
  username?: string;
};

const Profile: React.FC<Props> = ({ username }) => {
  return (
    <>
      <ProfileHeader />

      {!username ? <ProfileInfoOwner /> : <ProfileInfo username={username} />}
    </>
  );
};

export default Profile;
