export default function Sidebar() {
  return <>Sidebar Works!</>
}

// const menuItems = [
//   [
//     {
//       text: "Dashboard",
//       href: "/",
//       icon: <AnalyticsOutlinedIcon />,
//     },
//     {
//       text: "Transactions",
//       href: "/transactions",
//       icon: <PaymentsOutlinedIcon />,
//     },
//     {
//       text: "Import",
//       href: "/import",
//       icon: <BackupOutlined />,
//     },
//   ],
//   [
//     {
//       text: "Budget",
//       href: "/",
//       icon: <BalanceOutlined />,
//     },
//     {
//       text: "Categories",
//       href: "/",
//       icon: <JoinInnerOutlined />,
//     },
//     {
//       text: "Accounts",
//       href: "/",
//       icon: <CreditCardOutlined />,
//     },
//     {
//       text: "Import Definitions",
//       href: "/",
//       icon: <RequestPageOutlined />,
//     },
//     {
//       text: "Patterns",
//       href: "/",
//       icon: <CodeOutlined />,
//     },
//     {
//       text: "Users",
//       href: "/",
//       icon: <ManageAccountsOutlined />,
//     },
//   ],
// ]

// export default function Sidebar() {
//   const [open, setOpen] = useState(false)

//   return (
//     <Drawer
//       variant="permanent"
//       open={open}
//       onMouseEnter={() => setOpen(true)}
//       onMouseLeave={() => setOpen(false)}
//     >
//       <List>
//         {menuItems.map((menuGroup, i) => (
//           <List key={i}>
//             {menuGroup.map((menuItem) => (
//               <ListItemButton
//                 key={menuItem.text}
//                 sx={[
//                   {
//                     minHeight: 48,
//                     px: 2.5,
//                   },
//                   open
//                     ? {
//                         justifyContent: "initial",
//                       }
//                     : {
//                         justifyContent: "center",
//                       },
//                 ]}
//               >
//                 <ListItemIcon
//                   sx={{
//                     minWidth: 0,
//                     mr: open ? 2 : "auto",
//                     justifyContent: "center",
//                   }}
//                 >
//                   {menuItem.icon}
//                 </ListItemIcon>
//                 <ListItemText
//                   primary={menuItem.text}
//                   sx={{
//                     opacity: open ? 1 : 0,
//                     transition: "opacity .2s",
//                   }}
//                 />
//               </ListItemButton>
//             ))}
//             <Divider />
//           </List>
//         ))}
//       </List>
//     </Drawer>
//   )
// }
