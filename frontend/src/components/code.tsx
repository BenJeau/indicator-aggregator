const Code: React.FC<React.PropsWithChildren> = (props) => (
  <code
    className="bg-foreground/5 dark:bg-foreground/30 rounded-sm px-1"
    {...props}
  />
);

export default Code;
