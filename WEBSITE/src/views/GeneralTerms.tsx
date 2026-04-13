import { Link } from "react-router-dom";
import { legalLastUpdated, legalStoreInfo } from "@/lib/legal";

const GeneralTerms = () => {
  return (
    <main className="py-16 md:py-24 bg-baby-blue-light/50">
      <section className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-10">
          <h1 className="mb-3 font-heading text-3xl font-extrabold md:text-5xl">
            Общи условия
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Последна актуализация: {legalLastUpdated}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90 md:text-base">
            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                1. Данни за търговеца
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Наименование: {legalStoreInfo.traderName}</li>
                <li>Адрес за кореспонденция: {legalStoreInfo.traderAddress}</li>
                <li>Имейл: {legalStoreInfo.contactEmail}</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                2. Предмет
              </h2>
              <p>
                Тези условия уреждат използването на сайта {legalStoreInfo.website}
                , поръчката на продукти и отношенията между търговеца и
                потребителите.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                3. Поръчка и сключване на договор
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Поръчката се подава чрез формата на сайта.</li>
                <li>
                  Договорът се счита за сключен след потвърждение от търговеца.
                </li>
                <li>
                  За персонализирани продукти клиентът носи отговорност за
                  въведените данни (име, избор на визия, офис/адрес за доставка).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                4. Цени и плащане
              </h2>
              <p>
                Всички цени са в български лева (BGN). Към момента плащането е
                само чрез наложен платеж при доставка.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                5. Доставка
              </h2>
              <p>
                Доставката се извършва чрез Еконт или Спиди до адрес или до офис,
                според избора на клиента в поръчката.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                6. Отказ от договор, рекламации и персонализирани продукти
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  За стоки, изработени по индивидуална поръчка или според
                  изискванията на клиента, правото на отказ може да е ограничено
                  по чл. 57, т. 3 от Закона за защита на потребителите.
                </li>
                <li>
                  При дефект или несъответствие клиентът има право на рекламация
                  съгласно приложимото българско законодателство.
                </li>
                <li>
                  Рекламации се подават на имейл {legalStoreInfo.contactEmail}.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                7. Защита на личните данни
              </h2>
              <p>
                Обработването на лични данни се извършва съгласно
                <Link
                  to="/poveritelnost"
                  className="ml-1 font-semibold text-primary underline underline-offset-2"
                >
                  Политиката за поверителност
                </Link>
                . Използването на бисквитки е описано в
                <Link
                  to="/biskvitki"
                  className="ml-1 font-semibold text-primary underline underline-offset-2"
                >
                  Политиката за бисквитки
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                8. Приложимо право и спорове
              </h2>
              <p>
                За неуредените въпроси се прилага българското и европейското
                законодателство. Споровете се решават по взаимно съгласие, а при
                невъзможност – от компетентния съд.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GeneralTerms;
