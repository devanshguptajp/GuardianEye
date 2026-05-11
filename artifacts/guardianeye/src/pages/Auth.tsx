import { Link } from "wouter";
import { SignIn } from "@clerk/react";

const Auth = () => {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <SignIn />
    </div>
  );
};

export default Auth;
