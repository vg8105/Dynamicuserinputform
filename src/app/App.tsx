import { Toaster } from 'sonner';
import BriefingForm from './components/BriefingForm';

export default function App() {
  return (
    <>
      <BriefingForm />
      <Toaster position="top-right" />
    </>
  );
}