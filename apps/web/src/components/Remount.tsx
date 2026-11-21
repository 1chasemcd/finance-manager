export default function Remount({
  watch,
  children,
}: {
  watch: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {watch && children}
      {!watch && children}
    </>
  );
}
