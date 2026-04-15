export type RoomStatus = 'Disponible' | 'Limpieza' | 'Mantenimiento' | 'Ocupada';
export type RoomType = 'Estándar' | 'Suite' | 'Premium';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  features: string[];
  price: number;
  status: RoomStatus;
  image: string;
}

export const roomsMockData: Room[] = [
  {
    id: '1',
    number: '302',
    type: 'Premium',
    features: ['wifi', 'ac_unit', 'tv', 'beach_access'],
    price: 320,
    status: 'Disponible',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdnUq8h9KcGU66rUEP4CQqNEDRfXpXKO41CgfD-W-Nsig2CnMQv6e5lQTcwqYdvxAMvHKP_24fbY5xRO_mnHB61zTyWWnstwij0ao2PdfglovjaQQ-9rzDHmx6tYqsw89B1KW4aWJsrnMuSkkqB8zfcP7I5S3u-AR_ovrUtbHB8nr8ZP-YGyeSaO6gFUTWns12gAoeXLHlh1dai_Pnsp-oTGY8Aug9TJZp7-vpQGnzdvCHw_k1C6RtACeYzxHqkTSZoHiHaF5bO5Q'
  },
  {
    id: '2',
    number: '104',
    type: 'Estándar',
    features: ['wifi', 'tv'],
    price: 145,
    status: 'Ocupada',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7TmPXUxBobXPm_IW3eCu8NvxES6fFQmarRNx0NI-iXsoDkJNFmvVr0af3TTO0NZTSfyl7VRZabOTNeJDau0eWJHbJInAg4ht5CZoHPUHVTo7MrERvP5TFcI9vngLyt9nzqZBnt3OTzmM957oSPimlVKOxUIe4e5VTNXcQaiMDyaC1dWZnAfJ2Vb2bL6Oh-chLX4zDTDlH1W7ncx4L1YV5BV873t4d8M7LedRKJwAOuA25K60hrCHEZnQxNA0SIHuaFKRMcbAQfvo'
  },
  {
    id: '3',
    number: '401',
    type: 'Suite',
    features: ['wifi', 'ac_unit', 'tv', 'balcony'],
    price: 550,
    status: 'Limpieza',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCssVPpTO6w_I17zjQn_MWKMFvadE1yYKMVU1rroOvrzsKNjp6eQKyYvxcnGH1PVySFifyxSdumDQ41E_4-ULNfN1jqUu7TA4Ukux7MjLu0hJZAUYzBd8D75-9yT3gIM38wEeSrXI355A9wPWP6qAI9oui_h-LSvyWF52Jpu-_6HX0-G170fyfAs87xKcoFQD6ZfEtEyBUbuDXNT_4vqCW2FA2sEGw9ckxooBphvBs4yaTMw1XK66ljWdybogkdfxv2Yu2AjXP6M-s'
  },
  {
    id: '4',
    number: '215',
    type: 'Estándar',
    features: ['wifi', 'tv'],
    price: 145,
    status: 'Mantenimiento',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnzz2DN3lXQ5sCHmmU607Z_h1TPayyu8199J6gGBJlk6noBghvcCwbG433IWwJBIY4burUMbodpdy6QxnLY2GlsfDocpnHElNdb85kXDx4Gm9nKtXI60aYDAqETu8DXOzK6uVE7gCYZmIBk5VXvXyfQGx1lIoq4ZzIzbt2LNUO8YlV8CDScQqc_z9wTbw3voXJM95W4EqgHQDBQodSkkdeYfOuHRX3h8CigRb2zeIQk3Rw9fmZIz_4LPjFjuV3q1nbBHEvbcDtkx0'
  }
];
