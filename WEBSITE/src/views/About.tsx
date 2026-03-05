const About = () => {
  return (
    <main>
      {/* Story */}
      <section className="py-16 md:py-24 bg-baby-blue-light/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl mb-6">
            За <span className="text-primary">нас</span> 💕
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Little Wonders Gifts започна като малък семеен проект, вдъхновен от
            раждането на нашето първо дете. Искахме да създадем подаръци, които
            носят топлина, усмивки и спомени за цял живот.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Днес продължаваме да изработваме всеки подарък на ръка, влагайки
            любов във всеки детайл. Вярваме, че най-добрите подаръци са тези,
            създадени с душа — и точно такива правим.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-3xl border border-border/50 p-8 md:p-12">
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl mb-6 text-center">
              Нашата <span className="text-primary">мисия</span> 🎯
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Little Wonders се роди от сърцето на една майка. Когато станах
              мама, започнах да търся не просто красиви бебешки аксесоари, а
              неща със смисъл – нежни, безопасни и създадени с внимание. Така се
              появи идеята да създавам сама.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Днес моята мисия е да изработвам ръчно клипсове за биберони и
              персонализирани керамични фигурки, които носят лично отношение и
              топлина. Всяко име, което добавям, за мен не е просто надпис – то
              е малка история, малък свят, малко чудо.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Вярвам, че когато нещо е създадено с любов, това се усеща. И точно
              така искам да достигат моите продукти до вас – с грижа, нежност и
              майчино сърце.
            </p>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <h3 className="font-heading font-bold text-xl mb-3">
                Името, което превръщаме в
                <span className="text-primary"> спомен</span> 💝
              </h3>
              <p className="text-lg text-foreground leading-relaxed">
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
