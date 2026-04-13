const About = () => {
  return (
    <main>
      {/* Story */}
      <section className="bg-baby-blue-light/50 py-12 sm:py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-6 font-heading text-3xl font-extrabold sm:text-4xl md:text-5xl">
            За <span className="text-primary">нас</span> 💕
          </h1>
          <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Little Wonders Gifts започна като малък семеен проект, вдъхновен от
            раждането на нашето първо дете. Искахме да създадем подаръци, които
            носят топлина, усмивки и спомени за цял живот.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Днес продължаваме да изработваме всеки подарък на ръка, влагайки
            любов във всеки детайл. Вярваме, че най-добрите подаръци са тези,
            създадени с душа — и точно такива правим.
          </p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-border/50 bg-card p-5 sm:p-7 md:p-12">
            <h2 className="mb-6 text-center font-heading text-2xl font-extrabold md:text-3xl">
              Нашата <span className="text-primary">мисия</span> 🎯
            </h2>
            <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Little Wonders се роди от сърцето на една майка. Когато станах
              мама, започнах да търся не просто красиви бебешки аксесоари, а
              неща със смисъл – нежни, безопасни и създадени с внимание. Така се
              появи идеята да създавам сама.
            </p>
            <p className="mb-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Днес моята мисия е да изработвам ръчно клипсове за биберони и
              персонализирани керамични фигурки, които носят лично отношение и
              топлина. Всяко име, което добавям, за мен не е просто надпис – то
              е малка история, малък свят, малко чудо.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Вярвам, че когато нещо е създадено с любов, това се усеща. И точно
              така искам да достигат моите продукти до вас – с грижа, нежност и
              майчино сърце.
            </p>

            <div className="mt-8 border-t border-border/40 pt-6 text-center">
              <h3 className="mb-3 font-heading text-lg font-bold sm:text-xl">
                Името, което превръщаме в
                <span className="text-primary"> спомен</span> 💝
              </h3>
              <p className="text-base leading-relaxed text-foreground sm:text-lg">
                Ти избираш името. Аз добавям любовта. И заедно създаваме нещо,
                което остава.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
