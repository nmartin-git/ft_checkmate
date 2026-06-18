interface ButtonProps {
    label : string;
    secondary? :boolean;
    fullWidth?: boolean;
    large?:boolean;
    onClick: () => void;
    disabled?:boolean;
    outline?:boolean;
}

const Button: React.FC<ButtonProps>= ({
    label,
    secondary,
    fullWidth,
    large,
    onClick,
    disabled,
    outline
}) => {
  return (
   <button 
    disabled = {disabled}
    onClick={onClick}
    className={`
            disabled:opacity-70 
            disabled:cursor-not-allowed 
            font-bold
            transition-all
            duration-100
            
            /* Changement DA principal : Rectangulaire avec très léger arrondi */
            rounded-md 
            
            /* Effet poussoir 3D de Chess.com */
            border-b-[4px] 
            active:border-b-0 
            active:mt-[4px]
            
            ${fullWidth ? 'w-full' : 'w-fit'}
            
            /* Styles selon les types de boutons */
            ${secondary 
                ? 'bg-[#312e2b] text-gray-200 border-[#211f1d] hover:bg-[#3d3935]' 
                : 'bg-[#81b64c] text-white border-[#537631] hover:bg-[#95ca5f]'
            }
            
            /* Tailles de police et padding ajustés pour compenser le border-b */
            ${large ? 'text-lg px-6 py-2.5 active:mb-[4px]' : 'text-sm px-4 py-1.5 active:mb-[4px]'}
            
            /* Gestion de l'outline si besoin */
            ${outline ? 'bg-transparent border-2 border-white text-white border-b-2 active:mt-0 active:mb-0' : ''}
        `}
   >
        {label}
   </button>
  );
}
export default Button 