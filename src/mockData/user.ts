export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export const mockUser: User = {
  id: 'u1',
  name: 'Invitado',
  email: 'guest@sanctuary.com',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHuHA6-MSHGxe_IiEFSCzpdooGM9-jqyQg_AWdSjndmmdKYVgC0PW8OaOfwOYlDcIHuehKktDJGFxFxGV4MhQfb8LjmiSwnbNNufe4V2-u_FkDL6-1MzUi1ps8tgqALne351wKvo_irOo1y0fFg66rEhxCcvHvM__PkT2LxEttqUqi4e5e8VMxebiv0ONssbkwvnOkILE7D5Cc-ecnFG2pCpWCOpbDJNPedgs96b0HsbZIu3dR_jU7cPb8hFoEvpQvcenTlFQ9AVU'
};
