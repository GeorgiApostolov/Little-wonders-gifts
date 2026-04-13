import { Link } from "react-router-dom";
import { legalLastUpdated, legalStoreInfo } from "@/lib/legal";

const PrivacyPolicy = () => {
  return (
    <main className="py-16 md:py-24 bg-baby-blue-light/50">
      <section className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-10">
          <h1 className="mb-3 font-heading text-3xl font-extrabold md:text-5xl">
            Политика за поверителност
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Последна актуализация: {legalLastUpdated}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90 md:text-base">
            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                1. Администратор на лични данни
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Администратор: {legalStoreInfo.traderName}</li>
                <li>Имейл за контакт: {legalStoreInfo.contactEmail}</li>
                <li>Адрес: {legalStoreInfo.traderAddress}</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                2. Какви данни обработваме
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Име, телефон и имейл на клиент.</li>
                <li>Данни за доставка: адрес или офис на куриер.</li>
                <li>Данни за поръчка: избран продукт, персонализация, статус.</li>
                <li>Технически данни за сигурност и работоспособност на сайта.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                3. Цели и правни основания
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Приемане, обработка и изпълнение на поръчки (чл. 6, пар. 1,
                  б. „б“ GDPR).
                </li>
                <li>
                  Изпълнение на законови задължения (напр. счетоводни и данъчни)
                  (чл. 6, пар. 1, б. „в“ GDPR).
                </li>
                <li>
                  Легитимен интерес – защита на услугата, превенция на злоупотреби
                  и поддръжка (чл. 6, пар. 1, б. „е“ GDPR).
                </li>
                <li>
                  Съгласие, когато е приложимо (напр. за незадължителни
                  бисквитки) (чл. 6, пар. 1, б. „а“ GDPR).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                4. Получатели на данни
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Куриерски фирми (Еконт и Спиди) за доставка.</li>
                <li>
                  Доставчици на хостинг, имейл и техническа поддръжка, които
                  обработват данните по възлагане.
                </li>
                <li>
                  Компетентни държавни органи, когато това е изискуемо по закон.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                5. Срокове за съхранение
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Данни за поръчки: до 5 години, освен ако закон изисква по-дълъг
                  срок.
                </li>
                <li>
                  Счетоводни документи: съгласно приложимото данъчно и
                  счетоводно законодателство.
                </li>
                <li>
                  Технически логове: за ограничен срок, необходим за сигурност и
                  диагностика.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                6. Твоите права
              </h2>
              <p>
                Имаш право на достъп, коригиране, изтриване, ограничаване,
                възражение и преносимост на данните, както и право да оттеглиш
                съгласие, когато обработването е основано на съгласие.
              </p>
              <p className="mt-2">
                Подробен списък с права и начин на упражняване:
                <Link
                  to="/gdpr-prava"
                  className="ml-1 font-semibold text-primary underline underline-offset-2"
                >
                  Права на субектите на данни
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                7. Жалба до надзорен орган
              </h2>
              <p>
                Можеш да подадеш жалба до Комисията за защита на личните данни
                (КЗЛД): София 1592, бул. „Проф. Цветан Лазаров“ № 2,
                {" "}
                <a
                  href="mailto:kzld@cpdp.bg"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  kzld@cpdp.bg
                </a>
                ,
                {" "}
                <a
                  href="https://www.cpdp.bg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  www.cpdp.bg
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                8. Промени в политиката
              </h2>
              <p>
                Запазваме право да актуализираме тази политика при промяна в
                законодателството или дейността. При съществени промени
                публикуваме нова версия на тази страница.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
