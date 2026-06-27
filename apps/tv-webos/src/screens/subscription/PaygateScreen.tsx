/**
 * Paygate Screen - standalone subscription gate (accessible from Profile)
 */
import { useNavigate } from 'react-router-dom';
import { SubscriptionGate } from '@/components/SubscriptionGate';

export function PaygateScreen() {
  const navigate = useNavigate();

  return (
    <SubscriptionGate
      mode="general"
      onSuccess={() => navigate('/home', { replace: true })}
      onBack={() => navigate(-1)}
    />
  );
}

export default PaygateScreen;
