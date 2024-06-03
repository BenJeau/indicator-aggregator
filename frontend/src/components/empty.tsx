import { cn } from "@/lib/utils";
import { TransId } from "@/i18n";
import { Trans } from "@/components";

interface Props {
  title: TransId;
  description: TransId;
  image?: React.ImgHTMLAttributes<HTMLImageElement>["src"];
  imageWidth?: number;
  extra?: React.ReactNode;
  className?: string;
}

const Empty: React.FC<Props> = ({
  title,
  description,
  image,
  imageWidth = 500,
  extra,
  className,
}) => (
  <div
    className={cn(
      "flex flex-1 flex-col items-center justify-center gap-2 self-center justify-self-center p-4",
      className,
    )}
  >
    {image && <img src={image} width={imageWidth} />}
    <div className="flex flex-col items-center text-center">
      <h2 className="text-lg font-semibold">
        <Trans id={title} />
      </h2>
      <p className="text-sm">
        <Trans id={description} />
      </p>
    </div>
    {extra}
  </div>
);

export default Empty;
