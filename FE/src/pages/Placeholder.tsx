import { Result } from 'antd';

// Trang tạm cho các màn hình sẽ được xây ở các bước sau.
export default function Placeholder({ name }: { name: string }) {
  return (
    <Result
      status="info"
      title={name}
      subTitle="Màn hình này sẽ được xây dựng ở bước tiếp theo."
    />
  );
}
