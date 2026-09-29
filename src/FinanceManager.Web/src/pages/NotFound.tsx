import { LinkButton } from "@/components/LinkButton";
import { Result } from "antd";

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Ain't nuthin' here."
      extra={
        <LinkButton type="primary" href="/">
          Back Home
        </LinkButton>
      }
    />
  );
}
