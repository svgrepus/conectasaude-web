import React from "react";
import { CustomLayout } from "./CustomLayout";

interface ScreenWrapperProps {
  children: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
  return <CustomLayout>{children}</CustomLayout>;
};
