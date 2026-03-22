import React from 'react';

export function useMountEffect(effect: () => void | (() => void)) {
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(effect, []);
  /* eslint-enable react-hooks/exhaustive-deps */
}
