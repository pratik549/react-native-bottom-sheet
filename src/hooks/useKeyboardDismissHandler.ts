import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardEventName,
  NativeEventSubscription,
  Platform
} from 'react-native';

export const useKeyboardDismissHandler = (
  action: (...args: any[]) => void,
  keyboardEvent: KeyboardEventName = 'keyboardDidHide',
) => {
  const [keyboardVisible, setVisibility] = useState(false);
  const keyboardWillHideListener = useRef<NativeEventSubscription | null>(null);

  const clearSubscription = () => {
    if (keyboardWillHideListener.current) {
      keyboardWillHideListener.current.remove();
      keyboardWillHideListener.current = null;
    }
  };

  let updatedAction = action;

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => setVisibility(true),
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => setVisibility(false),
      );

      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }
  }, []);

  if (Platform.OS === 'android') {
    updatedAction = (...args: any[]) => {
      Keyboard.dismiss();
      setTimeout(() => {
        action?.(...args);
      }, 100);
    };
  } else if (Platform.OS === 'ios') {
    updatedAction = (...args: any[]) => {
      if (keyboardVisible) {
        clearSubscription();
        keyboardWillHideListener.current = Keyboard.addListener(
          keyboardEvent,
          () => {
            clearSubscription();
            action?.(...args);
          },
        );
        Keyboard.dismiss();
      } else {
        action?.(...args);
      }
    };
  }

  return updatedAction;
};