import Cookies from 'universal-cookie';

let COOKIE_REF: Cookies = null;

const cookieOpts = {
  secure: false, // setting true won't allow us to read the cookie for user id
  path: '/',
  maxAge: 3600 * 24 * 30, // 1 month
};

export function login(variables: { token: string; id: string }) {
  COOKIE_REF = new Cookies();
  COOKIE_REF.set('token', variables.token, cookieOpts);
  COOKIE_REF.set('id', variables.id, cookieOpts);
}

export function logout() {
  COOKIE_REF = new Cookies();
  COOKIE_REF.remove('token', cookieOpts);
  COOKIE_REF.remove('id', cookieOpts);
  COOKIE_REF = null;
}

export function getLoginState(
  opts: { newCookie?: boolean } = { newCookie: false },
) {
  if (!COOKIE_REF || opts.newCookie) {
    COOKIE_REF = new Cookies();
  }

  return {
    token: COOKIE_REF.get('token'),
    id: COOKIE_REF.get('id'),
  };
}

export default {
  login,
  logout,
  getLoginState,
};
