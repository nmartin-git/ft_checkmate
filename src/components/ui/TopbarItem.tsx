import Link from "next/link";
import { IconType } from "react-icons";

interface TopbarItemProps
{
    label:string;
    href:string;
    icon : IconType;
}

const TopbarItem : React.FC<TopbarItemProps>= ({
    label,
    href,
    icon : Icon
}) => {
  return (
    <Link href={href} className="flex flex-col items-center
    cursor-pointer hover:opacity-70
        transition ml-10 
        ">
        <Icon size={30} color="yellow"/>
        <p className="text-white
        font-semibold
        ">{label}</p>

    </Link>
  );
}
export default TopbarItem