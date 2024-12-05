import Signup from "@/components/Auth/Signup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | RCF",
  description: "Registrarse de RCF",
  // other metadata
};

export default function Register() {
  return (
    <>
      <Signup />
    </>
  );
}
