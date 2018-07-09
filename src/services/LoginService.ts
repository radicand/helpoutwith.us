import Cookies from 'universal-cookie';

const cookieOpts = {
  secure: false, // setting true won't allow us to read the cookie for user id
  path: '/',
  maxAge: 3600 * 24 * 30, // 1 month
};

export function login(variables: { token: string; id: string }) {
  const cookies = new Cookies();
  cookies.set('token', variables.token, cookieOpts);
  cookies.set('id', variables.id, cookieOpts);
}

export function logout() {
  const cookies = new Cookies();
  cookies.remove('token', cookieOpts);
  cookies.remove('id', cookieOpts);
}

export function getLoginState() {
  const cookies = new Cookies();

  return {
    token: cookies.get('token'),
    id: cookies.get('id'),
  };
}

export default {
  login,
  logout,
  getLoginState,
};
