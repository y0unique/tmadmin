export const ROLE_LABELS = { 0:'Disabled',1:'System Admin',2:'Admin',3:'User',4:'Viewer',5:'New' };
export const ROLE_OPTIONS = [
  {value:2,label:'Admin'},{value:3,label:'User'},{value:4,label:'Viewer'},{value:5,label:'New'},
];
export const PRIVILEGES = [
  {key:'p_add',   label:'Add Items',    desc:'Can add new inventory items'},
  {key:'p_edit',  label:'Edit Items',   desc:'Can edit existing inventory items'},
  {key:'p_delete',label:'Delete Items', desc:'Can archive/remove inventory items'},
  {key:'p_import',label:'Import Data',  desc:'Can import CSV files'},
  {key:'p_export',label:'Export Data',  desc:'Can export CSV files'},
  {key:'p_logs',  label:'View Logs',    desc:'Can view activity logs'},
  {key:'p_users', label:'Manage Users', desc:'Can add, edit, and manage users'},
];
const ROLE_DEFAULTS = {
  1:{p_add:true, p_edit:true, p_delete:true, p_import:true, p_export:true, p_logs:true, p_users:true},
  2:{p_add:true, p_edit:true, p_delete:true, p_import:true, p_export:true, p_logs:true, p_users:false},
  3:{p_add:true, p_edit:true, p_delete:false,p_import:false,p_export:false,p_logs:false,p_users:false},
  4:{p_add:false,p_edit:false,p_delete:false,p_import:false,p_export:false,p_logs:false,p_users:false},
  5:{p_add:false,p_edit:false,p_delete:false,p_import:false,p_export:false,p_logs:false,p_users:false},
  0:{p_add:false,p_edit:false,p_delete:false,p_import:false,p_export:false,p_logs:false,p_users:false},
};
export function resolvePrivilege(user,key){
  const ov=user[key];
  if(ov!==null&&ov!==undefined)return ov;
  return(ROLE_DEFAULTS[user.u_type]||ROLE_DEFAULTS[5])[key]??false;
}
export function resolveAllPrivileges(user){
  const r={};for(const{key}of PRIVILEGES)r[key]=resolvePrivilege(user,key);return r;
}
export function getRoleDefault(uType,key){return ROLE_DEFAULTS[uType]?.[key]??false;}
export function canEditRole(editorType,targetType){
  if(editorType===1)return targetType!==1;
  if(editorType===2)return targetType>2;
  return false;
}
export function getAssignableRoles(editorType){
  if(editorType===1)return ROLE_OPTIONS;
  if(editorType===2)return ROLE_OPTIONS.filter(r=>r.value>2);
  return[];
}
