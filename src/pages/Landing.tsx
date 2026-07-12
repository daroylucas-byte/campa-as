import React from 'react';

interface LandingProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick, onSignUpClick }) => {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 shadow-sm h-20">
        <div className="flex justify-between items-center w-full px-margin-desktop max-w-max-width mx-auto h-full">
          <div className="font-display text-headline-md font-extrabold text-primary tracking-tight">
            Campañas IA
          </div>
          <div className="hidden md:flex items-center gap-lg">
            <a className="text-primary font-bold border-b-2 border-primary py-2 text-body-sm" href="#product">Producto</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-sm" href="#how-it-works">Cómo Funciona</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-sm" href="#features">Características</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-body-sm" href="#pricing">Precios</a>
          </div>
          <div className="flex items-center gap-md">
            <button 
              onClick={onLoginClick}
              className="text-on-surface-variant font-semibold text-body-sm hover:text-primary transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onSignUpClick}
              className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-semibold text-body-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
            >
              Comenzar
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section id="product" className="relative overflow-hidden pt-xl pb-24 px-margin-desktop text-left">
          {/* Background blurs */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 -z-10"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 -z-10"></div>
          
          <div className="max-w-max-width mx-auto grid lg:grid-cols-2 gap-xl items-center">
            <div className="space-y-md">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 border border-primary/20 text-primary font-semibold text-[12px] font-sans">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Marketing de Nueva Generación
              </div>
              <h1 className="font-display text-headline-xl text-on-surface leading-tight">
                Escalá tu agencia con <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary font-extrabold">Marketing de Contenidos</span> potenciado por IA
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl font-sans">
                Generá planes estratégicos de 30 días y contenido visual de alta calidad para tus clientes en segundos. La herramienta definitiva para agencias que no tienen tiempo que perder.
              </p>
              <div className="flex flex-wrap gap-md pt-4">
                <button 
                  onClick={onSignUpClick}
                  className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 rounded-xl font-semibold text-body-md flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Empezar ahora
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <a 
                  href="#how-it-works"
                  className="border border-outline-variant text-on-surface px-8 py-4 rounded-xl font-semibold text-body-md flex items-center gap-2 hover:bg-surface-container-low transition-colors text-center"
                >
                  Ver demo
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-[32px] p-2 overflow-hidden shadow-2xl relative">
                <img 
                  className="w-full h-auto rounded-[24px] object-cover" 
                  alt="Dashboard Preview" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtlXMNBgy_0f52xS0egFL6HY9ru3rj3PayoTc0bShqF5SaSrKhlCaVdCgQ6EvQJmONDH1T9Z4d1lF4ILNcPkeJW2TLoIUfIL2n5l5udY__V-B__Nnr-isv-gsiQgHwxfToLuMXiadYMEZNozYV6Sgeml_gxnwfmaJCBYy9S76P5cDHbSXi33NeqstsnJJRi2JivmonKkdhDrmGU1R6KzysElEZZZfJX0Biyy-5LmHQLzLVXcxS0lNQpw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-surface-container-highest border border-outline-variant p-md rounded-2xl flex items-center gap-md max-w-xs shadow-2xl animate-bounce">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-body-sm text-on-surface">Plan Generado</div>
                  <div className="text-body-sm text-on-surface-variant">30 días de contenido listos.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-xl px-margin-desktop bg-surface-container-lowest text-center">
          <div className="max-w-4xl mx-auto space-y-md">
            <h2 className="font-display text-headline-lg text-on-surface">Gestionar múltiples clientes no debería ser un cuello de botella.</h2>
            <p className="text-body-lg text-on-surface-variant font-sans leading-relaxed">
              ¿Te pasas horas ideando temas, redactando copys y buscando imágenes para cada cliente? El modelo tradicional es lento y propenso al error. <span className="font-bold text-primary">Campañas IA</span> elimina la fricción, permitiéndote escalar tu producción de contenido 10 veces más rápido sin perder la calidad humana.
            </p>
          </div>
        </section>

        {/* How it Works Section (Bento Style) */}
        <section id="how-it-works" className="py-xl px-margin-desktop bg-surface text-left">
          <div className="max-w-max-width mx-auto">
            <div className="text-center mb-xl">
              <h2 className="font-display text-headline-lg text-on-surface mb-xs">Cómo Funciona</h2>
              <p className="text-on-surface-variant font-sans">De la estrategia a la publicación en tres simples pasos.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-md">
              {/* Step 1 */}
              <div className="glass-card p-md rounded-[32px] space-y-md border-t-4 border-t-primary flex flex-col justify-between h-full bg-white/50">
                <div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-md">
                    <span className="material-symbols-outlined text-[32px]">psychology</span>
                  </div>
                  <h3 className="font-display text-headline-md mb-xs text-on-surface">1. Analizá la Identidad</h3>
                  <p className="text-body-sm text-on-surface-variant font-sans leading-relaxed">
                    Subí el logo y assets de tu cliente. Nuestra IA aprende su estilo visual y tono de voz único para garantizar consistencia total en cada pieza.
                  </p>
                </div>
                <div className="pt-md mt-auto">
                  <img 
                    className="rounded-xl w-full h-40 object-cover opacity-80 hover:opacity-100 transition-all duration-300" 
                    alt="Brand identity upload" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0miMk1XnXsV2-DzcFpZIePgk3rZ3byFLcwfP02Eq3P1jNPo6LUZAnzf6aDg6OSwZpGXlpyzpYW8ffXGdBBReDBnuwuqKILvONhtGHmS7cQa4joeUQwPM-Q6j-K21bphoC0CY9OH0Vwiowu4dSKMt34l_MoJp39yl1acLH83cFvoJcd67bFaxqzKqYmFabwA4-z2wFKOuRRm5WaVO5YqOB9k-LhAo0qhWcH2RBGT_FW1BQD0dEySdafQ"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-md rounded-[32px] space-y-md border-t-4 border-t-secondary flex flex-col justify-between h-full bg-white/50">
                <div>
                  <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-md">
                    <span className="material-symbols-outlined text-[32px]">calendar_month</span>
                  </div>
                  <h3 className="font-display text-headline-md mb-xs text-on-surface">2. Creá el Plan Estratégico</h3>
                  <p className="text-body-sm text-on-surface-variant font-sans leading-relaxed">
                    Definí objetivos y plataformas. Generamos un eje temático para cada semana, alineado con las tendencias del mercado y los KPIs de tu cliente.
                  </p>
                </div>
                <div className="pt-md mt-auto">
                  <img 
                    className="rounded-xl w-full h-40 object-cover opacity-80 hover:opacity-100 transition-all duration-300" 
                    alt="Content calendar planning" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN4IKeVv0yQulsnhJZwVnrF8nM6cZfZA8xBGDoxpJWD-djA_TvCDabRZ0tLhEuGEzIH6yHeDqhpvKU-X-Zzcxhzjf0WZKZhsUsfFQjXLJag9TMQIaKfmOJI_O5encW5iC__9FWsejHqNUkslVdcBz0jz-OCaptTvOZodGudewBse1F6BePalxIG0KB3eH3IF03R37tm8AFh-s2PFe3nLGPfNaN_xA-yw8PdYKxqlc10sBXw3t-EygQOA"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="glass-card p-md rounded-[32px] space-y-md border-t-4 border-t-tertiary flex flex-col justify-between h-full bg-white/50">
                <div>
                  <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-md">
                    <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                  </div>
                  <h3 className="font-display text-headline-md mb-xs text-on-surface">3. Generá y Publicá</h3>
                  <p className="text-body-sm text-on-surface-variant font-sans leading-relaxed">
                    Obtené posts semanales con copy, hashtags e imágenes generadas por IA listas para aprobar. Revisá, editá y exportá en un clic.
                  </p>
                </div>
                <div className="pt-md mt-auto">
                  <img 
                    className="rounded-xl w-full h-40 object-cover opacity-80 hover:opacity-100 transition-all duration-300" 
                    alt="Post generation visual" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwBMk6I06m-x-3QEH1KephgS6K8n9SD9NLWnh_8OWBxgnmACkSirANZyOwDhurtiGY9O8Q9SGTgb77CtqGOIRzhOUKaYYyGYGkm-NYl-PRiBXFnhFubNYK2wW2NeIe-5KKNJT0Csk8PN4hOZ15CcICBa8WDw9xWvzm27AZ-t9kc2gEzVrqq7wqSJOuDmW0AAL4eVSwZwH4zmyjLLy4aVTTbVyXMJ4QAi__JaLQwTdSCk93_NcMUcqUwA"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-xl px-margin-desktop text-left">
          <div className="max-w-max-width mx-auto">
            <div className="grid lg:grid-cols-2 gap-xl items-center">
              <div className="space-y-lg">
                <h2 className="font-display text-headline-lg mb-lg text-on-surface">Potenciá tu flujo de trabajo con herramientas inteligentes</h2>
                <div className="grid sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                    <h4 className="font-display text-body-lg font-bold text-on-surface">Identidad Visual Única</h4>
                    <p className="text-body-sm text-on-surface-variant font-sans">Cada cliente mantiene su ADN visual y de comunicación sin excepciones.</p>
                  </div>
                  <div className="space-y-xs">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>update</span>
                    <h4 className="font-display text-body-lg font-bold text-on-surface">Planificación Automatizada</h4>
                    <p className="text-body-sm text-on-surface-variant font-sans">Ahorrá horas de brainstorming con sugerencias inteligentes de ejes temáticos.</p>
                  </div>
                  <div className="space-y-xs">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
                    <h4 className="font-display text-body-lg font-bold text-on-surface">Imágenes Multimodales</h4>
                    <p className="text-body-sm text-on-surface-variant font-sans">Fotos, ilustraciones y gráficos realistas generados a la medida por IA.</p>
                  </div>
                  <div className="space-y-xs">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                    <h4 className="font-display text-body-lg font-bold text-on-surface">Gestión de Billetera</h4>
                    <p className="text-body-sm text-on-surface-variant font-sans">Control total sobre tu presupuesto publicitario con una billetera integrada.</p>
                  </div>
                </div>
              </div>
              <div className="relative bg-surface-container rounded-[48px] p-lg flex justify-center overflow-hidden">
                <img 
                  className="rounded-[32px] shadow-2xl object-cover" 
                  alt="Generative AI creation concept" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsS1tT2cvIjQOpT2CEeQcCnCFk6osSpraXu4ZbDMKTYgUfX4hb1PjchR9MNtA8tQ2jKkG88uf0LTJ_5hNwIu2bFd7yb8FVgU0eMXUVJ6y-v20QCZDhsmxCHzf8mbHg7iYz6HNMmfdEbvBaxxwfZcdqqpoiYOM2Z5gdwyzPFK-xjz6KOqn4zfTZMNk1ft3QgWmAt6GVWGT-rE2KBnWsOToJZqZ8nB5n_H-6pvpMg5FQ4byQ4o-004hhOg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing/Wallet Section */}
        <section id="pricing" className="py-xl px-margin-desktop bg-inverse-surface text-inverse-on-surface rounded-[64px] mx-margin-desktop text-left">
          <div className="max-w-max-width mx-auto grid md:grid-cols-2 gap-xl items-center">
            <div className="space-y-md">
              <h2 className="font-display text-headline-lg">Pagá solo por lo que usás</h2>
              <p className="text-body-lg opacity-80 font-sans">
                Olvidate de las suscripciones rígidas. Con nuestro sistema de **Wallet de Créditos**, vos decidís cuánto invertir según la carga de trabajo de tus clientes cada mes.
              </p>
              <ul className="space-y-md font-sans">
                <li className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-tertiary-fixed text-xl">verified</span>
                  <span>Créditos sin fecha de vencimiento.</span>
                </li>
                <li className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-tertiary-fixed text-xl">verified</span>
                  <span>Recargá en segundos cuando lo necesites.</span>
                </li>
                <li className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-tertiary-fixed text-xl">verified</span>
                  <span>Asigná presupuestos específicos por cliente.</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card bg-surface/5 border-white/10 p-lg rounded-[40px] text-center space-y-lg">
              <div className="font-semibold tracking-widest text-[12px] uppercase opacity-60">Tu Billetera Campañas IA</div>
              <div className="text-[64px] font-bold text-tertiary-fixed-dim">
                5,000 <span className="text-body-lg font-normal opacity-60">Créditos</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="ai-shimmer h-full w-3/4 rounded-full"></div>
              </div>
              <p className="text-body-sm opacity-80 font-sans">Equivale a aprox. 20 planes estratégicos completos con contenido visual.</p>
              <button 
                onClick={onSignUpClick}
                className="w-full bg-tertiary hover:bg-tertiary-container text-on-tertiary py-4 rounded-xl font-semibold text-body-md transition-colors cursor-pointer"
              >
                Cargar Créditos
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-xl px-margin-desktop relative overflow-hidden bg-primary/5 mt-12 text-center">
          <div className="max-w-4xl mx-auto space-y-lg py-xl">
            <h2 className="font-display text-headline-xl leading-tight text-on-surface">¿Listo para transformar tu agencia?</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto font-sans">
              Unite a las agencias que ya están ahorrando <span className="font-bold text-primary">+20 horas semanales</span> y enfocándose en lo que realmente importa: los resultados.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={onSignUpClick}
                className="bg-primary hover:bg-primary-container text-on-primary px-12 py-5 rounded-2xl font-semibold text-headline-md shadow-2xl shadow-primary/40 hover:scale-105 transition-transform flex items-center gap-md cursor-pointer"
              >
                Comenzar Gratis
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/20 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg px-margin-desktop py-xl max-w-max-width mx-auto">
          <div className="space-y-md">
            <div className="font-display text-headline-md font-extrabold text-on-surface">Campañas IA</div>
            <p className="text-on-surface-variant text-body-sm font-sans">Potenciando la creatividad humana con inteligencia artificial de precisión.</p>
          </div>
          <div className="flex flex-col gap-sm">
            <h5 className="font-semibold text-body-sm text-on-surface font-sans">Compañía</h5>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Sobre nosotros</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Carreras</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Prensa</a>
          </div>
          <div className="flex flex-col gap-sm">
            <h5 className="font-semibold text-body-sm text-on-surface font-sans">Legal</h5>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">API Documentation</a>
          </div>
          <div className="flex flex-col gap-sm">
            <h5 className="font-semibold text-body-sm text-on-surface font-sans">Soporte</h5>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Contact Support</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Centro de Ayuda</a>
            <a className="text-on-surface-variant hover:text-secondary transition-colors text-body-sm font-sans" href="#">Status</a>
          </div>
        </div>
        <div className="border-t border-outline-variant/10 py-md px-margin-desktop max-w-max-width mx-auto text-center md:text-left">
          <p className="text-body-sm text-on-surface-variant font-sans">© 2026 Campañas IA. Precision-engineered for marketing excellence.</p>
        </div>
      </footer>
    </div>
  );
};
