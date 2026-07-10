import { getTranslations } from "next-intl/server";

const PrivacyPage = async () => {
    const t = await getTranslations("privacy");
    return (
        <div className="max-w-3xl mx-auto px-6 py-10 bg-[#262522]">
            <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

            <p className="mb-4 text-sm text-gray-400">{t("updated")} : {new Date().toLocaleDateString()}</p>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t("s1_title")}</h2>
                <p>{t("s1_intro")}</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>{t("s1_li1")}</li>
                    <li>{t("s1_li2")}</li>
                    <li>{t("s1_li3")}</li>
                    <li>{t("s1_li4")}</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t("s2_title")}</h2>
                <p>{t("s2_intro")}</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>{t("s2_li1")}</li>
                    <li>{t("s2_li2")}</li>
                    <li>{t("s2_li3")}</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t("s3_title")}</h2>
                <p>{t("s3_body")}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t("s4_title")}</h2>
                <p>{t("s4_body")}</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t("s5_title")}</h2>
                <p>{t("s5_body")}</p>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-2">{t("s6_title")}</h2>
                <p>{t("s6_body")}</p>
            </section>
        </div>
    );
}
export default PrivacyPage