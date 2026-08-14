// import { Form } from "antd";
// import { useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// export default function TransactionsEditPage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [form] = Form.useForm();

//   useEffect(() => {
//     if (user) {
//       form.setFieldsValue({
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       });
//     }
//   }, [user, form]);

//   if (!user) {
//     return (
//       <div style={{ padding: 24 }}>
//         <h2>User not found</h2>

//         <Button onClick={() => navigate("/users")}>Back to users</Button>
//       </div>
//     );
//   }

//   const handleSubmit = async (values: {
//     name: string;
//     email: string;
//     role: string;
//   }) => {
//     console.log("Updated user:", {
//       id: user.id,
//       ...values,
//     });

//     // Normally you would make your API request here:
//     //
//     // await updateUser(user.id, values);

//     message.success("User updated successfully");

//     navigate("/users");
//   };

//   return (
//     <div style={{ padding: 24 }}>
//       <Space direction="vertical" size="large" style={{ width: "100%" }}>
//         <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/users")}>
//           Back to users
//         </Button>

//         <Card title={`Edit ${user.name}`}>
//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={handleSubmit}
//             style={{ maxWidth: 600 }}
//           >
//             <Form.Item
//               label="Name"
//               name="name"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please enter a name",
//                 },
//               ]}
//             >
//               <Input placeholder="Name" />
//             </Form.Item>

//             <Form.Item
//               label="Email"
//               name="email"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please enter an email",
//                 },
//                 {
//                   type: "email",
//                   message: "Please enter a valid email",
//                 },
//               ]}
//             >
//               <Input placeholder="Email" />
//             </Form.Item>

//             <Form.Item
//               label="Role"
//               name="role"
//               rules={[
//                 {
//                   required: true,
//                   message: "Please select a role",
//                 },
//               ]}
//             >
//               <Select
//                 options={[
//                   {
//                     label: "Admin",
//                     value: "Admin",
//                   },
//                   {
//                     label: "User",
//                     value: "User",
//                   },
//                 ]}
//               />
//             </Form.Item>

//             <Space>
//               <Button onClick={() => navigate("/users")}>Cancel</Button>

//               <Button type="primary" htmlType="submit">
//                 Save Changes
//               </Button>
//             </Space>
//           </Form>
//         </Card>
//       </Space>
//     </div>
//   );
// }
