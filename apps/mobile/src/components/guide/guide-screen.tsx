import { useRef, useState } from 'react';
import { Stack, useNavigation, useRouter } from 'expo-router';
import {
  useHeaderHeight,
  usePreventRemove,
} from 'expo-router/react-navigation';
import Animated, {
  ReduceMotion,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, XStack, YStack } from 'tamagui';

import { Aurora } from '@/components/brand/aurora';
import { FormScrollView } from '@/components/common/form-scroll-view';
import { BUTTON, SPACING } from '@/constants/layout';
import { useCompleteGuide, useGuideErrorMessage } from '@/features/guide/hooks';
import {
  canContinue,
  enterHabits,
  habitCap,
  nextStep,
  previousStep,
} from '@/features/guide/steps';
import {
  EMPTY_GUIDE,
  freshProgress,
  type GuideStep,
} from '@/features/guide/types';
import { useAllowance } from '@/features/limits/hooks';
import { useTranslations } from '@/lib/i18n';

import { DoneStep } from './done-step';
import { GoalStep } from './goal-step';
import { exampleFor } from './guide-examples';
import { GuideProgress } from './guide-progress';
import { HabitsStep } from './habits-step';
import { SavingStep } from './saving-step';
import { TodayStep } from './today-step';

const SLIDE_MS = 220;
const MIN_SAVING_MS = 900;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function GuideScreen() {
  const { t } = useTranslations();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const toMessage = useGuideErrorMessage();
  const { remaining } = useAllowance('habit');
  const { completeGuide, isCompleting, error } = useCompleteGuide();

  const [step, setStep] = useState<GuideStep>('goal');
  const [forward, setForward] = useState(true);
  const [draft, setDraft] = useState(EMPTY_GUIDE);
  const progress = useRef(freshProgress());
  const leaving = useRef(false);

  const cap = habitCap(remaining);
  const example = exampleFor(draft.goalName, t);
  const suggestions = example ? example.habits.map((key) => t(key)) : [];
  const back = previousStep(step);
  const inputStep =
    step === 'goal' || step === 'habits' || step === 'today' ? step : null;
  const ready = canContinue(step, draft);

  usePreventRemove(step !== 'goal', ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    if (back === null) return;
    setForward(false);
    setStep(back);
  });

  const save = async () => {
    const [id] = await Promise.all([
      completeGuide({ draft, progress: progress.current }).catch(() => null),
      wait(MIN_SAVING_MS),
    ]);
    if (id === null) return;
    setForward(true);
    setStep('done');
  };

  const advance = () => {
    if (!ready) return;
    if (step === 'goal') setDraft(enterHabits(draft, suggestions, cap));
    setForward(true);
    setStep(nextStep(step));
    if (step === 'today') void save();
  };

  const close = () => {
    leaving.current = true;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const seeAnalysis = () => {
    leaving.current = true;
    if (router.canGoBack()) router.dismissTo('/analysis');
    else router.replace('/analysis');
  };

  const entering = (forward ? SlideInRight : SlideInLeft)
    .duration(SLIDE_MS)
    .reduceMotion(ReduceMotion.System);

  return (
    <YStack flex={1} bg="$background">
      <Stack.Screen
        options={{
          title: inputStep === null ? '' : t(`guide.header.${inputStep}`),
          headerBackVisible: inputStep !== null,
          gestureEnabled: step === 'goal',
        }}
      />

      <Aurora idle={inputStep !== null} />

      <YStack flex={1} pt={headerHeight}>
        {inputStep !== null && (
          <XStack
            justify="center"
            px={SPACING.screen}
            pt={SPACING.sectionPx * 2}
            pb={SPACING.section}
          >
            <GuideProgress step={inputStep} />
          </XStack>
        )}

        <Animated.View key={step} entering={entering} style={{ flex: 1 }}>
          {step === 'saving' && (
            <SavingStep
              error={isCompleting ? null : toMessage(error)}
              onRetry={() => void save()}
              onLeave={close}
            />
          )}
          {step === 'done' && (
            <DoneStep
              marked={Object.values(draft.today).some(
                (entry) => entry.done === true,
              )}
              onSeeAnalysis={seeAnalysis}
            />
          )}
          {inputStep !== null && (
            <FormScrollView padBottom={false} transparent>
              <YStack flex={1} justify="center" p={SPACING.screen}>
                {inputStep === 'goal' && (
                  <GoalStep draft={draft} onChange={setDraft} />
                )}
                {inputStep === 'habits' && (
                  <HabitsStep
                    draft={draft}
                    suggestions={suggestions}
                    onChange={setDraft}
                  />
                )}
                {inputStep === 'today' && (
                  <TodayStep draft={draft} onChange={setDraft} />
                )}
              </YStack>
            </FormScrollView>
          )}
        </Animated.View>

        {inputStep !== null && (
          <XStack
            items="center"
            justify="space-between"
            gap={SPACING.items}
            px={SPACING.screen}
            pt={SPACING.items}
            pb={insets.bottom + SPACING.sectionPx}
          >
            <Button size={BUTTON.primary} chromeless onPress={close}>
              {t('guide.cancel')}
            </Button>

            <Button
              size={BUTTON.primary}
              theme={ready ? 'accent' : undefined}
              shrink={1}
              disabled={!ready}
              onPress={advance}
              accessibilityState={{ disabled: !ready }}
            >
              {t('guide.next')}
            </Button>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}
