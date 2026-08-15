import { Button, type ButtonProps } from "antd";
import { useCallback, type MouseEventHandler } from "react";
import {
  useNavigate,
  useHref,
  type To,
  type NavigateOptions,
} from "react-router";

export interface LinkButtonProps extends ButtonProps {
  to?: To;
  options?: NavigateOptions;
}

export function LinkButton({ to, options, ...btnProps }: LinkButtonProps) {
  const navigate = useNavigate();
  const href = useHref(to ?? "");

  const handleClick: MouseEventHandler<HTMLElement> = useCallback(
    (event) => {
      event.preventDefault();
      navigate(href, options);
    },
    [href, navigate, options],
  );

  return to ? (
    <Button href={href} onClick={handleClick} {...btnProps} />
  ) : (
    <Button {...btnProps} />
  );
}
