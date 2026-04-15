export interface MockCheckoutSummary {
  roomName: string;
  roomStatus: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  surcharge: number;
  discount: number;
  reference: string;
}

export const checkoutMockData: MockCheckoutSummary = {
  roomName: 'Suite Premium',
  roomStatus: 'Disponible',
  roomImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw68qOgfSZjmWLm8C1OUCwYpSygB5DjtWJIDeC0ZCZUVghDy3if_ML3jephcKn4fmt5ns9lKTfJyRQRrKoqeL_e_WG9fy5_KBItVpXnAfPUfn4mzHN-QqXw2yx1ST7ZHUhLEp-fM8pr4Xk4q58E-PMmO9ZsZo6obI7yxPLn86yhtwKj1dcKaV129h-a5mvV3AY2EDq2lmX9ZLnD40hVUAjcmoWiZ-20jsC6qKukrxKM57QTWyr36X9UTVsDyHclUaQcszeBXM8XRU',
  checkIn: 'Vie, Nov 10',
  checkOut: 'Dom, Nov 12',
  nights: 2,
  pricePerNight: 450.00,
  surcharge: 50.00,
  discount: 95.00,
  reference: 'ILU-8829-X'
};
