import {redirect} from "next/navigation";
// Website chỉ có một giáo viên nên không còn trang hồ sơ theo id.
export default function Page(){redirect("/teachers");}
