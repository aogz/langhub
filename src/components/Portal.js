import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.setAttribute('id', 'practice-modal-portal');
    el.style.position = 'relative';
    el.style.zIndex = '9999';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return ReactDOM.createPortal(children, container);
};

export default Portal; 