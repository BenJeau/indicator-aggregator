import { ElementType, HTMLAttributes } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AutoAnimateOptions } from "@formkit/auto-animate";

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  options?: Partial<AutoAnimateOptions>;
}

const AutoAnimate: React.FC<Props> = ({
  as: Tag = "div",
  children,
  options = { duration: 200 },
  ...rest
}) => {
  const [ref] = useAutoAnimate<HTMLElement>(options);
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
};

export default AutoAnimate;
