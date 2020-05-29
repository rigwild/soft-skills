import { Alert, Spin } from "antd";
import { deleteProfile, editProfile, getProfile } from "api/profile";
import { AxiosError, AxiosResponse } from "axios";
import ProfileForm from "components/profile";
import { AuthContext } from "context";
import React, { useContext, useEffect, useState } from "react";

type ProfileResponse = {
  data: Profile;
};

type Profile = {
  name: string;
  email: string;
  joinDate: string;
};

const ProfileContainer = () => {
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    getProfile()
      .then((res: AxiosResponse<ProfileResponse>) => {
        const { data } = res.data;
        setProfile(data);
        setName(data.name);
      })
      .catch((error) => setError(error.response?.data.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEditProfile = () => {
    setError(undefined);
    editProfile(name)
      .then((res: AxiosResponse<ProfileResponse>) => {
        const { data } = res.data;
        setProfile(data);
        setName(data.name);
      })
      .catch((error: AxiosError) => {
        setError(error.response?.data.message);
        setName(profile!.name);
      });
  };

  const handleDeleteProfile = () => {
    setError(undefined);
    deleteProfile()
      .then(() => logout())
      .catch((error: AxiosError) => setError(error.response?.data.message));
  };

  if (loading) {
    return (
      <Spin
        tip="Retrieving your profile..."
        size="large"
        style={{ marginTop: 25 }}
      />
    );
  }

  return (
    <>
      {profile && (
        <ProfileForm
          name={name}
          setName={setName}
          email={profile.email}
          joinDate={profile.joinDate}
          editProfile={handleEditProfile}
          deleteProfile={handleDeleteProfile}
        />
      )}
      {error && (
        <Alert
          message="An error occured"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 50 }}
        />
      )}
    </>
  );
};

export default ProfileContainer;
