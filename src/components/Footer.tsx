import Link from "next/link";
import { useTranslations } from "next-intl";

const Footer = () => {
    const t = useTranslations("footer");
  return (
    <footer className="w-full bg-[#1e1c18] border-t border-[#2b2925]
    px-6 py-4 flex items-center justify-between text-xs text-gray-400">
        <span>&copy; {new Date().getFullYear()} Dames.com</span>
        <div className="flex gap-4">
            <Link href={'/privacy'} className="hover:text-white transition-colors">
                {t("privacy")}
             </Link>
             <Link href={'/terms'} className="hover:text-white transition-colors">
                {t("terms")}
             </Link>
        </div>
    </footer>
  );
}
export default Footer;