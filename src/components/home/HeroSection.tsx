import heroImg from '../../assets/hero.png';

export default function HeroSection() {
  return (
    <section className="relative h-[614px] w-full flex flex-col justify-end overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <img
          alt="Hotel ILU Exterior"
          className="w-full h-full object-cover brightness-[0.85]"
          src={heroImg}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10 px-12 pb-24 max-w-7xl mx-auto w-full">
        <h2 className="text-white text-6xl font-bold tracking-tighter mb-4 text-shadow-editorial">Encuentra tu paz.</h2>
        <p className="text-white/90 text-xl font-light max-w-2xl">Experiencias de santuario personalizadas, creadas en el corazón del bosque. Selecciona tus fechas para comenzar tu viaje.</p>
      </div>
    </section>
  )
}
