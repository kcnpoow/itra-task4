import clsx from "clsx";

interface Props {
  classname?: string;
}

export const Logo = ({ classname }: Props) => {
  return (
    <span className={clsx("uppercase text-primary font-semibold", classname)}>
      THE APP
    </span>
  );
};
