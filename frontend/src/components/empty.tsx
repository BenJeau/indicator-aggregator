import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  image?: React.ImgHTMLAttributes<HTMLImageElement>["src"];
  imageWidth?: number;
  extra?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<Props> = ({
  title,
  description,
  image,
  imageWidth = 500,
  extra,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col gap-2 items-center justify-center flex-1 self-center justify-self-center p-4",
      className,
    )}
  >
    {image && <img src={image} width={imageWidth} />}
    <div className="flex items-center flex-col text-center">
      <h2 className="font-semibold text-lg">{title}</h2>
      <p className="text-sm">{description}</p>
    </div>
    {extra}
  </div>
);
