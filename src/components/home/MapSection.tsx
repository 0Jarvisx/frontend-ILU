export default function MapSection() {
  return (
    <section className="px-12 pb-24 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-surface-container-low dark:bg-stone-900 rounded-2xl overflow-hidden">
        <div className="p-12 lg:col-span-1">
          <h3 className="text-primary dark:text-emerald-400 text-3xl font-bold tracking-tight mb-6">Experimenta los Alrededores</h3>
          <p className="text-on-surface-variant dark:text-stone-400 mb-8 leading-relaxed">Ubicado en el corazón del bosque nuboso de Monteverde, Hotel ILU ofrece acceso inmediato a senderos de clase mundial y plataformas de observación de aves.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary dark:text-amber-400" data-icon="map">map</span>
              <div>
                <p className="text-sm font-bold text-primary dark:text-emerald-400">Sendero Cascadas Ocultas</p>
                <p className="text-xs text-on-surface-variant dark:text-stone-400">a 0.4 km del lobby</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary dark:text-amber-400" data-icon="restaurant">restaurant</span>
              <div>
                <p className="text-sm font-bold text-primary dark:text-emerald-400">La Cocina de Raíz</p>
                <p className="text-xs text-on-surface-variant dark:text-stone-400">Comedor sostenible en sitio</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 relative min-h-[400px]">
          <img 
            alt="Map Location Background" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmK_oBRk8QCC7mlGb70tAgqrWid80vU8xIfbipQbgvjFqRK0e1dkLdodefxFbObCFrt9Q1jPTwkkjAeayRdLbwHdo63yZ3bL2Nw9PQYCoWRK4Dl6-jeFEERKwGnsFN6QZK6vnBsgbByhXoyENLjE0uN6am5RFTtxK1zP-vxPK3Rsj4Z3mjwCloWXCbQ9Vp1qbayf-towJtpLwOqP3Nd2uhkcxdyVoHwVApZbh1MiShE6oEDHRj1vhxTlzH030aK_uu0g9uFwM0Xzg" 
          />
          <div className="absolute inset-0 bg-primary/20 dark:bg-stone-900/60 backdrop-overlay"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur px-8 py-4 rounded-full shadow-xl border border-white/20 dark:border-stone-700/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary dark:text-amber-400" data-icon="location_on" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="text-primary dark:text-emerald-400 font-bold tracking-tight uppercase text-xs">Explorar Guía Local</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
