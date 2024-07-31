import { App } from './App';

import { createRoot } from 'react-dom/client';
const container: HTMLElement | null = document.getElementById('root');
if (!container) {
  throw Error(
    'Корневой элемент не найден. Пожалуйста, убедитесь, что в HTML есть элемент с id="root".'
  );
}
const root = createRoot(container);
root.render(<App />);
