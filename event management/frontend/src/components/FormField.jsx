import styles from '../styles/form.module.css';


export default function FormField({ label, children }){
return (
<div className={styles.field}>
<label>{label}</label>
{children}
</div>
);
}