import { useEffect, useRef } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const TOAST_DURATION = 5000;

export default function Toast({ message, onDone }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="toast-notification" role="status">
      <FiCheckCircle className="toast-notification-icon" />
      <span>{message}</span>
    </div>
  );
}
