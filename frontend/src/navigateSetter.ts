import { useNavigate } from 'react-router-dom';
import { History } from './history';

export const NavigateSetter = () => {
  History.navigate = useNavigate();

  return null;
};
