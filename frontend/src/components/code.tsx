const Code: React.FC<React.PropsWithChildren> = (props) => (
  <code
    className="rounded-sm bg-foreground/5 px-1 dark:bg-foreground/30"
    {...props}
  />
);

export default Code;
