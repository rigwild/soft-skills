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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formDisabled, setFormDisabled] = useState(false);
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const handleError = (error: AxiosError) => {
    let errorMessage: string = error.response?.data.message;
    if (error.response?.status === 401) {
      errorMessage = errorMessage
        .concat(" ")
        .concat("Please, log out and log in again.");
    }
    setError(errorMessage);
  };

  const handleProfileResponse = (res: AxiosResponse<ProfileResponse>) => {
    const { data } = res.data;
    setProfile(data);
    setName(data.name);
  };

  useEffect(() => {
    getProfile()
      .then((res: AxiosResponse<ProfileResponse>) => handleProfileResponse(res))
      .catch((error: AxiosError) => handleError(error))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleEditProfile = () => {
    setError(undefined);
    setFormDisabled(true);
    editProfile(name)
      .then((res: AxiosResponse<ProfileResponse>) => handleProfileResponse(res))
      .catch((error: AxiosError) => {
        handleError(error);
        setName(profile!.name);
      })
      .finally(() => setFormDisabled(false));
  };

  const handleDeleteProfile = () => {
    setError(undefined);
    setFormDisabled(true);
    deleteProfile()
      .then(() => logout())
      .catch((error: AxiosError) => {
        handleError(error);
        setFormDisabled(false);
      });
  };

  if (loadingProfile) {
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
          disabled={formDisabled}
        />
      )}
      {error && (
        <Alert
          message="An error occurred"
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
