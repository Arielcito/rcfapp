import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProfileBox from "@/components/ProfileBox";

export const metadata: Metadata = {
  title: "Perfil | RCF",
  description: "Perfil de usuario de RCF",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Perfil" />

        <ProfileBox />
      </div>
    </DefaultLayout>
  );
};

export default Profile;
