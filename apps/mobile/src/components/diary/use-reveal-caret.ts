import { useRef } from 'react';
import { findNodeHandle } from 'react-native';
import {
  useFocusedInputHandler,
  useKeyboardHandler,
  useWindowDimensions,
} from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';
import {
  measure,
  scrollTo,
  useAnimatedRef,
  useScrollOffset,
  useSharedValue,
} from 'react-native-reanimated';
import type { TamaguiElement } from 'tamagui';

/**
 * Keeps the caret of a note's body in view once the keyboard has opened.
 *
 * The body grows with its text inside a plain `ScrollView`, and Android
 * scrolls that view to the caret the moment the field is focused — before
 * the keyboard has risen and the screen above it has shrunk. The caret that
 * was on screen at focus is then under the keyboard. So when the keyboard
 * finishes opening, and only then, this measures where the caret now sits
 * and scrolls by exactly the part the keyboard covers.
 *
 * Only on the keyboard's arrival, never on a caret move or a keystroke: the
 * system already follows the caret while typing, and a second scroll on
 * every selection change is what made the old keyboard-aware scroll view
 * jitter.
 *
 * `clearance` is the room left between the caret and the keyboard, so the
 * line being written reads whole rather than touching the keys.
 */
export function useRevealCaret(clearance: number) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const bodyBox = useAnimatedRef<Animated.View>();
  const bodyRef = useRef<TamaguiElement>(null);
  const bodyTag = useSharedValue(-1);
  const caretInBody = useSharedValue(false);
  const caretBottom = useSharedValue(0);
  const scrollY = useScrollOffset(scrollRef);
  const { height: screenHeight } = useWindowDimensions();

  useFocusedInputHandler(
    {
      onSelectionChange: (event) => {
        'worklet';
        caretInBody.set(event.target === bodyTag.get());
        caretBottom.set(event.selection.end.y);
      },
    },
    [],
  );

  useKeyboardHandler(
    {
      onEnd: (event) => {
        'worklet';
        if (event.height <= 0 || !caretInBody.get()) return;

        const box = measure(bodyBox);
        if (box === null) return;

        const caret = box.pageY + caretBottom.get();
        const keyboardTop = screenHeight - event.height - clearance;
        if (caret <= keyboardTop) return;

        scrollTo(scrollRef, 0, scrollY.get() + caret - keyboardTop, true);
      },
    },
    [screenHeight, clearance],
  );

  // The keyboard reports the focused field by its native tag, so the body's
  // tag is what tells its caret apart from the tag input's above it.
  const onBodyLayout = () => {
    bodyTag.set(findNodeHandle(bodyRef.current as never) ?? -1);
  };

  return { scrollRef, bodyBox, bodyRef, onBodyLayout };
}
