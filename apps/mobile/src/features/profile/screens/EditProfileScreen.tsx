import { useNavigation } from '@react-navigation/native';
import { OnboardingScreen } from '../../auth';

export function EditProfileScreen() {
  const navigation = useNavigation();
  return <OnboardingScreen editing onSaved={() => navigation.goBack()} />;
}
