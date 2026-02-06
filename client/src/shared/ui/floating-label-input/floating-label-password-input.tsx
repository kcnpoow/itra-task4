import { Eye, EyeOff } from "lucide-react";

import {
  FloatingLabelInput,
  type FloatingLabelInputProps,
} from "./floating-label-input";
import { useState } from "react";
import { InputGroupButton } from "@/shared/shadcn/components/ui/input-group";

export const FloatingLabelPasswordInput = ({
  type,
  disabled,
  ...props
}: FloatingLabelInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <FloatingLabelInput
      type={isVisible ? "text" : "password"}
      addon={
        <InputGroupButton
          size="icon-sm"
          type="button"
          onClick={handleToggle}
          disabled={disabled}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      }
      disabled={disabled}
      {...props}
    />
  );
};
