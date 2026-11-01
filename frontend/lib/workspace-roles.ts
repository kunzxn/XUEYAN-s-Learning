export type WorkspaceRole="learner"|"teacher"|"admin";
export const roleLabels:Record<WorkspaceRole,string>={learner:"Học viên",teacher:"Giảng viên",admin:"Quản trị viên"};
export function roleHome(role:string){return role==="admin"?"/admin":role==="teacher"?"/teacher":"/dashboard";}
export function workspaceFor(path:string):WorkspaceRole|null{
 const root=path.split(/[/?#]/)[1];
 if(root==="teacher")return "teacher";
 if(root==="admin")return "admin";
 return ["dashboard","learn","my-learning","lessons","review","collection","classes","assignments","progress","onboarding","notifications","settings"].includes(root)?"learner":null;
}
