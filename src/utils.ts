import { memoize } from '@typed/functions';

const getInitials = memoize((name: string) => {
  if (!name) {
    return '';
  }
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }

  return initials;
});

export { getInitials };
