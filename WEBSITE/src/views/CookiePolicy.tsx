import { Link } from "react-router-dom";
import {
  cookieConsentStorageKey,
  legalLastUpdated,
  legalStoreInfo,
} from "@/lib/legal";

const CookiePolicy = () => {
  return (
    <main className="py-16 md:py-24 bg-baby-blue-light/50">
      <section className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-10">
          <h1 className="mb-3 font-heading text-3xl font-extrabold md:text-5xl">
            Политика за бисквитки
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Последна актуализация: {legalLastUpdated}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90 md:text-base">
            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                1. Какво са бисквитки и сходни технологии
              </h2>
              <p>
                Бисквитките са малки текстови файлове, които се запазват в
                браузъра. Сайтът може да използва и localStorage/sessionStorage
                за съхраняване на техническа информация, необходима за
                функционирането му.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                2. Какво използваме в момента
              </h2>
              <p className="mb-3">
                Към момента {legalStoreInfo.brandName} използва само необходими
                технологии за работа на сайта и вход в профил.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>{cookieConsentStorageKey}</strong> – пази избора ти за
                  бисквитки.
                </li>
                <li>
                  <strong>lwg_auth_token</strong> (localStorage) – сесия на
                  влязъл клиент.
                </li>
                <li>
                  <strong>lw_admin_token</strong> (sessionStorage) – админ
                  сесия.
                </li>
                <li>
                  <strong>lw_services_cache_v1</strong> (localStorage) – кеш за
                  услуги с цел по-бързо зареждане.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                3. Категории бисквитки
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Необходими:</strong> за сигурност, вход и работа на
                  функционалностите.
                </li>
                <li>
                  <strong>Аналитични/маркетингови:</strong> в момента не са
                  активирани по подразбиране.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                4. Управление на предпочитанията
              </h2>
              <p>
                Можеш да управляваш или изтриеш бисквитки от настройките на
                браузъра. Ако ограничиш необходими бисквитки/локално съхранение,
                някои функции на сайта може да не работят коректно.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                5. Правно основание
              </h2>
              <p>
                Необходимите бисквитки се използват на основание легитимен
                интерес и/или необходимост за предоставяне на изрично поисканата
                услуга. Незадължителни бисквитки се активират само след съгласие,
                когато бъдат въведени.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                6. Контакт
              </h2>
              <p>
                За въпроси относно бисквитките и поверителността: {" "}
                <a
                  href={`mailto:${legalStoreInfo.contactEmail}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {legalStoreInfo.contactEmail}
                </a>
                .
              </p>
              <p className="mt-2">
                Виж също
                <Link
                  to="/poveritelnost"
                  className="ml-1 font-semibold text-primary underline underline-offset-2"
                >
                  Политика за поверителност
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CookiePolicy;
