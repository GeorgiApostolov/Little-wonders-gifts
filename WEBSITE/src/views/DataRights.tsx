import { legalLastUpdated, legalStoreInfo } from "@/lib/legal";

const DataRights = () => {
  return (
    <main className="py-16 md:py-24 bg-baby-blue-light/50">
      <section className="container mx-auto max-w-4xl px-4">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-10">
          <h1 className="mb-3 font-heading text-3xl font-extrabold md:text-5xl">
            Права на субектите на данни (GDPR)
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Последна актуализация: {legalLastUpdated}
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-foreground/90 md:text-base">
            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                1. Как можеш да упражниш правата си
              </h2>
              <p>
                Изпрати искане до {" "}
                <a
                  href={`mailto:${legalStoreInfo.contactEmail}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {legalStoreInfo.contactEmail}
                </a>
                , като опишеш ясно какво право искаш да упражниш.
              </p>
              <p className="mt-2">
                Ще отговорим без ненужно забавяне и най-късно до 1 месец от
                получаване на искането, освен ако не е налице основание за
                удължаване по GDPR.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                2. Права по чл. 15–22 GDPR
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Право на достъп до личните ти данни.</li>
                <li>Право на коригиране на неточни данни.</li>
                <li>Право на изтриване („право да бъдеш забравен“).</li>
                <li>Право на ограничаване на обработването.</li>
                <li>Право на преносимост на данните.</li>
                <li>Право на възражение срещу обработване.</li>
                <li>
                  Право да не бъдеш обект на изцяло автоматизирано решение,
                  включително профилиране, когато е приложимо.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                3. Оттегляне на съгласие
              </h2>
              <p>
                Когато обработването е основано на съгласие, можеш да го оттеглиш
                по всяко време. Оттеглянето не засяга законосъобразността на
                обработването до момента на оттеглянето.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                4. Идентификация при искане
              </h2>
              <p>
                За защита на данните може да поискаме допълнителна информация за
                потвърждаване на самоличност преди изпълнение на искането.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-heading text-xl font-extrabold">
                5. Жалба до КЗЛД
              </h2>
              <p>
                Ако считаш, че правата ти са нарушени, можеш да подадеш жалба до
                Комисията за защита на личните данни: София 1592, бул. „Проф.
                Цветан Лазаров“ № 2, имейл {" "}
                <a
                  href="mailto:kzld@cpdp.bg"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  kzld@cpdp.bg
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DataRights;
