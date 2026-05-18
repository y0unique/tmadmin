'use client';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { PRIVILEGES, ROLE_LABELS, getAssignableRoles, getRoleDefault } from '../lib/privileges';
import styles from './UserModal.module.css';

const EMPTY = {
  u_name:'',u_email:'',u_type:3,u_profile:'n/a',
  p_add:null,p_edit:null,p_delete:null,p_import:null,p_export:null,p_logs:null,p_users:null,
};
const EDITOR_TYPE = 1; // replaced by session in Phase 3

function PrivilegeToggle({priv,value,roleDefault,onChange}){
  const effective = value===null ? roleDefault : value;
  const isOverride = value!==null;
  return(
    <div className={styles.privRow}>
      <div className={styles.privInfo}>
        <span className={styles.privLabel}>{priv.label}</span>
        <span className={styles.privDesc}>{priv.desc}</span>
      </div>
      <div className={styles.privControls}>
        {isOverride&&<button className={styles.privReset} onClick={()=>onChange(priv.key,null)}>Reset</button>}
        <div className={styles.privToggleWrap}>
          {isOverride&&<span className={styles.privOverrideDot}/>}
          <button
            className={`${styles.privToggle} ${effective?styles.privToggleOn:styles.privToggleOff}`}
            onClick={()=>onChange(priv.key,!effective)}
          ><span className={styles.privToggleKnob}/></button>
        </div>
      </div>
    </div>
  );
}

export default function UserModal({user,onClose,onSaved}){
  const {toast}=useToast();
  const isAdd=!user;
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [privOpen,setPrivOpen]=useState(false);
  const [errors,setErrors]=useState({});
  const [touched,setTouched]=useState({});
  const assignableRoles=getAssignableRoles(EDITOR_TYPE);

  useEffect(()=>{
    if(user){
      setForm({
        u_name:user.u_name||'',u_email:user.u_email||'',
        u_type:user.u_type??3,u_profile:user.u_profile||'n/a',
        p_add:user.p_add??null,p_edit:user.p_edit??null,p_delete:user.p_delete??null,
        p_import:user.p_import??null,p_export:user.p_export??null,
        p_logs:user.p_logs??null,p_users:user.p_users??null,
      });
    } else {setForm(EMPTY);}
    setErrors({});setTouched({});setPrivOpen(false);
  },[user]);

  const validate=(f)=>{
    const e={};
    if(!f.u_name.trim())e.u_name='Name is required.';
    else if(f.u_name.trim().length>100)e.u_name='Max 100 characters.';
    if(!f.u_email.trim())e.u_email='Email is required.';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.u_email))e.u_email='Enter a valid email.';
    return e;
  };

  const handleChange=(e)=>{
    const{name,value}=e.target;
    const updated={...form,[name]:name==='u_type'?parseInt(value):value};
    setForm(updated);
    setErrors(prev=>({...prev,[name]:validate(updated)[name]}));
  };
  const handleFocus=(name)=>setTouched(prev=>({...prev,[name]:true}));
  const hasRedBorder=(name)=>errors[name]&&!touched[name];
  const handlePrivChange=(key,val)=>setForm(prev=>({...prev,[key]:val}));

  const handleSubmit=async(e)=>{
    e.preventDefault();
    const errs=validate(form);setErrors(errs);setTouched({});
    if(Object.keys(errs).length>0)return;
    setSaving(true);
    try{
      const url=isAdd?'/api/users':`/api/users/${user.u_id}`;
      const method=isAdd?'POST':'PUT';
      const res=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(form),cache:'no-store'});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error||'Failed to save');
      toast({message:isAdd?'User added!':'User updated!',type:'success'});
      onSaved();
    }catch(err){toast({message:err.message,type:'error'});}
    finally{setSaving(false);}
  };

  const overrideCount=PRIVILEGES.filter(p=>form[p.key]!==null).length;

  return(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e=>e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalTag}>{isAdd?'NEW USER':'EDIT USER'}</span>
            <h2>{isAdd?'Add User':user?.u_name}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} id="userForm" noValidate>
          {Object.keys(errors).length>0&&(
            <div className={styles.errorSummary}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {Object.keys(errors).length} field{Object.keys(errors).length>1?'s need':' needs'} attention.
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Name <span className={styles.req}>*</span></label>
              <input className={`${styles.input} ${hasRedBorder('u_name')?styles.inputError:''}`}
                name="u_name" value={form.u_name} onChange={handleChange}
                onFocus={()=>handleFocus('u_name')} placeholder="e.g. Juan dela Cruz" maxLength={100}/>
              {errors.u_name&&<span className={styles.fieldError}>{errors.u_name}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.req}>*</span></label>
              <input className={`${styles.input} ${hasRedBorder('u_email')?styles.inputError:''}`}
                name="u_email" value={form.u_email} type="email" onChange={handleChange}
                onFocus={()=>handleFocus('u_email')} placeholder="user@toymafia.com"/>
              {errors.u_email&&<span className={styles.fieldError}>{errors.u_email}</span>}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Role <span className={styles.req}>*</span></label>
              <select className={styles.input} name="u_type" value={form.u_type} onChange={handleChange}>
                {assignableRoles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span className={styles.hint}>Current: <strong>{ROLE_LABELS[form.u_type]||'Unknown'}</strong></span>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Profile Picture URL</label>
              <input className={styles.input} name="u_profile"
                value={form.u_profile==='n/a'?'':form.u_profile} onChange={handleChange}
                placeholder="https://... or Google Drive link"/>
            </div>
          </div>

          {/* Privilege Toggles */}
          <div className={styles.privSection}>
            <button type="button" className={styles.privToggleHeader} onClick={()=>setPrivOpen(o=>!o)}>
              <div className={styles.privHeaderLeft}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Privilege Overrides</span>
                {overrideCount>0&&<span className={styles.overrideBadge}>{overrideCount} overridden</span>}
              </div>
              <svg className={`${styles.privChevron} ${privOpen?styles.privChevronOpen:''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {privOpen&&(
              <div className={styles.privList}>
                <p className={styles.privNote}>
                  Defaults set by role. Toggle to override per user.
                  <span className={styles.privLegend}><span className={styles.legendDot}/> = overridden</span>
                </p>
                {PRIVILEGES.map(priv=>(
                  <PrivilegeToggle key={priv.key} priv={priv}
                    value={form[priv.key]} roleDefault={getRoleDefault(form.u_type,priv.key)}
                    onChange={handlePrivChange}/>
                ))}
                <button type="button" className={styles.resetAllBtn}
                  onClick={()=>{const r={};PRIVILEGES.forEach(p=>{r[p.key]=null;});setForm(prev=>({...prev,...r}));}}>
                  Reset all to role defaults
                </button>
              </div>
            )}
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" form="userForm" className={styles.submitBtn} disabled={saving}>
            {saving?<><span className={styles.btnSpinner}/> Saving...</>:isAdd?'Add User':'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
